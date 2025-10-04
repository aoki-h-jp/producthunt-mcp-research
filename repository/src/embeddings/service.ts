/**
 * Embedding Service
 *
 * Provides text embedding generation using Transformers.js.
 * Uses the same model as Qdrant MCP Server for consistency.
 *
 * @fileoverview Free, offline text embedding generation
 * @author aoki-h-jp
 * @version 1.0.0
 *
 * @example
 * ```typescript
 * import { EmbeddingService } from '@producthunt-mcp-research/repository';
 *
 * const service = new EmbeddingService({}, logger);
 * await service.initialize();
 *
 * const embedding = await service.generateEmbedding('Product Hunt is amazing');
 * const embeddings = await service.generateEmbeddings(['Text 1', 'Text 2']);
 * ```
 */
import { pipeline } from '@xenova/transformers';
import { createHash } from 'crypto';
import { Logger, AsyncResult, success, failure } from '@producthunt-mcp-research/shared';
import type { EmbeddingConfig, EmbeddingResult } from './types.js';
import { getModelConfigWithDefault, DEFAULT_MODEL } from '../config/models.js';

/**
 * Default model configuration
 * Uses the same model as Qdrant MCP Server (sentence-transformers/all-MiniLM-L6-v2)
 */

/**
 * Embedding Service
 *
 * Generates text embeddings using Transformers.js with zero-shot learning.
 * Completely free and works offline after initial model download.
 */
/**
 * Transformers.js pipeline type (simplified)
 */
interface TransformersPipeline {
  (text: string, options: { pooling: string; normalize: boolean }): Promise<{ data: Float32Array }>;
}

export class EmbeddingService {
  private model: TransformersPipeline | null = null;
  private initialized = false;
  private readonly modelName: string;
  private readonly dimensions: number;
  private logger: Logger;

  constructor(config: EmbeddingConfig = {}, logger: Logger) {
    const modelName = config.modelName ?? DEFAULT_MODEL;
    const modelConfig = getModelConfigWithDefault(modelName);
    
    this.modelName = modelConfig.name;
    this.dimensions = modelConfig.dimensions;
    this.logger = logger.child({ component: 'EmbeddingService' });
  }

  /**
   * Initialize the embedding model
   *
   * Downloads the model on first run (~50MB for all-MiniLM-L6-v2).
   * Subsequent runs load from cache.
   */
  async initialize(): AsyncResult<void, Error> {
    if (this.initialized) {
      return success(undefined);
    }

    try {
      this.logger.info('Initializing embedding model', {
        model: this.modelName,
        dimensions: this.dimensions,
      });

      // Load the feature extraction pipeline
      this.model = (await pipeline('feature-extraction', this.modelName)) as TransformersPipeline;
      this.initialized = true;

      this.logger.info('Embedding model initialized successfully');
      return success(undefined);
    } catch (error) {
      this.logger.error('Failed to initialize embedding model', {
        error: error instanceof Error ? error.message : String(error),
      });
      return failure(new Error(`Failed to initialize embedding model: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  /**
   * Generate embedding for a single text
   *
   * @param text - Input text
   * @returns Embedding vector (normalized)
   */
  async generateEmbedding(text: string): AsyncResult<number[], Error> {
    await this.initialize();

    if (!this.model) {
      return failure(new Error('Embedding model not initialized'));
    }

    if (!text || text.trim().length === 0) {
      this.logger.warn('Empty text provided for embedding generation');
      // Return zero vector for empty text
      return success(new Array(this.dimensions).fill(0));
    }

    try {
      const output = await this.model(text, {
        pooling: 'mean',
        normalize: true,
      });

      const embedding = Array.from(output.data) as number[];

      // Validate dimensions
      if (embedding.length !== this.dimensions) {
        throw new Error(
          `Embedding dimension mismatch: expected ${this.dimensions}, got ${embedding.length}`
        );
      }

      return success(embedding);
    } catch (error) {
      this.logger.error('Failed to generate embedding', {
        error: error instanceof Error ? error.message : String(error),
        textLength: text.length,
      });
      return failure(new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  /**
   * Generate embeddings for multiple texts (batch processing)
   *
   * @param texts - Array of input texts
   * @returns Array of embedding vectors
   */
  async generateEmbeddings(texts: string[]): AsyncResult<number[][], Error> {
    await this.initialize();

    if (texts.length === 0) {
      return success([]);
    }

    this.logger.debug('Generating embeddings for batch', {
      count: texts.length,
    });

    try {
      // Process all texts in parallel
      const embeddingResults = await Promise.all(
        texts.map((text) => this.generateEmbedding(text))
      );

      // Check for any failures
      const failures = embeddingResults.filter(result => !result.success);
      if (failures.length > 0) {
        const firstFailure = failures[0] as { success: false; error: Error };
        return failure(firstFailure.error);
      }

      // Extract successful embeddings
      const embeddings = embeddingResults.map(result => (result as { success: true; data: number[] }).data);

      this.logger.debug('Batch embeddings generated successfully', {
        count: embeddings.length,
      });

      return success(embeddings);
    } catch (error) {
      this.logger.error('Failed to generate batch embeddings', {
        error: error instanceof Error ? error.message : String(error),
        count: texts.length,
      });
      return failure(new Error(`Failed to generate batch embeddings: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  /**
   * Generate embeddings in chunks (for very large datasets)
   *
   * @param texts - Array of input texts
   * @param chunkSize - Number of texts per chunk (default: 100)
   * @returns Array of embedding vectors
   */
  async generateEmbeddingsInChunks(
    texts: string[],
    chunkSize = 100
  ): AsyncResult<number[][], Error> {
    await this.initialize();

    if (texts.length === 0) {
      return success([]);
    }

    this.logger.info('Generating embeddings in chunks', {
      totalTexts: texts.length,
      chunkSize,
      totalChunks: Math.ceil(texts.length / chunkSize),
    });

    const results: number[][] = [];

    for (let i = 0; i < texts.length; i += chunkSize) {
      const chunk = texts.slice(i, i + chunkSize);
      const chunkNumber = Math.floor(i / chunkSize) + 1;
      const totalChunks = Math.ceil(texts.length / chunkSize);

      this.logger.debug(`Processing chunk ${chunkNumber}/${totalChunks}`, {
        chunkSize: chunk.length,
      });

      const embeddingsResult = await this.generateEmbeddings(chunk);
      if (!embeddingsResult.success) {
        return failure(embeddingsResult.error);
      }
      results.push(...embeddingsResult.data);
    }

    this.logger.info('All chunks processed successfully', {
      totalEmbeddings: results.length,
    });

    return success(results);
  }

  /**
   * Generate embedding with content hash
   *
   * @param text - Input text
   * @returns Embedding result with hash
   */
  async generateEmbeddingWithHash(text: string): AsyncResult<EmbeddingResult, Error> {
    const embeddingResult = await this.generateEmbedding(text);
    if (!embeddingResult.success) {
      return failure(embeddingResult.error);
    }

    const contentHash = this.generateContentHash(text);

    return success({
      embedding: embeddingResult.data,
      contentHash,
      text,
    });
  }

  /**
   * Generate content hash (SHA-256)
   *
   * Used to detect content changes and avoid regenerating embeddings.
   *
   * @param text - Input text
   * @returns SHA-256 hash (hex)
   */
  generateContentHash(text: string): string {
    return createHash('sha256').update(text).digest('hex');
  }

  /**
   * Check if model is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get model information
   */
  getModelInfo() {
    return {
      modelName: this.modelName,
      dimensions: this.dimensions,
      initialized: this.initialized,
    };
  }
}

