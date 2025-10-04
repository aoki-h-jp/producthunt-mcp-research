/**
 * Sync Topics Function
 *
 * Synchronizes Product Hunt topics from API to database.
 *
 * @fileoverview Topics synchronization function
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
 * Synchronizes all topics from Product Hunt API to database
 *
 * @param fetcher - Fetcher instance for API operations
 * @param repository - Repository wrapper for database operations
 * @param options - Sync options
 * @param logger - Logger instance
 * @returns Result with sync statistics
 *
 * @example
 * ```typescript
 * const result = await syncTopics(fetcher, repository, {}, logger);
 * ```
 */
export async function syncTopics(
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
    logger.info('Starting topics synchronization');

    let cursor = options.cursor ?? null;
    let hasMore = true;
    const maxItems = options.maxItems || 100000;
    const batchSize = options.batchSize || 10;
    const mapper = new Mapper();
    const cursorManager = new CursorManager(logger);

    // Loop to fetch and save batches
    while (hasMore && stats.totalFetched < maxItems) {
      // 1. Fetch one batch
      const fetchResult = await fetcher.service.fetchTopics({
        batchSize: Math.min(batchSize, maxItems - stats.totalFetched),
        startCursor: cursor ?? undefined,
      });

      if (!fetchResult.success) {
        return failure(new Error(`Failed to fetch topics: ${fetchResult.error.message}`));
      }

      const topicsData = fetchResult.data;
      const topicNodes = topicsData.data;
      
      if (topicNodes.length === 0) {
        break;
      }

      logger.info('Topics batch fetched', {
        count: topicNodes.length,
        cursor: cursor,
        nextCursor: topicsData.nextCursor,
      });

      // 2. Convert TopicNode → DbTopic
      const dbTopics = mapper.fromTopicNodes(topicNodes);

      // 3. Save to repository layer
      const saveResult = await repository.repository.saveTopics(dbTopics);

      if (saveResult.success) {
        stats.totalSaved += saveResult.data.total;
        stats.totalFetched += topicNodes.length;
        
        logger.info('Topics batch saved', {
          saved: saveResult.data.total,
          totalSaved: stats.totalSaved,
          totalFetched: stats.totalFetched,
        });
      } else {
        stats.errors++;
        logger.warn('Failed to save topics batch', {
          error: saveResult.error.message,
        });
      }

      // 4. Update cursor and save for resumption
      cursor = topicsData.nextCursor ?? null;
      hasMore = topicsData.hasMore;
      stats.nextCursor = cursor ?? undefined;
      
      // Save cursor after each batch
      if (cursor) {
        await cursorManager.updateCursor('topics', cursor);
        logger.info('Topics cursor saved', { cursor });
      }
    }

    // Complete
    stats.endTime = new Date();
    stats.duration = stats.endTime.getTime() - stats.startTime.getTime();

    logger.info('Topics synchronization completed successfully', {
      stats,
      duration: stats.duration,
    });

    return success(stats);

  } catch (error) {
    stats.endTime = new Date();
    stats.duration = stats.endTime.getTime() - stats.startTime.getTime();
    stats.errors++;

    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error('Topics synchronization failed', {
      error: errorMessage,
      stats,
    });

    return failure(new Error(`Topics synchronization failed: ${errorMessage}`));
  }
}
