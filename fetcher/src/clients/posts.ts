/**
 * Posts API Client
 *
 * Specialized client for Product Hunt posts-related API operations.
 * Provides methods for fetching posts data with type-safe GraphQL queries.
 *
 * @fileoverview Posts-specific API client for Product Hunt
 * @author aoki-h-jp
 * @version 1.0.0
 */
import { AsyncResult } from '@producthunt-mcp-research/shared';
import type {
  GetPostsQueryVariables,
  GetPostsQuery,
} from '../generated/graphql.js';
import { BaseGraphQLClient } from './base.js';
import { GET_POSTS } from '../queries/posts.js';

/**
 * Posts API Client
 *
 * Specialized client for Product Hunt posts-related API operations.
 * Extends BaseGraphQLClient to provide posts-specific functionality.
 *
 * @class PostsClient
 * @extends BaseGraphQLClient
 * @example
 * ```typescript
 * const postsClient = new PostsClient(config, retryConfig, rateLimiter, logger);
 *
 * // Fetch posts list
 * const posts = await postsClient.getPosts({ first: 10 });
 *
 * // Fetch specific post
 * const post = await postsClient.getPost({ id: 'post-id' });
 * ```
 */
export class PostsClient extends BaseGraphQLClient {
  /**
   * Fetches a list of posts from Product Hunt
   *
   * Retrieves posts with pagination support and filtering options.
   * Supports various query parameters for customizing the results.
   *
   * @param variables - Query variables for posts fetching
   * @param variables.first - Number of posts to fetch
   * @param variables.after - Cursor for pagination
   * @param variables.order - Sort order for posts
   * @param variables.topic - Filter by topic
   * @returns Promise resolving to posts query result
   *
   * @example
   * ```typescript
   * // Fetch latest posts
   * const result = await postsClient.getPosts({ first: 10 });
   *
   * // Fetch posts with pagination
   * const result = await postsClient.getPosts({
   *   first: 20,
   *   after: 'cursor-string'
   * });
   *
   * // Fetch posts by topic
   * const result = await postsClient.getPosts({
   *   first: 15,
   *   topic: 'artificial-intelligence'
   * });
   * ```
   */
  async getPosts(variables: GetPostsQueryVariables): AsyncResult<GetPostsQuery, Error> {
    return this.executeQuery<GetPostsQuery>(GET_POSTS, variables, 'getPosts');
  }

}
