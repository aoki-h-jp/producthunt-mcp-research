/**
 * Database Setup Function
 *
 * Initializes the Qdrant collection for storing all Product Hunt entities.
 *
 * @fileoverview Database initialization function for Qdrant collection
 * @author aoki-h-jp
 * @version 1.0.0
 */
import { Logger, AsyncResult, success, failure } from '@producthunt-mcp-research/shared';
import type { DatabaseClient, DatabaseConfig } from '@producthunt-mcp-research/repository';
import { buildSchema } from '@producthunt-mcp-research/repository';

/**
 * Initialize Qdrant collection
 *
 * Creates the collection (producthunt) if it doesn't exist.
 * This collection will store all Product Hunt entities (posts, topics, collections).
 *
 * @param client - Database client instance
 * @param config - Database configuration
 * @param logger - Logger instance
 * @returns Result indicating success or failure
 *
 * @example
 * ```typescript
 * const result = await setupDatabase(client, config, logger);
 * if (result.success) {
 *   console.log('Database initialized successfully');
 * } else {
 *   console.error('Database initialization failed:', result.error.message);
 * }
 * ```
 */
export async function setupDatabase(
  client: DatabaseClient,
  config: DatabaseConfig,
  logger: Logger
): AsyncResult<void, Error> {
  try {
    logger.info('Initializing Qdrant collection');

    const collectionName = 'producthunt';

    // Check if collection already exists
    const existsResult = await client.collectionExists(collectionName);
    if (existsResult.success && existsResult.data) {
      logger.info('Collection already exists, skipping', { collectionName });
      return success(undefined);
    }

    // Build schema with vector config from database config
    const schema = buildSchema(config);

    // Create collection
    logger.info('Creating collection', {
      collectionName,
      vectorSize: schema.vectorSize,
      distance: schema.distance,
      entityTypes: ['post', 'topic', 'collection']
    });

    const createResult = await client.createCollection(schema);
    if (!createResult.success) {
      logger.error('Failed to create collection', {
        collectionName,
        error: createResult.error.message
      });
      return failure(new Error(`Failed to create collection '${collectionName}': ${createResult.error.message}`));
    }

    logger.info('Collection created successfully', {
      collectionName,
      indexedFields: Object.entries(schema.payloadSchema)
        .filter(([, fs]) => fs.indexed)
        .map(([fn]) => fn),
      entityTypes: ['post', 'topic', 'collection']
    });

    logger.info('Database initialization completed successfully');
    return success(undefined);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Database initialization failed', { error: errorMessage });
    return failure(new Error(`Database initialization failed: ${errorMessage}`));
  }
}

/**
 * Check if database is properly initialized
 *
 * Verifies that the collection exists in Qdrant.
 *
 * @param client - Database client instance
 * @param logger - Logger instance
 * @returns Result indicating whether database is initialized
 *
 * @example
 * ```typescript
 * const result = await isDatabaseInitialized(client, logger);
 * if (result.success && result.data) {
 *   console.log('Database is properly initialized');
 * } else {
 *   console.log('Database needs initialization');
 * }
 * ```
 */
export async function isDatabaseInitialized(
  client: DatabaseClient,
  logger: Logger
): AsyncResult<boolean, Error> {
  try {
    logger.debug('Checking database initialization status');

    const collectionName = 'producthunt';
    const existsResult = await client.collectionExists(collectionName);

    if (!existsResult.success) {
      logger.error('Failed to check collection existence', {
        collectionName,
        error: existsResult.error.message
      });
      return failure(existsResult.error);
    }

    if (!existsResult.data) {
      logger.debug('Collection does not exist', { collectionName });
      return success(false);
    }

    logger.debug('Collection exists');
    return success(true);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to check database initialization', { error: errorMessage });
    return failure(new Error(`Failed to check database initialization: ${errorMessage}`));
  }
}
