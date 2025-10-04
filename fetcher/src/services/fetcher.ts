/**
 * Product Hunt Data Fetching Service
 *
 * High-level service for fetching data from the Product Hunt API with built-in
 * pagination, batching, and error handling. This service provides a simplified
 * interface for common data fetching operations.
 *
 * @fileoverview High-level data fetching service for Product Hunt API
 * @author aoki-h-jp
 * @version 1.0.0
 */
import {
  AsyncResult,
  Logger,
  success,
  failure,
} from '@producthunt-mcp-research/shared';
import { ProductHuntClient } from '../clients/product-hunt.js';
import type {
  GetTopicsQuery,
  GetTopicsQueryVariables,
  GetCollectionsQuery,
  GetCollectionsQueryVariables,
  GetPostsQuery,
  GetPostsQueryVariables,
} from '../generated/graphql.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Extracted node types from GraphQL responses for easier usage
 * These represent the actual data objects returned by the API
 */

/**
 * Individual topic node from topics query
 * @example
 * ```typescript
 * const topics = await fetcher.service.fetchTopics();
 * topics.data.forEach((topic: TopicNode) => {
 *   console.log(topic.name, topic.description);
 * });
 * ```
 */
export type TopicNode = GetTopicsQuery['topics']['edges'][0]['node'];

/**
 * Individual collection node from collections query
 * @example
 * ```typescript
 * const collections = await fetcher.service.fetchCollections();
 * collections.data.forEach((collection: CollectionNode) => {
 *   console.log(collection.name, collection.description);
 * });
 * ```
 */
export type CollectionNode = GetCollectionsQuery['collections']['edges'][0]['node'];

/**
 * Individual post node from posts query
 * @example
 * ```typescript
 * const posts = await fetcher.service.fetchPosts();
 * posts.data.forEach((post: PostNode) => {
 *   console.log(post.name, post.tagline);
 * });
 * ```
 */
export type PostNode = GetPostsQuery['posts']['edges'][0]['node'];


// ============================================================================
// INTERFACE DEFINITIONS
// ============================================================================

/**
 * Result of a data fetching operation
 *
 * @interface FetchResult
 * @template T - Type of data items being fetched
 * @property {T[]} data - Array of fetched data items
 * @property {boolean} hasMore - Whether there are more items available for fetching
 * @property {string} [nextCursor] - Cursor for fetching the next page of data
 * @property {number} totalFetched - Total number of items fetched in this operation
 *
 * @example
 * ```typescript
 * const result = await fetcher.service.fetchPosts({ maxItems: 50 });
 * if (result.success) {
 *   console.log(`Fetched ${result.data.totalFetched} posts`);
 *   console.log(`Has more: ${result.data.hasMore}`);
 *   console.log(`Next cursor: ${result.data.nextCursor}`);
 * }
 * ```
 */
export interface FetchResult<T> {
  /** Array of fetched data items */
  data: T[];
  /** Whether there are more items available for fetching */
  hasMore: boolean;
  /** Cursor for fetching the next page of data */
  nextCursor?: string | undefined;
  /** Total number of items fetched in this operation */
  totalFetched: number;
}

/**
 * Options for data fetching operations
 *
 * @interface FetchOptions
 * @property {number} [maxItems=100] - Maximum number of items to fetch
 * @property {number} [batchSize=10] - Number of items to fetch per API request
 * @property {string} [startCursor] - Cursor to start fetching from (for pagination)
 * @property {boolean} [unlimited=false] - Whether to fetch unlimited items (ignores maxItems)
 *
 * @example
 * ```typescript
 * // Basic usage
 * const posts = await fetcher.service.fetchPosts({ maxItems: 50 });
 *
 * // With pagination
 * const posts = await fetcher.service.fetchPosts({
 *   maxItems: 100,
 *   startCursor: 'cursor-string'
 * });
 *
 * // Unlimited fetching (use with caution)
 * const posts = await fetcher.service.fetchPosts({ unlimited: true });
 * ```
 */
export interface FetchOptions {
  /** Maximum number of items to fetch (default: 100) */
  maxItems?: number | undefined;
  /** Number of items to fetch per API request (default: 10) */
  batchSize?: number | undefined;
  /** Cursor to start fetching from (for pagination) */
  startCursor?: string | undefined;
  /** Whether to fetch unlimited items (ignores maxItems) */
  unlimited?: boolean | undefined;
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

/**
 * High-level data fetching service for Product Hunt API
 *
 * This service provides a simplified interface for fetching data from the Product Hunt API
 * with built-in pagination, batching, and error handling. It abstracts away the complexity
 * of GraphQL queries and provides type-safe methods for common data fetching operations.
 *
 * @class FetcherService
 * @example
 * ```typescript
 * const fetcher = createFetcher();
 * const service = fetcher.service;
 *
 * // Fetch posts with pagination
 * const posts = await service.fetchPosts({ maxItems: 100 });
 *
 * // Fetch specific data types
 * const topics = await service.fetchTopics({ maxItems: 50 });
 * const collections = await service.fetchCollections({ maxItems: 30 });
 * ```
 */
export class FetcherService {
  /** Low-level Product Hunt API client */
  private readonly client: ProductHuntClient;
  /** Logger instance for debugging and monitoring */
  private readonly logger: Logger;

  /**
   * Creates a new FetcherService instance
   *
   * @param client - Product Hunt API client for GraphQL operations
   * @param logger - Logger instance for debugging and monitoring
   *
   * @example
   * ```typescript
   * const client = new ProductHuntClient(config, retryConfig, rateLimiter, logger);
   * const service = new FetcherService(client, logger);
   * ```
   */
  constructor(client: ProductHuntClient, logger: Logger) {
    this.client = client;
    this.logger = logger.child({ component: 'FetcherService' });
  }

  // ============================================================================
  // PUBLIC METHODS
  // ============================================================================

  /**
   * Fetches posts from Product Hunt API with pagination support
   *
   * Retrieves a list of posts from Product Hunt with built-in pagination and batching.
   * Supports both limited and unlimited fetching modes.
   *
   * For single post fetching, use this method with maxItems: 1:
   * ```typescript
   * const result = await fetcher.service.fetchPosts({ maxItems: 1 });
   * const post = result.success ? result.data.data[0] : null;
   * ```
   *
   * @param options - Fetching options for posts
   * @param options.maxItems - Maximum number of posts to fetch (default: 100)
   * @param options.batchSize - Number of posts per API request (default: 10)
   * @param options.startCursor - Cursor to start fetching from (for pagination)
   * @param options.unlimited - Whether to fetch unlimited posts (ignores maxItems)
   * @returns Promise resolving to fetch result with posts data
   *
   * @example
   * ```typescript
   * // Basic usage
   * const result = await fetcher.service.fetchPosts();
   * if (result.success) {
   *   console.log(`Fetched ${result.data.totalFetched} posts`);
   * }
   *
   * // With custom options
   * const result = await fetcher.service.fetchPosts({
   *   maxItems: 50,
   *   batchSize: 20
   * });
   *
   * // Fetch single post
   * const result = await fetcher.service.fetchPosts({ maxItems: 1 });
   * const post = result.success ? result.data.data[0] : null;
   *
   * // With pagination
   * const result = await fetcher.service.fetchPosts({
   *   maxItems: 100,
   *   startCursor: 'cursor-string'
   * });
   * ```
   *
   * @example
   * ```typescript
   * // Error handling
   * const result = await fetcher.service.fetchPosts();
   * if (!result.success) {
   *   console.error('Failed to fetch posts:', result.error.message);
   *   return;
   * }
   *
   * // Process posts
   * result.data.data.forEach(post => {
   *   console.log(post.name, post.tagline);
   * });
   * ```
   */
  async fetchPosts(options: FetchOptions = {}): AsyncResult<FetchResult<PostNode>, Error> {
    const {
      maxItems = 100,
      batchSize = 5,
      startCursor,
      unlimited = false,
    } = options;

    // Relax limits significantly for unlimited mode
    const effectiveMaxItems = unlimited ? Number.MAX_SAFE_INTEGER : maxItems;
    const effectiveBatchSize = unlimited ? Math.max(batchSize, 50) : batchSize;

    this.logger.info('Starting posts fetch', {
      maxItems: unlimited ? 'unlimited' : effectiveMaxItems,
      batchSize: effectiveBatchSize,
      startCursor,
      unlimited
    });

    const posts: PostNode[] = [];
    let cursor = startCursor;
    let hasMore = true;
    let totalFetched = 0;
    let loopCount = 0;

    while (hasMore && totalFetched < maxItems) {
      loopCount++;
      const remainingItems = maxItems - totalFetched;
      const currentBatchSize = Math.min(batchSize, remainingItems);

      const variables: GetPostsQueryVariables = {
        first: currentBatchSize,
        after: cursor,
      };

      this.logger.debug('Fetching posts batch', {
        loopCount,
        batchSize: currentBatchSize,
        cursor,
        totalFetched,
        maxItems,
        remainingItems
      });

      const result = await this.client.posts.getPosts(variables);

      if (!result.success) {
        this.logger.error('Failed to fetch posts batch', {
          error: result.error.message,
          totalFetched
        });
        return failure(result.error);
      }

      const response = result.data;
      const batchPosts = response.posts.edges.map(edge => edge.node);

      posts.push(...batchPosts);
      totalFetched += batchPosts.length;

      hasMore = response.posts.pageInfo.hasNextPage;
      cursor = response.posts.pageInfo.endCursor || undefined;

      this.logger.debug('Posts batch fetched', {
        loopCount,
        batchCount: batchPosts.length,
        totalFetched,
        hasMore,
        nextCursor: cursor,
        maxItems,
        shouldContinue: hasMore && totalFetched < maxItems
      });

      // Exit if batch is empty
      if (batchPosts.length === 0) {
        hasMore = false;
      }
    }

    const fetchResult: FetchResult<PostNode> = {
      data: posts,
      hasMore,
      nextCursor: cursor,
      totalFetched,
    };

    this.logger.info('Posts fetch completed', {
      totalFetched: fetchResult.totalFetched,
      hasMore: fetchResult.hasMore,
      nextCursor: fetchResult.nextCursor
    });

    return success(fetchResult);
  }

  /**
   * Fetches all topics from Product Hunt API
   *
   * Retrieves all available topics from Product Hunt. Topics are relatively few
   * in number, so this method uses larger batch sizes and higher limits by default.
   *
   * @param options - Fetching options for topics
   * @param options.maxItems - Maximum number of topics to fetch (default: 10000)
   * @param options.batchSize - Number of topics per API request (default: 100)
   * @param options.startCursor - Cursor to start fetching from (for pagination)
   * @returns Promise resolving to fetch result with topics data
   *
   * @example
   * ```typescript
   * // Fetch topics
   * const result = await fetcher.service.fetchTopics();
   * if (result.success) {
   *   console.log(`Fetched ${result.data.totalFetched} topics`);
   *   result.data.data.forEach(topic => {
   *     console.log(topic.name, topic.description);
   *   });
   * }
   * ```
   */
  async fetchTopics(options: FetchOptions = {}): AsyncResult<FetchResult<TopicNode>, Error> {
    const {
      maxItems = 10000, // Topics are relatively few, so set higher limit
      batchSize = 10,
      startCursor,
    } = options;

    this.logger.info('Starting topics fetch', { maxItems, batchSize, startCursor });

    const topics: TopicNode[] = [];
    let cursor = startCursor;
    let hasMore = true;
    let totalFetched = 0;

    while (hasMore && totalFetched < maxItems) {
      const remainingItems = maxItems - totalFetched;
      const currentBatchSize = Math.min(batchSize, remainingItems);

      const variables: GetTopicsQueryVariables = {
        first: currentBatchSize,
        after: cursor,
      };

      this.logger.debug('Fetching topics batch', {
        batchSize: currentBatchSize,
        cursor,
        totalFetched
      });

      const result = await this.client.topics.getTopics(variables);

      if (!result.success) {
        this.logger.error('Failed to fetch topics batch', {
          error: result.error.message,
          totalFetched
        });
        return failure(result.error);
      }

      const response = result.data;
      const batchTopics = response.topics.edges.map(edge => edge.node);

      topics.push(...batchTopics);
      totalFetched += batchTopics.length;

      hasMore = response.topics.pageInfo.hasNextPage;
      cursor = response.topics.pageInfo.endCursor || undefined;

      this.logger.debug('Topics batch fetched', {
        batchCount: batchTopics.length,
        totalFetched,
        hasMore,
        nextCursor: cursor
      });

      if (batchTopics.length === 0) {
        hasMore = false;
      }
    }

    const fetchResult: FetchResult<TopicNode> = {
      data: topics,
      hasMore,
      nextCursor: cursor,
      totalFetched,
    };

    this.logger.info('Topics fetch completed', {
      totalFetched: fetchResult.totalFetched,
      hasMore: fetchResult.hasMore
    });

    return success(fetchResult);
  }

  /**
   * Fetches all collections from Product Hunt API
   *
   * Retrieves all available collections from Product Hunt. Collections
   * represent curated groups of posts and are relatively few in number.
   *
   * @param options - Fetching options for collections
   * @param options.maxItems - Maximum number of collections to fetch (default: 10000)
   * @param options.batchSize - Number of collections per API request (default: 50)
   * @param options.startCursor - Cursor to start fetching from (for pagination)
   * @returns Promise resolving to fetch result with collections data
   *
   * @example
   * ```typescript
   * // Fetch collections
   * const result = await fetcher.service.fetchCollections();
   * if (result.success) {
   *   console.log(`Fetched ${result.data.totalFetched} collections`);
   *   result.data.data.forEach(collection => {
   *     console.log(collection.name, collection.description);
   *   });
   * }
   * ```
   */
  async fetchCollections(options: FetchOptions = {}): AsyncResult<FetchResult<CollectionNode>, Error> {
    const {
      maxItems = 10000,
      batchSize = 10,
      startCursor,
    } = options;

    this.logger.info('Starting collections fetch', { maxItems, batchSize, startCursor });

    const collections: CollectionNode[] = [];
    let cursor = startCursor;
    let hasMore = true;
    let totalFetched = 0;

    while (hasMore && totalFetched < maxItems) {
      const remainingItems = maxItems - totalFetched;
      const currentBatchSize = Math.min(batchSize, remainingItems);

      const variables: GetCollectionsQueryVariables = {
        first: currentBatchSize,
        after: cursor,
      };

      const result = await this.client.collections.getCollections(variables);

      if (!result.success) {
        this.logger.error('Failed to fetch collections batch', {
          error: result.error.message,
          totalFetched
        });
        return failure(result.error);
      }

      const response = result.data;
      const batchCollections = response.collections.edges.map(edge => edge.node);

      collections.push(...batchCollections);
      totalFetched += batchCollections.length;

      hasMore = response.collections.pageInfo.hasNextPage;
      cursor = response.collections.pageInfo.endCursor || undefined;

      this.logger.debug('Collections batch fetched', {
        batchCount: batchCollections.length,
        totalFetched,
        hasMore
      });

      if (batchCollections.length === 0) {
        hasMore = false;
      }
    }

    const fetchResult: FetchResult<CollectionNode> = {
      data: collections,
      hasMore,
      nextCursor: cursor,
      totalFetched,
    };

    this.logger.info('Collections fetch completed', {
      totalFetched: fetchResult.totalFetched,
      hasMore: fetchResult.hasMore
    });

    return success(fetchResult);
  }

  /**
   * Performs a health check on the Product Hunt API
   *
   * Verifies that the API is accessible and the authentication token is valid.
   * This method can be used to test connectivity before performing actual
   * data fetching operations.
   *
   * @returns Promise resolving to true if the API is healthy, false otherwise
   *
   * @example
   * ```typescript
   * // Check API health
   * const isHealthy = await fetcher.service.healthCheck();
   * if (isHealthy.success && isHealthy.data) {
   *   console.log('API is healthy');
   * }
   * ```
   */
  async healthCheck(): AsyncResult<boolean, Error> {
    this.logger.debug('Performing fetcher health check');
    return await this.client.healthCheck();
  }

}
