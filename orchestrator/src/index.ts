/**
 * Orchestrator Module
 *
 * Data orchestration layer for Product Hunt ingestion. Provides simple sync functions
 * to coordinate data fetching and persistence between fetcher and repository layers.
 *
 * @fileoverview Main orchestrator module exports
 * @author aoki-h-jp
 * @version 1.0.0
 *
 * @example
 * ```typescript
 * import { syncAll } from '@producthunt-mcp-research/orchestrator';
 * import { createFetcher } from '@producthunt-mcp-research/fetcher';
 * import {
 *   DatabaseClient,
 *   PostsRepository,
 *   TopicsRepository,
 *   CollectionsRepository,
 *   loadDatabaseConfig,
 *   EmbeddingService
 * } from '@producthunt-mcp-research/repository';
 * import { Logger } from '@producthunt-mcp-research/shared';
 *
 * const logger = new Logger({ level: 'info', service: 'orchestrator' });
 *
 * // Create dependencies
 * const fetcher = createFetcher();
 * const dbConfig = loadDatabaseConfig();
 * const client = new DatabaseClient(dbConfig, logger);
 * await client.connect();
 *
 * // Create embedding service for automatic embedding generation
 * const embeddingService = new EmbeddingService({
 *   modelName: 'Xenova/all-MiniLM-L6-v2',
 *   dimensions: dbConfig.vectorDimensions,
 * }, logger);
 * await embeddingService.initialize();
 *
 * // Create repository with embedding service
 * const repository = {
 *   client,
 *   repositories: {
 *     posts: new PostsRepository(client, logger, dbConfig, embeddingService),
 *     topics: new TopicsRepository(client, logger, dbConfig, embeddingService),
 *     collections: new CollectionsRepository(client, logger, dbConfig, embeddingService),
 *   },
 * };
 *
 * // Sync all data
 * const result = await syncAll(fetcher, repository, { maxItems: 100 }, logger);
 * ```
 */

import type { DatabaseClient, Repository } from '@producthunt-mcp-research/repository';

/**
 * Repository wrapper for orchestrator
 *
 * Wrapper around repository layer components for orchestrator use.
 *
 * @interface OrchestratorRepository
 */
export interface OrchestratorRepository {
  client: DatabaseClient;
  repository: Repository;
}

// Sync functions
export { syncPosts } from './commands/sync-posts.js';
export { syncTopics } from './commands/sync-topics.js';
export { syncCollections } from './commands/sync-collections.js';
export { syncAll } from './commands/sync-all.js';

// Setup functions
export { setupDatabase, isDatabaseInitialized } from './commands/setup-database.js';

// Type definitions
export * from './types/index.js';
