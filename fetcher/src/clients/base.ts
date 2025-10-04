/**
 * Base GraphQL Client
 *
 * Abstract base class for all Product Hunt API clients. Provides common
 * functionality including GraphQL request execution, error handling,
 * retry logic, rate limiting, and logging.
 *
 * @fileoverview Base GraphQL client for Product Hunt API operations
 * @author aoki-h-jp
 * @version 1.0.0
 */
import { GraphQLClient } from 'graphql-request';
import { Logger, AsyncResult, success, wrapAsync } from '@producthunt-mcp-research/shared';
import { RateLimiter } from '../utils/rate-limit.js';
import { retry } from '../utils/retry.js';
import type { RetryConfig } from '../config/index.js';

// Temporary configuration type definition
interface ProductHuntConfig {
  apiToken: string;
  endpoint: string;
  userAgent?: string;
}

import { ProductHuntErrorHandler } from '../errors/api-error-handler.js';

/**
 * Health check response type
 *
 * @interface HealthCheckResponse
 * @property {string} __typename - GraphQL type name
 */
interface HealthCheckResponse {
  __typename: string;
}

/**
 * Base GraphQL Client
 *
 * Abstract base class that provides common functionality for all Product Hunt
 * API clients. Handles GraphQL request execution, error handling, retry logic,
 * rate limiting, and logging. All specific API clients should extend this class.
 *
 * @abstract
 * @class BaseGraphQLClient
 * @example
 * ```typescript
 * class PostsClient extends BaseGraphQLClient {
 *   async getPosts(variables: GetPostsQueryVariables) {
 *     return this.executeQuery<GetPostsQuery>(GET_POSTS, variables, 'getPosts');
 *   }
 * }
 * ```
 */
export class BaseGraphQLClient {
  /** GraphQL client instance for API requests */
  protected readonly client: GraphQLClient;
  /** Logger instance for debugging and monitoring */
  protected readonly logger: Logger;
  /** Retry configuration for failed requests */
  protected readonly retryConfig: RetryConfig;
  /** Rate limiter for controlling request frequency */
  protected readonly rateLimiter: RateLimiter;

  /**
   * Creates a new BaseGraphQLClient instance
   *
   * Initializes the GraphQL client with authentication headers and configures
   * retry logic, rate limiting, and logging for all API operations.
   *
   * @param config - Product Hunt API configuration
   * @param retryConfig - Retry mechanism configuration
   * @param rateLimiter - Rate limiter instance
   * @param logger - Logger instance for debugging and monitoring
   *
   * @example
   * ```typescript
   * const client = new BaseGraphQLClient(
   *   { apiToken: 'token', endpoint: 'https://api.producthunt.com/v2/api/graphql' },
   *   retryConfig,
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
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${config.apiToken}`,
      'Content-Type': 'application/json',
    };

    if (config.userAgent) {
      headers['User-Agent'] = config.userAgent;
    }

    this.client = new GraphQLClient(config.endpoint, {
      headers,
    });

    this.logger = logger.child({ component: 'BaseGraphQLClient' });
    this.rateLimiter = rateLimiter;
    this.retryConfig = retryConfig;
  }

  /**
   * Executes a GraphQL query with retry logic and rate limiting
   *
   * This method handles the complete lifecycle of a GraphQL request including
   * rate limiting, retry logic, error handling, and logging. It should be used
   * by all sub-classes for executing GraphQL queries.
   *
   * @template T - Expected response type
   * @param query - GraphQL query string
   * @param variables - Query variables
   * @param operation - Operation name for logging and error handling
   * @returns Promise resolving to query result or error
   *
   * @example
   * ```typescript
   * const result = await this.executeQuery<GetPostsQuery>(
   *   GET_POSTS_QUERY,
   *   { first: 10, after: 'cursor' },
   *   'getPosts'
   * );
   *
   * if (result.success) {
   *   console.log('Posts fetched:', result.data);
   * } else {
   *   console.error('Query failed:', result.error);
   * }
   * ```
   */
  public async executeQuery<T>(
    query: string,
    variables: Record<string, unknown>,
    operation: string
  ): AsyncResult<T, Error> {
    const context = { operation, variables };
    this.logger.debug('Executing GraphQL query', context);

    return wrapAsync(async () => {
      return await this.rateLimiter.execute(async () => {
        return await retry(
          async () => {
            try {
              const response = await this.client.request<T>(query, variables);
              this.logger.info('GraphQL query executed successfully', {
                ...context,
                hasData: !!response
              });
              return response;
            } catch (error) {
              const apiError = ProductHuntErrorHandler.handleError(error, operation);
              this.logger.error('GraphQL query failed', {
                ...context,
                error: apiError.message
              });
              throw apiError;
            }
          },
          this.retryConfig,
          (error) => ProductHuntErrorHandler.shouldRetry(error)
        );
      });
    });
  }

  /**
   * Performs a health check on the API
   *
   * Executes a simple query to verify that the API is accessible and
   * the authentication token is valid. This method can be used to test
   * connectivity before performing actual data operations.
   *
   * @returns Promise resolving to true if the API is healthy, false otherwise
   *
   * @example
   * ```typescript
   * const isHealthy = await client.healthCheck();
   * if (isHealthy.success && isHealthy.data) {
   *   console.log('API is healthy');
   * } else {
   *   console.error('Health check failed:', isHealthy.error);
   * }
   * ```
   */
  async healthCheck(): AsyncResult<boolean, Error> {
    this.logger.debug('Performing health check');

    // Lightweight query for health check
    const result = await this.executeQuery<HealthCheckResponse>(
      'query { __typename }',
      {},
      'healthCheck'
    );

    if (result.success) {
      this.logger.info('Health check passed');
      return success(true);
    } else {
      this.logger.warn('Health check failed', { error: result.error.message });
      return result;
    }
  }
}
