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

    let cursor = options.cursor ?? null;
    let hasMore = true;
    const maxItems = options.maxItems || 100000;
    const batchSize = options.batchSize || 10;
    const mapper = new Mapper();
    const cursorManager = new CursorManager(logger);

    // Loop to fetch and save batches
    while (hasMore && stats.totalFetched < maxItems) {
      // 1. Fetch one batch
      const fetchResult = await fetcher.service.fetchCollections({
        batchSize: Math.min(batchSize, maxItems - stats.totalFetched),
        startCursor: cursor ?? undefined,
      });

      if (!fetchResult.success) {
        return failure(new Error(`Failed to fetch collections: ${fetchResult.error.message}`));
      }

      const collectionsData = fetchResult.data;
      const collectionNodes = collectionsData.data;
      
      if (collectionNodes.length === 0) {
        break;
      }

      logger.info('Collections batch fetched', {
        count: collectionNodes.length,
        cursor: cursor,
        nextCursor: collectionsData.nextCursor,
      });

      // 2. Convert CollectionNode → DbCollection
      const dbCollections = mapper.fromCollectionNodes(collectionNodes);

      // 3. Save to repository layer
      const saveResult = await repository.repository.saveCollections(dbCollections);

      if (saveResult.success) {
        stats.totalSaved += saveResult.data.total;
        stats.totalFetched += collectionNodes.length;
        
        logger.info('Collections batch saved', {
          saved: saveResult.data.total,
          totalSaved: stats.totalSaved,
          totalFetched: stats.totalFetched,
        });
      } else {
        stats.errors++;
        logger.warn('Failed to save collections batch', {
          error: saveResult.error.message,
        });
      }

      // 4. Update cursor and save for resumption
      cursor = collectionsData.nextCursor ?? null;
      hasMore = collectionsData.hasMore;
      stats.nextCursor = cursor ?? undefined;
      
      // Save cursor after each batch
      if (cursor) {
        await cursorManager.updateCursor('collections', cursor);
        logger.info('Collections cursor saved', { cursor });
      }
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
