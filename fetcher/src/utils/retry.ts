/**
 * Retry Logic
 *
 * Exponential backoff retry implementation for handling transient failures.
 * Supports configurable retry attempts, delays, and custom retry predicates.
 *
 * @fileoverview Retry utilities with exponential backoff
 * @author aoki-h-jp
 * @version 1.0.0
 */
import type { AsyncResult } from '@producthunt-mcp-research/shared';
import { failure, success } from '@producthunt-mcp-research/shared';
import { getDefaultLogger } from '@producthunt-mcp-research/shared';
import type { RetryConfig } from '../config/index.js';

/**
 * Retry error
 */
export class RetryError extends Error {
  constructor(
    message: string,
    public readonly attempts: number,
    public readonly lastError: Error
  ) {
    super(message);
    this.name = 'RetryError';
  }
}

/**
 * Retry with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  config: RetryConfig,
  shouldRetry?: (error: Error) => boolean
): Promise<T> {
  let lastError: Error = new Error('Unknown error');

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      const result = await fn();
      if (attempt > 1) {
        getDefaultLogger().info(`Operation succeeded on attempt ${attempt}`);
      }
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Exit if this is the last attempt or if retry is not recommended
      if (attempt === config.maxAttempts || (shouldRetry && !shouldRetry(lastError))) {
        break;
      }

      // Calculate delay time
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
        config.maxDelay
      );

      getDefaultLogger().warn(`Attempt ${attempt} failed, retrying in ${delay}ms`, {
        error: lastError.message,
        attempt,
        maxAttempts: config.maxAttempts,
      });

      await sleep(delay);
    }
  }

  throw new RetryError(
    `Operation failed after ${config.maxAttempts} attempts`,
    config.maxAttempts,
    lastError
  );
}

/**
 * Retry with Result type
 */
export async function retryWithResult<T>(
  fn: () => Promise<T>,
  config: RetryConfig,
  shouldRetry?: (error: Error) => boolean
): AsyncResult<T, RetryError> {
  try {
    const result = await retry(fn, config, shouldRetry);
    return success(result);
  } catch (error) {
    return failure(error instanceof RetryError ? error : new RetryError(
      'Retry failed with unknown error',
      config.maxAttempts,
      error instanceof Error ? error : new Error(String(error))
    ));
  }
}

/**
 * Sleep function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Default retry determination function
 */
export function isRetryableError(error: Error): boolean {
  // Network errors, timeouts, and 5xx errors are retryable
  const retryableMessages = [
    'ECONNRESET',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'timeout',
    'network',
    '5',
  ];

  const message = error.message.toLowerCase();
  return retryableMessages.some(pattern => message.includes(pattern));
}

/**
 * HTTP status code based retry determination
 */
export function isRetryableHttpStatus(status: number): boolean {
  // 5xx errors and 429 (Rate Limit) are retryable
  return status >= 500 || status === 429;
}
