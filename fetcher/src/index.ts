/**
 * Product Hunt Fetcher Module
 *
 * A modular TypeScript library for fetching data from the Product Hunt GraphQL API.
 * Provides type-safe data fetching with built-in rate limiting, retry mechanisms,
 * and comprehensive error handling.
 *
 * @module @producthunt-mcp-research/fetcher
 * @version 1.0.0
 * @author aoki-h-jp
 * @license MIT
 *
 * @example
 * ```typescript
 * import { createFetcher } from '@producthunt-mcp-research/fetcher';
 *
 * // Create a fetcher instance with configuration
 * const fetcher = createFetcher({
 *   productHunt: {
 *     apiToken: 'your-product-hunt-token',
 *   }
 * });
 *
 * // Fetch posts with pagination
 * const result = await fetcher.service.fetchPosts({
 *   maxItems: 100,
 *   batchSize: 20
 * });
 *
 * if (result.success) {
 *   console.log(`Fetched ${result.data.totalFetched} posts`);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Fetch specific data types
 * const topics = await fetcher.service.fetchTopics();
 * const collections = await fetcher.service.fetchCollections();
 * const posts = await fetcher.service.fetchPosts({ maxItems: 100 });
 * ```
 */

// ============================================================================
// MAIN EXPORTS
// ============================================================================

/**
 * Factory function for creating fetcher instances
 * @see {@link createFetcher} for usage details
 */
export { createFetcher } from './factory.js';

/**
 * Fetcher instance interface
 * @see {@link FetcherInstance} for property details
 */
export type { FetcherInstance } from './factory.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Configuration management utilities
 * @see {@link FetcherConfig} for configuration schema
 * @see {@link loadConfig} for environment variable loading
 */
export * from './config/index.js';

// ============================================================================
// API CLIENTS
// ============================================================================

/**
 * Product Hunt API clients for different data types
 * @see {@link ProductHuntClient} for the main integrated client
 * @see {@link PostsClient} for posts-specific operations (includes comments)
 * @see {@link TopicsClient} for topics-specific operations
 * @see {@link CollectionsClient} for collections-specific operations
 */
export * from './clients/index.js';

// ============================================================================
// SERVICES
// ============================================================================

/**
 * High-level data fetching service
 * @see {@link FetcherService} for available methods
 */
export * from './services/fetcher.js';


// ============================================================================
// GRAPHQL TYPES
// ============================================================================

/**
 * Auto-generated GraphQL types from Product Hunt API schema
 * These are the source of truth for all API data structures
 */
export * from './generated/graphql.js';

// ============================================================================
// CONVENIENCE TYPE ALIASES
// ============================================================================

/**
 * GraphQL query result types for easy access
 */
export type {
  GetPostsQuery,
  GetTopicsQuery,
  GetCollectionsQuery,
} from './generated/graphql.js';

// ============================================================================
// NODE TYPE ALIASES
// ============================================================================

/**
 * Extracted node types from GraphQL responses for easier usage
 * These represent the actual data objects returned by the API
 */
import type {
  GetPostsQuery,
  GetTopicsQuery,
  GetCollectionsQuery,
} from './generated/graphql.js';

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
 * Comment node from posts query
 * @example
 * ```typescript
 * // Comments are accessed through posts
 * const posts = await fetcher.service.fetchPosts({ maxItems: 10 });
 * if (posts.success && posts.data.data.length > 0) {
 *   const post = posts.data.data[0];
 *   const comments = post.comments?.edges.map(edge => edge.node);
 *   // Process comments
 * }
 * ```
 */
export type CommentNode = NonNullable<GetPostsQuery['posts']['edges'][0]['node']['comments']>['edges'][0]['node'];

