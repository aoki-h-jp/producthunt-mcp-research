/**
 * API Constants
 *
 * Centralized constants for API endpoints and related configurations.
 * This helps maintain consistency across the fetcher module and makes
 * it easier to update endpoints when needed.
 *
 * @fileoverview API constants for Product Hunt fetcher
 * @author aoki-h-jp
 * @version 1.0.0
 */

/**
 * Product Hunt GraphQL API endpoint
 *
 * The official GraphQL endpoint for the Product Hunt API v2.
 * This is the primary endpoint used for all GraphQL operations.
 *
 * @constant {string}
 *
 * @example
 * ```typescript
 * import { PRODUCT_HUNT_API_ENDPOINT } from './constants/api.js';
 *
 * const client = new GraphQLClient(PRODUCT_HUNT_API_ENDPOINT);
 * ```
 */
export const PRODUCT_HUNT_API_ENDPOINT = 'https://api.producthunt.com/v2/api/graphql';

/**
 * Default user agent string for Product Hunt API requests
 *
 * Identifies the client making requests to the Product Hunt API.
 * Should be descriptive and include version information.
 *
 * @constant {string}
 *
 * @example
 * ```typescript
 * import { DEFAULT_USER_AGENT } from './constants/api.js';
 *
 * const headers = {
 *   'User-Agent': DEFAULT_USER_AGENT
 * };
 * ```
 */
export const DEFAULT_USER_AGENT = 'producthunt-mcp-research/1.0 (Personal Use)';

/**
 * Default request timeout in milliseconds
 *
 * Maximum time to wait for API responses before timing out.
 * Set to 30 seconds to accommodate Product Hunt's response times.
 *
 * @constant {number}
 *
 * @example
 * ```typescript
 * import { DEFAULT_TIMEOUT } from './constants/api.js';
 *
 * const client = new GraphQLClient(endpoint, {
 *   timeout: DEFAULT_TIMEOUT
 * });
 * ```
 */
export const DEFAULT_TIMEOUT = 30000; // 30 seconds
