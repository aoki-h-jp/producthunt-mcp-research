/**
 * Collections API Client
 *
 * Specialized client for Product Hunt collections-related API operations.
 * Provides methods for fetching collections data with type-safe GraphQL queries.
 *
 * @fileoverview Collections-specific API client for Product Hunt
 * @author aoki-h-jp
 * @version 1.0.0
 */
import { AsyncResult } from '@producthunt-mcp-research/shared';
import { BaseGraphQLClient } from './base.js';
import { GET_COLLECTIONS } from '../queries/collections.js';
import {
  GetCollectionsQuery,
  GetCollectionsQueryVariables
} from '../generated/graphql.js';

/**
 * Collections API Client
 *
 * Specialized client for Product Hunt collections-related API operations.
 * Extends BaseGraphQLClient to provide collections-specific functionality.
 *
 * @class CollectionsClient
 * @extends BaseGraphQLClient
 * @example
 * ```typescript
 * const collectionsClient = new CollectionsClient(config, retryConfig, rateLimiter, logger);
 *
 * // Fetch collections list
 * const collections = await collectionsClient.getCollections({ first: 10 });
 * ```
 */
export class CollectionsClient extends BaseGraphQLClient {
  /**
   * Fetches a list of collections from Product Hunt
   *
   * Retrieves collections with pagination support and filtering options.
   * Supports various query parameters for customizing the results.
   *
   * @param variables - Query variables for collections fetching
   * @param variables.first - Number of collections to fetch
   * @param variables.after - Cursor for pagination
   * @returns Promise resolving to collections query result
   *
   * @example
   * ```typescript
   * // Fetch latest collections
   * const result = await collectionsClient.getCollections({ first: 10 });
   *
   * // Fetch collections with pagination
   * const result = await collectionsClient.getCollections({
   *   first: 20,
   *   after: 'cursor-string'
   * });
   * ```
   */
  async getCollections(variables: GetCollectionsQueryVariables): AsyncResult<GetCollectionsQuery, Error> {
    return this.executeQuery<GetCollectionsQuery>(GET_COLLECTIONS, variables, 'getCollections');
  }
}
