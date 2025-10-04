/**
 * Fetcher Configuration Management
 *
 * Handles configuration loading, validation, and default values for the fetcher module.
 * Supports environment variable loading with Zod schema validation and provides
 * sensible defaults for all configuration options.
 *
 * @fileoverview Configuration management for Product Hunt fetcher
 * @author aoki-h-jp
 * @version 1.0.0
 */
import { z } from 'zod';
import { PRODUCT_HUNT_API_ENDPOINT, DEFAULT_USER_AGENT, DEFAULT_TIMEOUT } from '../constants/api.js';

// ============================================================================
// SCHEMA DEFINITIONS
// ============================================================================

/**
 * Log level configuration
 *
 * @interface LogLevel
 * @property {'trace'|'debug'|'info'|'warn'|'error'|'fatal'} - Available log levels
 */
export const LogLevelSchema = z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']);
export type LogLevel = z.infer<typeof LogLevelSchema>;

/**
 * Base configuration schema
 *
 * @note This tool is designed for local use only, so environment configuration is not needed.
 * All operations are performed in a local development context.
 *
 * @interface BaseConfig
 * @property {LogLevel} logLevel - Log level for debugging (default: 'info')
 */
export const BaseConfigSchema = z.object({
  logLevel: LogLevelSchema.default('info'),
});

export type BaseConfig = z.infer<typeof BaseConfigSchema>;

/**
 * Retry configuration schema
 *
 * @interface RetryConfig
 * @property {number} maxAttempts - Maximum number of retry attempts (default: 3)
 * @property {number} baseDelay - Base delay between retries in milliseconds (default: 1000)
 * @property {number} maxDelay - Maximum delay between retries in milliseconds (default: 30000)
 * @property {number} backoffMultiplier - Exponential backoff multiplier (default: 2)
 */
export const RetryConfigSchema = z.object({
  maxAttempts: z.number().min(1).default(3),
  baseDelay: z.number().min(0).default(1000),
  maxDelay: z.number().min(0).default(30000),
  backoffMultiplier: z.number().min(1).default(2),
});

export type RetryConfig = z.infer<typeof RetryConfigSchema>;

/**
 * Rate limit configuration schema
 *
 * @interface RateLimitConfig
 * @property {number} requestsPerSecond - Number of requests per second (default: 1)
 * @property {number} burstLimit - Maximum number of requests in burst mode (default: 5)
 */
export const RateLimitConfigSchema = z.object({
  requestsPerSecond: z.number().min(0).default(1),
  burstLimit: z.number().min(1).default(5),
});

export type RateLimitConfig = z.infer<typeof RateLimitConfigSchema>;

/**
 * Product Hunt API configuration schema
 *
 * @interface ProductHuntConfig
 * @property {string} apiToken - Product Hunt API token (required)
 * @property {string} endpoint - API endpoint URL (default: PRODUCT_HUNT_API_ENDPOINT)
 * @property {string} [userAgent] - Custom user agent string (optional)
 * @property {number} [timeout] - Request timeout in milliseconds (default: DEFAULT_TIMEOUT)
 */
const ProductHuntConfigSchema = z.object({
  /** Product Hunt API token (required) */
  apiToken: z.string(),
  /** API endpoint URL */
  endpoint: z.string().url(),
  /** User agent string */
  userAgent: z.string(),
  /** Request timeout in milliseconds */
  timeout: z.number().optional().default(DEFAULT_TIMEOUT),
});

/**
 * Complete fetcher configuration schema
 *
 * Extends the base configuration with Product Hunt-specific settings,
 * retry configuration, and rate limiting settings.
 *
 * @interface FetcherConfig
 * @property {LogLevel} logLevel - Log level for debugging (default: 'info')
 * @property {ProductHuntConfig} productHunt - Product Hunt API configuration
 * @property {RetryConfig} retry - Retry mechanism configuration
 * @property {RateLimitConfig} rateLimit - Rate limiting configuration
 *
 * @example
 * ```typescript
 * const config: FetcherConfig = {
 *   logLevel: 'info',
 *   productHunt: {
 *     apiToken: 'your-token',
 *     endpoint: PRODUCT_HUNT_API_ENDPOINT
 *   },
 *   retry: {
 *     maxAttempts: 3,
 *     baseDelay: 1000,
 *     maxDelay: 30000,
 *     backoffMultiplier: 2
 *   },
 *   rateLimit: {
 *     requestsPerSecond: 1,
 *     burstLimit: 5
 *   }
 * };
 * ```
 */
export const FetcherConfigSchema = BaseConfigSchema.extend({
  /** Product Hunt API configuration */
  productHunt: ProductHuntConfigSchema,
  /** Retry mechanism configuration */
  retry: RetryConfigSchema,
  /** Rate limiting configuration */
  rateLimit: RateLimitConfigSchema,
});

/**
 * Type definition for fetcher configuration
 *
 * @type {FetcherConfig}
 */
export type FetcherConfig = z.infer<typeof FetcherConfigSchema>;

// ============================================================================
// CONFIGURATION LOADING
// ============================================================================

/**
 * Loads configuration from environment variables with validation
 *
 * Reads configuration values from environment variables, applies defaults,
 * and validates the complete configuration using Zod schema validation.
 *
 * @returns Validated configuration object
 * @throws {Error} When configuration validation fails
 *
 * @example
 * ```typescript
 * // Load configuration from environment variables
 * const config = loadConfig();
 * console.log(config.productHunt.endpoint);
 * ```
 *
 * @example
 * ```typescript
 * // Error handling
 * try {
 *   const config = loadConfig();
 *   console.log('Configuration loaded successfully');
 * } catch (error) {
 *   console.error('Configuration error:', error.message);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Environment variables used:
 * // PH_API_TOKEN - Product Hunt API token (required)
 * // PH_API_ENDPOINT - API endpoint URL (optional)
 * // USER_AGENT - Custom user agent (optional)
 * // TIMEOUT - Request timeout in milliseconds (optional)
 * // LOG_LEVEL - Log level (optional, default: info)
 * // MAX_RETRIES - Maximum retry attempts (optional, default: 3)
 * // REQUEST_DELAY - Base delay between requests in seconds (optional, default: 1.0)
 * // MAX_DELAY - Maximum delay between retries in milliseconds (optional, default: 30000)
 * // BACKOFF_MULTIPLIER - Exponential backoff multiplier (optional, default: 2.0)
 * // REQUESTS_PER_SECOND - Rate limit requests per second (optional, default: 1.0)
 * // BURST_LIMIT - Rate limit burst limit (optional, default: 5)
 * ```
 */
export function loadConfig(): FetcherConfig {
  const config = {
    logLevel: (process.env.LOG_LEVEL || 'info') as 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal',

    productHunt: {
      apiToken: process.env.PH_API_TOKEN || '',
      endpoint: PRODUCT_HUNT_API_ENDPOINT,
      userAgent: DEFAULT_USER_AGENT,
      timeout: parseInt(process.env.TIMEOUT || DEFAULT_TIMEOUT.toString(), 10),
    },

    retry: {
      maxAttempts: parseInt(process.env.MAX_RETRIES || '5', 10),
      baseDelay: parseFloat(process.env.REQUEST_DELAY || '5.0') * 1000,
      maxDelay: parseInt(process.env.MAX_DELAY || '60000', 10),
      backoffMultiplier: parseFloat(process.env.BACKOFF_MULTIPLIER || '2.0'),
    },

    rateLimit: {
      requestsPerSecond: parseFloat(process.env.REQUESTS_PER_SECOND || '0.056'),
      burstLimit: parseInt(process.env.BURST_LIMIT || '3', 10),
    },
  };

  // Validation
  const result = FetcherConfigSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Invalid configuration: ${result.error.message}`);
  }

  return result.data;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

/**
 * Default configuration values for the fetcher
 *
 * Provides sensible defaults for all configuration options. These values
 * are used when environment variables are not set or when creating a
 * configuration object programmatically.
 *
 * @constant {FetcherConfig}
 *
 * @example
 * ```typescript
 * // Use default configuration
 * const config = defaultConfig;
 *
 * // Override specific values
 * const customConfig = {
 *   ...defaultConfig,
 *   productHunt: {
 *     ...defaultConfig.productHunt,
 *     apiToken: 'custom-token'
 *   }
 * };
 * ```
 */
export const defaultConfig: FetcherConfig = {
  logLevel: 'info',
  productHunt: {
    apiToken: '',
    endpoint: PRODUCT_HUNT_API_ENDPOINT,
    userAgent: DEFAULT_USER_AGENT,
    timeout: DEFAULT_TIMEOUT,
  },
  retry: {
    maxAttempts: 5,
    baseDelay: 5000, // 5秒
    maxDelay: 60000, // 60秒
    backoffMultiplier: 2,
  },
  rateLimit: {
    requestsPerSecond: 0.056, // 15分で50リクエスト (50/900秒)
    burstLimit: 3,
  },
};
