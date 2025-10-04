/**
 * Fetcher Factory Function
 *
 * Creates and configures a complete fetcher instance with all necessary components.
 * This is the main entry point for creating a fetcher that can interact with the
 * Product Hunt API.
 *
 * @fileoverview Factory function for creating fetcher instances
 * @author aoki-h-jp
 * @version 1.0.0
 */
import { Logger, setDefaultLogger } from '@producthunt-mcp-research/shared';
import { RateLimiter } from './utils/rate-limit.js';
import { ConfigError } from './utils/errors.js';
import { ProductHuntClient } from './clients/product-hunt.js';
import { FetcherService } from './services/fetcher.js';
import { FetcherConfig, loadConfig } from './config/index.js';

/**
 * Fetcher Instance Interface
 *
 * Represents a fully configured fetcher instance with all necessary components
 * for interacting with the Product Hunt API.
 *
 * @interface FetcherInstance
 * @property {FetcherService} service - High-level data fetching service
 * @property {ProductHuntClient} client - Low-level API client for GraphQL operations
 * @property {FetcherConfig} config - Current configuration settings
 * @property {Logger} logger - Logger instance for debugging and monitoring
 *
 * @example
 * ```typescript
 * const fetcher = createFetcher();
 *
 * // Access the high-level service
 * const posts = await fetcher.service.fetchPosts();
 *
 * // Access the low-level client for custom operations
 * const customResult = await fetcher.client.posts.getPosts({ first: 10 });
 *
 * // Access configuration
 * console.log(fetcher.config.productHunt.endpoint);
 *
 * // Use the logger
 * fetcher.logger.info('Custom operation completed');
 * ```
 */
export interface FetcherInstance {
  /** High-level data fetching service with pagination and batching */
  service: FetcherService;
  /** Low-level Product Hunt API client for GraphQL operations */
  client: ProductHuntClient;
  /** Current configuration settings */
  config: FetcherConfig;
  /** Logger instance for debugging and monitoring */
  logger: Logger;
}

/**
 * Creates a fully configured fetcher instance
 *
 * This factory function initializes all necessary components for interacting
 * with the Product Hunt API, including configuration loading, logger setup,
 * rate limiting, retry mechanisms, and service initialization.
 *
 * @param config - Optional partial configuration to override defaults
 * @returns A fully configured fetcher instance
 * @throws {ConfigError} When configuration loading fails or required settings are missing
 *
 * @example
 * ```typescript
 * // Create with default configuration (loads from environment variables)
 * const fetcher = createFetcher();
 *
 * // Create with custom configuration
 * const fetcher = createFetcher({
 *   productHunt: {
 *     apiToken: 'custom-token',
 *     endpoint: PRODUCT_HUNT_API_ENDPOINT
 *   },
 *   rateLimit: {
 *     requestsPerSecond: 0.5,
 *     burstLimit: 3
 *   }
 * });
 *
 * // Create with environment variables + custom overrides
 * const fetcher = createFetcher({
 *   logLevel: 'debug'
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Error handling
 * try {
 *   const fetcher = createFetcher();
 *   console.log('Fetcher created successfully');
 * } catch (error) {
 *   if (error instanceof ConfigError) {
 *     console.error('Configuration error:', error.message);
 *   } else {
 *     console.error('Unexpected error:', error);
 *   }
 * }
 * ```
 */
export function createFetcher(config?: Partial<FetcherConfig>): FetcherInstance {
  // Load and merge configuration
  let fullConfig: FetcherConfig;
  try {
    fullConfig = config ? { ...loadConfig(), ...config } : loadConfig();
  } catch (error) {
    throw new ConfigError(
      `Failed to load fetcher configuration: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  // Validate required API token
  if (!fullConfig.productHunt.apiToken) {
    throw new ConfigError(
      'Product Hunt API token is required. Set PH_API_TOKEN environment variable.'
    );
  }

  // Initialize logger with configuration
  const logger = new Logger({
    level: fullConfig.logLevel,
    service: 'producthunt-mcp-research-fetcher',
    prettyPrint: true, // Local development, always use pretty printing
  });

  // Set default logger for shared utilities
  setDefaultLogger({
    level: fullConfig.logLevel,
    service: 'producthunt-mcp-research-fetcher',
    prettyPrint: true, // Local development, always use pretty printing
  });

  // Initialize rate limiter with configuration
  const rateLimiter = new RateLimiter(fullConfig.rateLimit);

  // Create Product Hunt API client with all dependencies
  const client = new ProductHuntClient(
    fullConfig.productHunt,
    fullConfig.retry,
    rateLimiter,
    logger
  );


  // Create high-level fetcher service
  const service = new FetcherService(client, logger);

  // Log successful initialization
  logger.info('Fetcher instance created successfully', {
    endpoint: fullConfig.productHunt.endpoint,
    rateLimit: fullConfig.rateLimit,
  });

  // Return configured instance
  return {
    service,
    client,
    config: fullConfig,
    logger,
  };
}
