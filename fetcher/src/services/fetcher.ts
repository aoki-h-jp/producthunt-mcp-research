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
 * All fetch methods retrieve a single batch of data. For fetching multiple batches,
 * call the method in a loop with the returned nextCursor.
 *
 * @interface FetchOptions
 * @property {number} [batchSize] - Number of items to fetch per API request
 * @property {string} [startCursor] - Cursor to start fetching from (for pagination)
 *
 * @example
 * ```typescript
 * // Fetch a single batch
 * const result = await fetcher.service.fetchPosts({ batchSize: 10 });
 *
 * // Fetch with pagination
 * let cursor = null;
 * while (cursor !== undefined) {
 *   const result = await fetcher.service.fetchPosts({
 *     batchSize: 5,
 *     startCursor: cursor ?? undefined
 *   });
 *   if (result.success) {
 *     // Process batch
 *     cursor = result.data.nextCursor ?? undefined;
 *   } else {
 *     break;
 *   }
 * }
 * ```
 */
export interface FetchOptions {
  /** Number of items to fetch per API request (default varies by method) */
  batchSize?: number | undefined;
  /** Cursor to start fetching from (for pagination) */
  startCursor?: string | undefined;
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
   * Fetches a single batch of posts from Product Hunt API
   *
   * Retrieves one batch of posts from Product Hunt. For fetching multiple batches,
   * call this method in a loop with the returned nextCursor.
   *
   * @param options - Fetching options for posts
   * @param options.batchSize - Number of posts per API request (default: 5)
   * @param options.startCursor - Cursor to start fetching from (for pagination)
   * @returns Promise resolving to fetch result with posts data and pagination info
   *
   * @example
   * ```typescript
   * // Fetch a single batch
   * const result = await fetcher.service.fetchPosts({ batchSize: 10 });
   * if (result.success) {
   *   console.log(`Fetched ${result.data.totalFetched} posts`);
   *   console.log(`Has more: ${result.data.hasMore}`);
   *   console.log(`Next cursor: ${result.data.nextCursor}`);
   * }
   *
   * // Fetch with pagination
   * let cursor = null;
   * while (cursor !== undefined) {
   *   const result = await fetcher.service.fetchPosts({
   *     batchSize: 5,
   *     startCursor: cursor ?? undefined
   *   });
   *   if (result.success) {
   *     // Process batch
   *     result.data.data.forEach(post => console.log(post.name));
   *     cursor = result.data.nextCursor ?? undefined;
   *   } else {
   *     break;
   *   }
   * }
   * ```
   */
  async fetchPosts(options: FetchOptions = {}): AsyncResult<FetchResult<PostNode>, Error> {
    const {
      batchSize = 5,
      startCursor,
    } = options;

    this.logger.info('Starting posts fetch (single batch)', { batchSize, startCursor });

    const variables: GetPostsQueryVariables = {
      first: batchSize,
      after: startCursor,
    };

    const result = await this.client.posts.getPosts(variables);

    if (!result.success) {
      this.logger.error('Failed to fetch posts batch', {
        error: result.error.message,
      });
      return failure(result.error);
    }

    const response = result.data;
    const posts = response.posts.edges.map(edge => edge.node);
    const hasMore = response.posts.pageInfo.hasNextPage;
    const nextCursor = response.posts.pageInfo.endCursor || undefined;

    const fetchResult: FetchResult<PostNode> = {
      data: posts,
      hasMore,
      nextCursor,
      totalFetched: posts.length,
    };

    this.logger.info('Posts fetch completed', {
      totalFetched: fetchResult.totalFetched,
      hasMore: fetchResult.hasMore,
      nextCursor: fetchResult.nextCursor
    });

    return success(fetchResult);
  }

  /**
   * Fetches a single batch of topics from Product Hunt API
   *
   * Retrieves one batch of topics from Product Hunt. For fetching multiple batches,
   * call this method in a loop with the returned nextCursor.
   *
   * @param options - Fetching options for topics
   * @param options.batchSize - Number of topics per API request (default: 10)
   * @param options.startCursor - Cursor to start fetching from (for pagination)
   * @returns Promise resolving to fetch result with topics data and pagination info
   *
   * @example
   * ```typescript
   * // Fetch a single batch
   * const result = await fetcher.service.fetchTopics({ batchSize: 10 });
   * if (result.success) {
   *   console.log(`Fetched ${result.data.totalFetched} topics`);
   *   console.log(`Has more: ${result.data.hasMore}`);
   *   console.log(`Next cursor: ${result.data.nextCursor}`);
   *   result.data.data.forEach(topic => {
   *     console.log(topic.name, topic.description);
   *   });
   * }
   * ```
   */
  async fetchTopics(options: FetchOptions = {}): AsyncResult<FetchResult<TopicNode>, Error> {
    const {
      batchSize = 10,
      startCursor,
    } = options;

    this.logger.info('Starting topics fetch (single batch)', { batchSize, startCursor });

    const variables: GetTopicsQueryVariables = {
      first: batchSize,
      after: startCursor,
    };

    const result = await this.client.topics.getTopics(variables);

    if (!result.success) {
      this.logger.error('Failed to fetch topics batch', {
        error: result.error.message,
      });
      return failure(result.error);
    }

    const response = result.data;
    const topics = response.topics.edges.map(edge => edge.node);
    const hasMore = response.topics.pageInfo.hasNextPage;
    const nextCursor = response.topics.pageInfo.endCursor || undefined;

    const fetchResult: FetchResult<TopicNode> = {
      data: topics,
      hasMore,
      nextCursor,
      totalFetched: topics.length,
    };

    this.logger.info('Topics fetch completed', {
      totalFetched: fetchResult.totalFetched,
      hasMore: fetchResult.hasMore,
      nextCursor: fetchResult.nextCursor
    });

    return success(fetchResult);
  }

  /**
   * Fetches a single batch of collections from Product Hunt API
   *
   * Retrieves one batch of collections from Product Hunt. For fetching multiple batches,
   * call this method in a loop with the returned nextCursor.
   *
   * @param options - Fetching options for collections
   * @param options.batchSize - Number of collections per API request (default: 10)
   * @param options.startCursor - Cursor to start fetching from (for pagination)
   * @returns Promise resolving to fetch result with collections data and pagination info
   *
   * @example
   * ```typescript
   * // Fetch a single batch
   * const result = await fetcher.service.fetchCollections({ batchSize: 10 });
   * if (result.success) {
   *   console.log(`Fetched ${result.data.totalFetched} collections`);
   *   console.log(`Has more: ${result.data.hasMore}`);
   *   console.log(`Next cursor: ${result.data.nextCursor}`);
   *   result.data.data.forEach(collection => {
   *     console.log(collection.name, collection.description);
   *   });
   * }
   * ```
   */
  async fetchCollections(options: FetchOptions = {}): AsyncResult<FetchResult<CollectionNode>, Error> {
    const {
      batchSize = 10,
      startCursor,
    } = options;

    this.logger.info('Starting collections fetch (single batch)', { batchSize, startCursor });

    const variables: GetCollectionsQueryVariables = {
      first: batchSize,
      after: startCursor,
    };

    const result = await this.client.collections.getCollections(variables);

    if (!result.success) {
      this.logger.error('Failed to fetch collections batch', {
        error: result.error.message,
      });
      return failure(result.error);
    }

    const response = result.data;
    const collections = response.collections.edges.map(edge => edge.node);
    const hasMore = response.collections.pageInfo.hasNextPage;
    const nextCursor = response.collections.pageInfo.endCursor || undefined;

    const fetchResult: FetchResult<CollectionNode> = {
      data: collections,
      hasMore,
      nextCursor,
      totalFetched: collections.length,
    };

    this.logger.info('Collections fetch completed', {
      totalFetched: fetchResult.totalFetched,
      hasMore: fetchResult.hasMore,
      nextCursor: fetchResult.nextCursor
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
