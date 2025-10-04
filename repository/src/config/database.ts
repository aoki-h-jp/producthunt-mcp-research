/**
 * Database configuration
 *
 * Manages Qdrant database connection settings and performance settings.
 * Provides configuration loading from environment variables, validation, and default values.
 *
 * @fileoverview Database configuration management for Qdrant
 * @author aoki-h-jp
 * @version 1.0.0
 *
 * @example
 * ```typescript
 * import { loadDatabaseConfig, validateDatabaseConfig } from './config/database.js';
 *
 * // Load configuration from environment variables
 * const config = loadDatabaseConfig();
 *
 * // Validate configuration
 * const validatedConfig = validateDatabaseConfig(rawConfig);
 * ```
 */
import { z } from 'zod';
import { getModelConfigWithDefault, DEFAULT_MODEL } from './models.js';

/**
 * Qdrant connection URL (local Docker instance only)
 * This is a constant as the tool is designed for local-only use per Product Hunt API terms.
 */
export const QDRANT_URL = 'http://localhost:6333';

/**
 * Collection name for Product Hunt data
 * This is a constant as the tool uses a unified collection design.
 */
export const QDRANT_COLLECTION_NAME = 'producthunt';

/**
 * Batch size for database operations
 * Optimized for memory usage and performance balance.
 */
export const QDRANT_BATCH_SIZE = 1000;

/**
 * Database configuration schema
 *
 * Provides type safety and validation for Qdrant configuration.
 * Now uses model-based configuration for consistency.
 */
export const DatabaseConfigSchema = z.object({
  /**
   * Qdrant instance URL (local only)
   *
   * Fixed: http://localhost:6333
   */
  url: z.string().url().default(QDRANT_URL),

  /**
   * Collection name (fixed)
   *
   * Fixed: producthunt
   */
  collectionName: z.string().min(1).default(QDRANT_COLLECTION_NAME),


  /**
   * Batch size (fixed)
   *
   * Fixed: 1000 records (optimized for memory usage and performance)
   */
  batchSize: z.number().default(QDRANT_BATCH_SIZE),

  /**
   * Embedding model name
   *
   * Determines vector dimensions and distance metric automatically.
   * Supported models: Xenova/all-MiniLM-L6-v2, Xenova/all-mpnet-base-v2, etc.
   * Default: Xenova/all-MiniLM-L6-v2 (384 dimensions, Cosine distance)
   */
  embeddingModel: z.string().default(DEFAULT_MODEL),

});

export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;

/**
 * Load database configuration from environment variables
 */
export function loadDatabaseConfig(): DatabaseConfig {
  const rawConfig = {
    url: QDRANT_URL, // Always use local URL
    collectionName: QDRANT_COLLECTION_NAME, // Always use unified collection
    batchSize: QDRANT_BATCH_SIZE, // Always use optimized batch size
    embeddingModel: process.env.EMBEDDING_MODEL || DEFAULT_MODEL,
  };

  // Remove undefined values
  const cleanedConfig = Object.fromEntries(
    Object.entries(rawConfig).filter(([, value]) => value !== undefined)
  );

  return DatabaseConfigSchema.parse(cleanedConfig);
}

/**
 * Validate database configuration
 */
export function validateDatabaseConfig(config: unknown): DatabaseConfig {
  return DatabaseConfigSchema.parse(config);
}

/**
 * Default configuration
 */
export const DEFAULT_DATABASE_CONFIG: DatabaseConfig = {
  url: QDRANT_URL,
  collectionName: QDRANT_COLLECTION_NAME,
  batchSize: QDRANT_BATCH_SIZE,
  embeddingModel: DEFAULT_MODEL,
};

/**
 * Get model-specific configuration
 * 
 * @param config - Database configuration
 * @returns Model configuration with dimensions and distance
 */
export function getModelSpecificConfig(config: DatabaseConfig) {
  const modelConfig = getModelConfigWithDefault(config.embeddingModel);
  return {
    ...config,
    vectorDimensions: modelConfig.dimensions,
    distance: modelConfig.distance,
  };
}
