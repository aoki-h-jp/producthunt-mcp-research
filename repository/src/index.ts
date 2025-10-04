/**
 * Product Hunt Repository Package
 *
 * Unified repository for managing all Product Hunt entities in a single Qdrant collection.
 * Provides automatic embedding generation and type-safe data persistence.
 *
 * @fileoverview Main export file for the repository package
 * @author aoki-h-jp
 * @version 1.0.0
 */

// Export database client
export {
  DatabaseClient,
} from './client/database.js';
export type { DatabaseConfig } from './config/database.js';
export { loadDatabaseConfig } from './config/database.js';

// Export database schema
export {
  COLLECTION_SCHEMA,
  buildSchema,
  getEntityType,
  isEntityType,
  getEntityFields,
  type EntityType,
} from './schemas/schema.js';

// Export repository
export {
  Repository,
} from './repositories/repository.js';

// Export mapper
export {
  Mapper,
  mapPostToUnified,
  mapTopicToUnified,
  mapCollectionToUnified,
  mapTopicNodeToDb,
  mapCollectionNodeToDb,
  mapPostNodeToDb,
} from './mappers/mapper.js';

// Export types
export type {
  UnifiedPost,
  UnifiedTopic,
  UnifiedCollection,
  UnifiedEntity,
  PostFields,
  TopicFields,
  CollectionFields,
} from './types/unified.js';

// Export entity-specific database types
export type {
  DbPost,
  DbTopic,
  DbCollection,
  DbEntity,
} from './types/database.js';

// Export model configuration
export {
  SUPPORTED_MODELS,
  DEFAULT_MODEL,
  getModelConfig,
  isValidModel,
  getSupportedModels,
  getModelConfigWithDefault,
  type ModelConfig
} from './config/models.js';

// Export embedding service
export {
  EmbeddingService,
  type EmbeddingConfig,
  type EmbeddingResult,
} from './embeddings/index.js';
