/**
 * Product Hunt API Error Handler
 *
 * Handles Product Hunt API specific errors and converts them to appropriate
 * error types. Provides comprehensive error handling for GraphQL requests,
 * network issues, authentication failures, and rate limiting.
 *
 * @fileoverview Product Hunt API specific error handler
 * @author aoki-h-jp
 * @version 1.0.0
 */
import {
  ApiError,
  NetworkError,
  AuthenticationError,
  RateLimitError,
} from '../utils/errors.js';

/**
 * GraphQL error response type
 *
 * Represents the structure of error responses from GraphQL requests.
 * Used for type-safe error handling when parsing API responses.
 *
 * @interface GraphQLErrorResponse
 * @property {Object} [response] - GraphQL response object
 * @property {number} [response.status] - HTTP status code
 * @property {Array<{message: string}>} [response.errors] - Array of GraphQL errors
 */
interface GraphQLErrorResponse {
  response?: {
    status?: number;
    errors?: Array<{ message: string }>;
  };
}

/**
 * Error type including GraphQL errors
 *
 * Extends the base Error type with GraphQL-specific error response structure.
 * Used for type-safe error handling when working with GraphQL request errors.
 *
 * @type {Error & GraphQLErrorResponse}
 */
type ErrorWithGraphQLResponse = Error & GraphQLErrorResponse;

/**
 * Product Hunt API Error Handler
 *
 * Static utility class for handling Product Hunt API specific errors.
 * Converts various error types (GraphQL, network, authentication, rate limiting)
 * into appropriate error instances with proper categorization and metadata.
 *
 * @class ProductHuntErrorHandler
 * @example
 * ```typescript
 * try {
 *   const result = await client.executeQuery(query, variables);
 * } catch (error) {
 *   const handledError = ProductHuntErrorHandler.handleError(error, 'getPosts');
 *   if (ProductHuntErrorHandler.shouldRetry(handledError)) {
 *     // Retry logic
 *   }
 * }
 * ```
 */
export class ProductHuntErrorHandler {
  /**
   * Convert error to appropriate type
   *
   * Analyzes the provided error and converts it to the most appropriate
   * error type based on its structure and content. Handles GraphQL errors,
   * network errors, and unknown errors with proper categorization.
   *
   * @param error - The error to handle (can be any type)
   * @param operation - The operation that caused the error (for context)
   * @returns Appropriate error instance (ApiError, NetworkError, etc.)
   *
   * @example
   * ```typescript
   * try {
   *   const result = await client.executeQuery(query, variables);
   * } catch (error) {
   *   const handledError = ProductHuntErrorHandler.handleError(error, 'getPosts');
   *   console.error('Operation failed:', handledError.message);
   * }
   * ```
   */
  static handleError(error: unknown, operation: string): Error {
    if (error instanceof Error) {
      // Handle GraphQL-request error format
      if ('response' in error && (error as ErrorWithGraphQLResponse).response) {
        return this.handleGraphQLError(error, operation);
      }

      // Network error
      if (this.isNetworkError(error)) {
        return new NetworkError(
          error.message,
          { operation, originalError: error.message }
        );
      }

      return new ApiError(
        error.message,
        undefined,
        undefined,
        { operation, originalError: error.message }
      );
    }

    return new ApiError(
      'Unknown error occurred',
      undefined,
      undefined,
      { operation, originalError: String(error) }
    );
  }

  /**
   * Handle GraphQL errors
   *
   * Processes GraphQL-specific errors by examining the response structure
   * and converting them to appropriate error types based on status codes
   * and error messages.
   *
   * @param error - The GraphQL error with response structure
   * @param operation - The operation that caused the error
   * @returns Appropriate error instance based on GraphQL response
   *
   * @private
   */
  private static handleGraphQLError(error: Error, operation: string): Error {
    const response = (error as ErrorWithGraphQLResponse).response;

    if (!response) {
      return new ApiError(
        'Unknown GraphQL error',
        undefined,
        undefined,
        { operation, originalError: error.message }
      );
    }

    if (response.status === 401) {
      return new AuthenticationError(
        'Invalid API token',
        { operation, originalError: error.message }
      );
    }

    if (response.status === 429) {
      return new RateLimitError(
        'Rate limit exceeded',
        undefined,
        { operation, originalError: error.message }
      );
    }

    if (response.status && response.status >= 500) {
      return new ApiError(
        'Server error',
        response.status,
        response,
        { operation, originalError: error.message }
      );
    }

    if (response.errors && response.errors.length > 0) {
      return new ApiError(
        `GraphQL errors: ${response.errors.map(e => e.message).join(', ')}`,
        response.status,
        response,
        { operation, originalError: error.message }
      );
    }

    return new ApiError(
      error.message,
      response.status,
      response,
      { operation, originalError: error.message }
    );
  }

  /**
   * Determine if error is a network error
   *
   * Checks if the error message contains network-related keywords
   * to identify network connectivity issues.
   *
   * @param error - The error to check
   * @returns True if the error appears to be network-related
   *
   * @private
   */
  private static isNetworkError(error: Error): boolean {
    return error.message.includes('fetch') ||
           error.message.includes('network') ||
           error.message.includes('timeout');
  }

  /**
   * Determine if error should be retried
   *
   * Analyzes the error type and status code to determine if the operation
   * should be retried. Network errors, server errors (5xx), and rate limit
   * errors are typically retryable, while authentication errors (4xx) are not.
   *
   * @param error - The error to analyze
   * @returns True if the error should be retried, false otherwise
   *
   * @example
   * ```typescript
   * const error = ProductHuntErrorHandler.handleError(originalError, 'getPosts');
   * if (ProductHuntErrorHandler.shouldRetry(error)) {
   *   // Implement retry logic with exponential backoff
   *   await retryWithBackoff(operation, maxRetries);
   * }
   * ```
   */
  static shouldRetry(error: Error): boolean {
    // Retry network errors and server errors
    if (error instanceof NetworkError || error instanceof ApiError) {
      if (error instanceof ApiError && error.statusCode) {
        // 4xx errors (authentication errors, etc.) should not be retried
        if (error.statusCode >= 400 && error.statusCode < 500) {
          return false;
        }
        // 5xx errors should be retried
        return error.statusCode >= 500;
      }
      return true;
    }

    // Rate limit errors should be retried
    if (error instanceof RateLimitError) {
      return true;
    }

    // Authentication errors should not be retried
    if (error instanceof AuthenticationError) {
      return false;
    }

    return false;
  }
}
