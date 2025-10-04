/**
 * Sync Collections Function
 *
 * Synchronizes Product Hunt collections from API to database.
 *
 * @fileoverview Collections synchronization function
 * @author aoki-h-jp
 * @version 1.0.0
 */
import { Logger, AsyncResult, success, failure } from '@producthunt-mcp-research/shared';
import type { FetcherInstance } from '@producthunt-mcp-research/fetcher';
import type { OrchestratorRepository } from '../index.js';
import type { SyncStats, SyncOptions } from '../types/index.js';
import { Mapper } from '@producthunt-mcp-research/repository';
import { CursorManager } from '../utils/cursor-manager.js';

/**
 * Synchronizes all collections from Product Hunt API to database
 *
 * @param fetcher - Fetcher instance for API operations
 * @param repository - Repository wrapper for database operations
 * @param options - Sync options
 * @param logger - Logger instance
 * @returns Result with sync statistics
 *
 * @example
 * ```typescript
 * const result = await syncCollections(fetcher, repository, {}, logger);
 * ```
 */
export async function syncCollections(
  fetcher: FetcherInstance,
  repository: OrchestratorRepository,
  options: SyncOptions = {},
  logger: Logger
): AsyncResult<SyncStats, Error> {
  const startTime = new Date();
  const stats: SyncStats = {
    totalFetched: 0,
    totalSaved: 0,
    errors: 0,
    startTime,
  };

  try {
    logger.info('Starting collections synchronization');

    // 1. Fetch all collection data
    const fetchResult = await fetcher.service.fetchCollections({
      maxItems: options.maxItems,
      batchSize: options.batchSize,
    });

    if (!fetchResult.success) {
      return failure(new Error(`Failed to fetch collections: ${fetchResult.error.message}`));
    }

    const collectionsData = fetchResult.data;
    const collectionNodes = collectionsData.data;
    stats.totalFetched = collectionsData.totalFetched;
    stats.nextCursor = collectionsData.nextCursor; // Store cursor for resuming

    logger.info('Collections fetched successfully', {
      count: collectionNodes.length,
      totalFetched: stats.totalFetched,
      nextCursor: stats.nextCursor,
    });

    // 2. Convert CollectionNode → DbCollection
    const mapper = new Mapper();
    const dbCollections = mapper.fromCollectionNodes(collectionNodes);

    logger.info('Collections converted to database format', {
      count: dbCollections.length,
    });

    // 3. Save to repository layer
    const saveResult = await repository.repository.saveCollections(dbCollections);

    if (saveResult.success) {
      stats.totalSaved = saveResult.data.total;

      logger.info('Collections saved successfully', {
        totalSaved: stats.totalSaved,
        inserted: saveResult.data.inserted,
        errors: saveResult.data.errors,
      });
    } else {
      stats.errors++;
      logger.warn('Failed to save collections', {
        error: saveResult.error.message,
      });
    }

    // 4. Save cursor for resumption
    if (stats.nextCursor) {
      const cursorManager = new CursorManager(logger);
      await cursorManager.updateCursor('collections', stats.nextCursor);
      logger.info('Collections cursor saved for resumption', { cursor: stats.nextCursor });
    }

    // Complete
    stats.endTime = new Date();
    stats.duration = stats.endTime.getTime() - stats.startTime.getTime();

    logger.info('Collections synchronization completed successfully', {
      stats,
      duration: stats.duration,
    });

    return success(stats);

  } catch (error) {
    stats.endTime = new Date();
    stats.duration = stats.endTime.getTime() - stats.startTime.getTime();
    stats.errors++;

    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error('Collections synchronization failed', {
      error: errorMessage,
      stats,
    });

    return failure(new Error(`Collections synchronization failed: ${errorMessage}`));
  }
}
