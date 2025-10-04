/**
 * Sync Posts Function
 *
 * Synchronizes Product Hunt posts (including comments) from API to database.
 * Comments are nested within posts as a JSON array field.
 *
 * @fileoverview Posts synchronization function
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
 * Synchronizes posts from Product Hunt API to database
 *
 * @param fetcher - Fetcher instance for API operations
 * @param repository - Repository wrapper for database operations
 * @param options - Sync options
 * @param logger - Logger instance
 * @returns Result with post sync statistics
 *
 * @example
 * ```typescript
 * const result = await syncPosts(fetcher, repository, { maxItems: 100 }, logger);
 * ```
 */
export async function syncPosts(
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
    postsProcessed: 0,
    usersProcessed: 0,
  };

  try {
    logger.info('Starting posts synchronization', { options });

    let cursor = options.cursor ?? null;
    let hasMore = true;
    const maxItems = options.maxItems || 100;
    const batchSize = options.batchSize || 5;
    const mapper = new Mapper();
    const cursorManager = new CursorManager(logger);
    const uniqueUsers = new Set<string>();

    // Loop to fetch and save batches
    while (hasMore && stats.totalFetched < maxItems) {
      // 1. Fetch one batch
      const fetchResult = await fetcher.service.fetchPosts({
        batchSize: Math.min(batchSize, maxItems - stats.totalFetched),
        startCursor: cursor ?? undefined,
      });

      if (!fetchResult.success) {
        return failure(new Error(`Failed to fetch posts: ${fetchResult.error.message}`));
      }

      const postsData = fetchResult.data;
      const postNodes = postsData.data;
      
      if (postNodes.length === 0) {
        break;
      }

      logger.info('Posts batch fetched', {
        count: postNodes.length,
        cursor: cursor,
        nextCursor: postsData.nextCursor,
      });

      // 2. Convert PostNode → DbPost
      const dbPosts = mapper.fromPostNodes(postNodes);

      // 3. Save to repository layer (comments are automatically included)
      const saveResult = await repository.repository.savePosts(dbPosts);

      if (saveResult.success) {
        stats.totalSaved += saveResult.data.total;
        stats.totalFetched += postNodes.length;
        stats.postsProcessed = (stats.postsProcessed || 0) + postNodes.length;
        
        logger.info('Posts batch saved', {
          saved: saveResult.data.total,
          totalSaved: stats.totalSaved,
          totalFetched: stats.totalFetched,
        });
      } else {
        stats.errors++;
        logger.warn('Failed to save posts batch', {
          error: saveResult.error.message,
        });
      }

      // 4. Update user statistics
      postNodes.forEach((post) => {
        if (post.user?.id) {
          uniqueUsers.add(post.user.id);
        }
      });
      stats.usersProcessed = uniqueUsers.size;

      // 5. Update cursor and save for resumption
      cursor = postsData.nextCursor ?? null;
      hasMore = postsData.hasMore;
      stats.nextCursor = cursor ?? undefined;
      
      // Save cursor after each batch
      if (cursor) {
        await cursorManager.updateCursor('posts', cursor);
        logger.info('Posts cursor saved', { cursor });
      }
    }

    // Complete
    stats.endTime = new Date();
    stats.duration = stats.endTime.getTime() - stats.startTime.getTime();

    logger.info('Posts synchronization completed successfully', {
      stats,
      duration: stats.duration,
    });

    return success(stats);

  } catch (error) {
    stats.endTime = new Date();
    stats.duration = stats.endTime.getTime() - stats.startTime.getTime();
    stats.errors++;

    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error('Posts synchronization failed', {
      error: errorMessage,
      stats,
    });

    return failure(new Error(`Posts synchronization failed: ${errorMessage}`));
  }
}
