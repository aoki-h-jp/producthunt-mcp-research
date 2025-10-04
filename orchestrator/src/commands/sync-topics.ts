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

    // 1. Fetch all topic data
    const fetchResult = await fetcher.service.fetchTopics({
      maxItems: options.maxItems,
      batchSize: options.batchSize,
    });

    if (!fetchResult.success) {
      return failure(new Error(`Failed to fetch topics: ${fetchResult.error.message}`));
    }

    const topicsData = fetchResult.data;
    const topicNodes = topicsData.data;
    stats.totalFetched = topicsData.totalFetched;
    stats.nextCursor = topicsData.nextCursor; // Store cursor for resuming

    logger.info('Topics fetched successfully', {
      count: topicNodes.length,
      totalFetched: stats.totalFetched,
      nextCursor: stats.nextCursor,
    });

    // 2. Convert TopicNode → DbTopic
    const mapper = new Mapper();
    const dbTopics = mapper.fromTopicNodes(topicNodes);

    logger.info('Topics converted to database format', {
      count: dbTopics.length,
    });

    // 3. Save to repository layer
    const saveResult = await repository.repository.saveTopics(dbTopics);

    if (saveResult.success) {
      stats.totalSaved = saveResult.data.total;

      logger.info('Topics saved successfully', {
        totalSaved: stats.totalSaved,
        inserted: saveResult.data.inserted,
        errors: saveResult.data.errors,
      });
    } else {
      stats.errors++;
      logger.warn('Failed to save topics', {
        error: saveResult.error.message,
      });
    }

    // 4. Save cursor for resumption
    if (stats.nextCursor) {
      const cursorManager = new CursorManager(logger);
      await cursorManager.updateCursor('topics', stats.nextCursor);
      logger.info('Topics cursor saved for resumption', { cursor: stats.nextCursor });
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
