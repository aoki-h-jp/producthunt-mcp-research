/**
 * Topics API Client
 *
 * Specialized client for Product Hunt topics-related API operations.
 * Provides methods for fetching topics data with type-safe GraphQL queries.
 *
 * @fileoverview Topics-specific API client for Product Hunt
 * @author aoki-h-jp
 * @version 1.0.0
 */
import { AsyncResult } from '@producthunt-mcp-research/shared';
import { BaseGraphQLClient } from './base.js';
import { GET_TOPICS } from '../queries/topics.js';
import {
  GetTopicsQuery,
  GetTopicsQueryVariables
} from '../generated/graphql.js';

/**
 * Topics API Client
 *
 * Specialized client for Product Hunt topics-related API operations.
 * Extends BaseGraphQLClient to provide topics-specific functionality.
 *
 * @class TopicsClient
 * @extends BaseGraphQLClient
 * @example
 * ```typescript
 * const topicsClient = new TopicsClient(config, retryConfig, rateLimiter, logger);
 *
 * // Fetch topics list
 * const topics = await topicsClient.getTopics({ first: 20 });
 *
 * // Fetch specific topic
 * const topic = await topicsClient.getTopic({ slug: 'ai' });
 * ```
 */
export class TopicsClient extends BaseGraphQLClient {
  /**
   * Fetches a list of topics from Product Hunt
   *
   * Retrieves topics with pagination support and filtering options.
   * Topics represent categories that posts can be associated with.
   *
   * @param variables - Query variables for topics fetching
   * @param variables.first - Number of topics to fetch
   * @param variables.after - Cursor for pagination
   * @param variables.order - Sort order for topics
   * @returns Promise resolving to topics query result
   *
   * @example
   * ```typescript
   * // Fetch all topics
   * const result = await topicsClient.getTopics({ first: 50 });
   *
   * // Fetch topics with pagination
   * const result = await topicsClient.getTopics({
   *   first: 20,
   *   after: 'cursor-string'
   * });
   * ```
   */
  async getTopics(variables: GetTopicsQueryVariables): AsyncResult<GetTopicsQuery, Error> {
    return this.executeQuery<GetTopicsQuery>(GET_TOPICS, variables, 'getTopics');
  }

}
