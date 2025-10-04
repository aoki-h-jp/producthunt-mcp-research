/**
 * Sync All Function
 *
 * Synchronizes all data types from Product Hunt API to database.
 *
 * @fileoverview All data synchronization function
 * @author aoki-h-jp
 * @version 1.0.0
 */
import { Logger, AsyncResult, success, failure } from '@producthunt-mcp-research/shared';
import type { FetcherInstance } from '@producthunt-mcp-research/fetcher';
import type { OrchestratorRepository } from '../index.js';
import { syncPosts } from './sync-posts.js';
import { syncTopics } from './sync-topics.js';
import { syncCollections } from './sync-collections.js';
import type { SyncStats, SyncOptions } from '../types/index.js';
import { CursorManager } from '../utils/cursor-manager.js';

/**
 * Synchronizes all data (topics, collections, posts with comments) from Product Hunt API to database
 *
 * @param fetcher - Fetcher instance for API operations
 * @param repository - Repository wrapper for database operations
 * @param options - Sync options
 * @param logger - Logger instance
 * @returns Result with aggregated sync statistics
 *
 * @example
 * ```typescript
 * const result = await syncAll(fetcher, repository, { maxItems: 100 }, logger);
 * ```
 */
export async function syncAll(
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
    logger.info('Starting balanced synchronization with persistent cursor management using individual sync functions');

    // Initialize cursor manager
    const cursorManager = new CursorManager(logger);

    // Load existing cursors (always use saved cursors for automatic resumption)
    const savedCursors = await cursorManager.loadCursors();

    // Balanced sync with cursor management for resumability
    const batchSize = options.batchSize || 5;
    const maxItems = options.maxItems || 100;
    const itemsPerType = Math.floor(maxItems / 3); // Divide equally among 3 data types

    logger.info('Balanced sync configuration', {
      batchSize,
      maxItems,
      itemsPerType,
      strategy: 'persistent_cursor_managed_individual_sync',
      hasSavedCursors: !!savedCursors,
      autoResume: true
    });

    // Initialize cursors for each data type (always use saved cursors for automatic resumption)
    let topicsCursor: string | undefined = savedCursors?.topics;
    let collectionsCursor: string | undefined = savedCursors?.collections;
    let postsCursor: string | undefined = savedCursors?.posts;

    let topicsFetched = 0;
    let collectionsFetched = 0;
    let postsFetched = 0;

    // Continue until we've fetched enough of each type or hit rate limits
    while (topicsFetched < itemsPerType || collectionsFetched < itemsPerType || postsFetched < itemsPerType) {
      let hasProgress = false;

      // 1. Sync Topics using syncTopics function
      if (topicsFetched < itemsPerType && topicsCursor !== undefined) {
        logger.info('Syncing topics batch', {
          current: topicsFetched,
          target: itemsPerType,
          cursor: topicsCursor
        });

        const topicsResult = await syncTopics(fetcher, repository, {
          maxItems: Math.min(batchSize, itemsPerType - topicsFetched),
          batchSize: Math.min(batchSize, itemsPerType - topicsFetched),
        }, logger);

        if (topicsResult.success) {
          const topicsStats = topicsResult.data;
          topicsFetched += topicsStats.totalFetched;
          topicsCursor = topicsStats.nextCursor; // Update cursor for next iteration
          stats.totalFetched += topicsStats.totalFetched;
          stats.totalSaved += topicsStats.totalSaved;
          stats.errors += topicsStats.errors;
          hasProgress = true;

          // Save cursor to file
          await cursorManager.updateCursor('topics', topicsCursor);

          logger.info('Topics batch synced', {
            fetched: topicsStats.totalFetched,
            saved: topicsStats.totalSaved,
            total: topicsFetched,
            nextCursor: topicsCursor
          });
        } else {
          stats.errors++;
          logger.warn('Failed to sync topics batch', { error: topicsResult.error.message });
          topicsCursor = undefined; // Stop trying topics
        }
      }

      // 2. Sync Collections using syncCollections function
      if (collectionsFetched < itemsPerType && collectionsCursor !== undefined) {
        logger.info('Syncing collections batch', {
          current: collectionsFetched,
          target: itemsPerType,
          cursor: collectionsCursor
        });

        const collectionsResult = await syncCollections(fetcher, repository, {
          maxItems: Math.min(batchSize, itemsPerType - collectionsFetched),
          batchSize: Math.min(batchSize, itemsPerType - collectionsFetched),
        }, logger);

        if (collectionsResult.success) {
          const collectionsStats = collectionsResult.data;
          collectionsFetched += collectionsStats.totalFetched;
          collectionsCursor = collectionsStats.nextCursor; // Update cursor for next iteration
          stats.totalFetched += collectionsStats.totalFetched;
          stats.totalSaved += collectionsStats.totalSaved;
          stats.errors += collectionsStats.errors;
          hasProgress = true;

          // Save cursor to file
          await cursorManager.updateCursor('collections', collectionsCursor);

          logger.info('Collections batch synced', {
            fetched: collectionsStats.totalFetched,
            saved: collectionsStats.totalSaved,
            total: collectionsFetched,
            nextCursor: collectionsCursor
          });
        } else {
          stats.errors++;
          logger.warn('Failed to sync collections batch', { error: collectionsResult.error.message });
          collectionsCursor = undefined; // Stop trying collections
        }
      }

      // 3. Sync Posts using syncPosts function
      if (postsFetched < itemsPerType && postsCursor !== undefined) {
        logger.info('Syncing posts batch', {
          current: postsFetched,
          target: itemsPerType,
          cursor: postsCursor
        });

        const postsResult = await syncPosts(fetcher, repository, {
          maxItems: Math.min(batchSize, itemsPerType - postsFetched),
          batchSize: Math.min(batchSize, itemsPerType - postsFetched),
        }, logger);

        if (postsResult.success) {
          const postsStats = postsResult.data;
          postsFetched += postsStats.totalFetched;
          postsCursor = postsStats.nextCursor; // Update cursor for next iteration
          stats.totalFetched += postsStats.totalFetched;
          stats.totalSaved += postsStats.totalSaved;
          stats.errors += postsStats.errors;
          hasProgress = true;

          // Save cursor to file
          await cursorManager.updateCursor('posts', postsCursor);

          logger.info('Posts batch synced', {
            fetched: postsStats.totalFetched,
            saved: postsStats.totalSaved,
            total: postsFetched,
            nextCursor: postsCursor
          });
        } else {
          stats.errors++;
          logger.warn('Failed to sync posts batch', { error: postsResult.error.message });
          postsCursor = undefined; // Stop trying posts
        }
      }

      // If no progress was made in this round, break to avoid infinite loop
      if (!hasProgress) {
        logger.warn('No progress made in this round, stopping sync');
        break;
      }

      // Log current progress with cursors
      logger.info('Sync progress with cursors', {
        topics: {
          fetched: topicsFetched,
          target: itemsPerType,
          cursor: topicsCursor
        },
        collections: {
          fetched: collectionsFetched,
          target: itemsPerType,
          cursor: collectionsCursor
        },
        posts: {
          fetched: postsFetched,
          target: itemsPerType,
          cursor: postsCursor
        }
      });
    }

    // Complete
    stats.endTime = new Date();
    stats.duration = stats.endTime.getTime() - stats.startTime.getTime();

    logger.info('Full synchronization completed successfully', {
      stats,
      duration: stats.duration,
      cursorFile: cursorManager.getCursorFilePath(),
    });

    return success(stats);

  } catch (error) {
    stats.endTime = new Date();
    stats.duration = stats.endTime.getTime() - stats.startTime.getTime();
    stats.errors++;

    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error('Full synchronization failed', {
      error: errorMessage,
      stats,
      duration: stats.duration,
    });

    return failure(new Error(`Full synchronization failed: ${errorMessage}`));
  }
}
