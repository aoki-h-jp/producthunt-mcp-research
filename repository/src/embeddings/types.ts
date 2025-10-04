/**
 * Embedding types and interfaces
 *
 * @fileoverview Type definitions for embedding service
 * @author aoki-h-jp
 * @version 1.0.0
 */

/**
 * Embedding service configuration
 */
export interface EmbeddingConfig {
  /** Model name (default: 'Xenova/all-MiniLM-L6-v2') */
  modelName?: string;
  /** Vector dimensions (default: 384) */
  dimensions?: number;
}

/**
 * Content to be embedded
 */
export interface EmbeddableContent {
  /** Text content */
  text: string;
  /** Optional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Embedding generation result
 */
export interface EmbeddingResult {
  /** Embedding vector */
  embedding: number[];
  /** Content hash (SHA-256) */
  contentHash: string;
  /** Original text */
  text: string;
}

