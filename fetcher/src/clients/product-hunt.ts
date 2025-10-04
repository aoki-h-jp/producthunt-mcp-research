/**
 * Product Hunt Integrated API Client
 *
 * A unified client that provides access to all Product Hunt API endpoints
 * through specialized sub-clients. This client handles authentication,
 * rate limiting, retry logic, and error handling for all API operations.
 *
 * @fileoverview Integrated API client for Product Hunt GraphQL API
 * @author aoki-h-jp
 * @version 1.0.0
 */
import { AsyncResult, Logger } from '@producthunt-mcp-research/shared';
import { RateLimiter } from '../utils/rate-limit.js';
import type { RetryConfig } from '../config/index.js';

// Temporary configuration type definition
interface ProductHuntConfig {
  apiToken: string;
  endpoint: string;
  userAgent?: string;
}

import { PostsClient } from './posts.js';
import { TopicsClient } from './topics.js';
import { CollectionsClient } from './collections.js';

/**
 * Product Hunt Integrated API Client
 *
 * Provides a unified interface to all Product Hunt API endpoints through
 * specialized sub-clients. Each sub-client handles a specific data type
 * (posts, topics, collections, comments) with consistent error
 * handling and rate limiting.
 *
 * @class ProductHuntClient
 * @example
 * ```typescript
 * const client = new ProductHuntClient(config, retryConfig, rateLimiter, logger);
 *
 * // Access different data types
 * const posts = await client.posts.getPosts({ first: 10 });
 * const topics = await client.topics.getTopics({ first: 20 });
 * const collections = await client.collections.getCollections({ first: 15 });
 * ```
 */
export class ProductHuntClient {
  /** Client for posts-related API operations */
  public readonly posts: PostsClient;
  /** Client for topics-related API operations */
  public readonly topics: TopicsClient;
  /** Client for collections-related API operations */
  public readonly collections: CollectionsClient;

  /**
   * Creates a new ProductHuntClient instance
   *
   * Initializes all sub-clients with the provided configuration, retry settings,
   * rate limiter, and logger. Each sub-client will handle its specific data type
   * with consistent error handling and rate limiting.
   *
   * @param config - Product Hunt API configuration
   * @param retryConfig - Retry mechanism configuration
   * @param rateLimiter - Rate limiter instance
   * @param logger - Logger instance for debugging and monitoring
   *
   * @example
   * ```typescript
   * const client = new ProductHuntClient(
   *   { apiToken: 'token', endpoint: 'https://api.producthunt.com/v2/api/graphql' },
   *   { maxAttempts: 3, baseDelay: 1000, maxDelay: 30000, backoffMultiplier: 2 },
   *   rateLimiter,
   *   logger
   * );
   * ```
   */
  constructor(
    config: ProductHuntConfig,
    retryConfig: RetryConfig,
    rateLimiter: RateLimiter,
    logger: Logger
  ) {
    this.posts = new PostsClient(config, retryConfig, rateLimiter, logger);
    this.topics = new TopicsClient(config, retryConfig, rateLimiter, logger);
    this.collections = new CollectionsClient(config, retryConfig, rateLimiter, logger);
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
   * const isHealthy = await client.healthCheck();
   * if (isHealthy.success && isHealthy.data) {
   *   console.log('API is healthy');
   * } else {
   *   console.error('API health check failed:', isHealthy.error);
   * }
   * ```
   */
  async healthCheck(): AsyncResult<boolean, Error> {
    return this.posts.healthCheck();
  }
}
