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

    // 1. Fetch post data (including comments)
    const fetchResult = await fetcher.service.fetchPosts({
      maxItems: options.maxItems || 100,
      batchSize: options.batchSize || 10,
    });

    if (!fetchResult.success) {
      return failure(new Error(`Failed to fetch posts: ${fetchResult.error.message}`));
    }

    const postsData = fetchResult.data;
    const postNodes = postsData.data;
    stats.totalFetched = postsData.totalFetched;
    stats.nextCursor = postsData.nextCursor; // Store cursor for resuming
    stats.postsProcessed = postNodes.length;

    logger.info('Posts fetched successfully', {
      count: postNodes.length,
      totalFetched: stats.totalFetched,
      nextCursor: stats.nextCursor,
    });

    // 2. Convert PostNode → DbPost
    const mapper = new Mapper();
    const dbPosts = mapper.fromPostNodes(postNodes);

    logger.info('Posts converted to database format', {
      count: dbPosts.length,
    });

    // 3. Save to repository layer (comments are automatically included)
    const saveResult = await repository.repository.savePosts(dbPosts);

    if (saveResult.success) {
      stats.totalSaved = saveResult.data.total;

      logger.info('Posts saved successfully', {
        totalSaved: stats.totalSaved,
        inserted: saveResult.data.inserted,
        errors: saveResult.data.errors,
      });
    } else {
      stats.errors++;
      logger.warn('Failed to save posts', {
        error: saveResult.error.message,
      });
    }

    // 4. Update user statistics
    const uniqueUsers = new Set<string>();
    postNodes.forEach((post) => {
      if (post.user?.id) {
        uniqueUsers.add(post.user.id);
      }
    });
    stats.usersProcessed = uniqueUsers.size;

    // 5. Save cursor for resumption
    if (stats.nextCursor) {
      const cursorManager = new CursorManager(logger);
      await cursorManager.updateCursor('posts', stats.nextCursor);
      logger.info('Posts cursor saved for resumption', { cursor: stats.nextCursor });
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
