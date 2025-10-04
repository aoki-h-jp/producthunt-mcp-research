/**
 * Result Utilities
 *
 * Utility functions for working with Result types. Provides functional
 * programming patterns for error handling including map, flatMap, unwrap,
 * and composition operations. Enables type-safe error handling without exceptions.
 *
 * @fileoverview Result type utility functions
 * @author aoki-h-jp
 * @version 1.0.0
 */
import type { Result, AsyncResult } from '../types/common.js';

/**
 * Creates a success result
 *
 * Factory function for creating a successful Result value.
 *
 * @template T - Success data type
 * @param data - The success value to wrap
 * @returns Success Result containing the data
 *
 * @example
 * ```typescript
 * const result = success(42);
 * // { success: true, data: 42 }
 * ```
 */
export function success<T>(data: T): Result<T, never> {
  return { success: true, data };
}

/**
 * Creates a failure result
 *
 * Factory function for creating a failed Result value.
 *
 * @template E - Error type
 * @param error - The error value to wrap
 * @returns Failure Result containing the error
 *
 * @example
 * ```typescript
 * const result = failure(new Error('Something went wrong'));
 * // { success: false, error: Error }
 * ```
 */
export function failure<E>(error: E): Result<never, E> {
  return { success: false, error };
}

/**
 * Wraps async function in Result type
 *
 * Executes an async function and wraps the result in a Result type.
 * Catches any thrown exceptions and converts them to failure Results.
 *
 * @template T - Return type of the async function
 * @param fn - Async function to wrap
 * @returns Promise resolving to Result
 *
 * @example
 * ```typescript
 * const result = await wrapAsync(async () => {
 *   const response = await fetch('/api/data');
 *   return response.json();
 * });
 *
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export async function wrapAsync<T>(
  fn: () => Promise<T>
): Promise<Result<T, Error>> {
  try {
    const data = await fn();
    return success(data);
  } catch (error) {
    return failure(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Wraps sync function in Result type
 *
 * Executes a synchronous function and wraps the result in a Result type.
 * Catches any thrown exceptions and converts them to failure Results.
 *
 * @template T - Return type of the function
 * @param fn - Function to wrap
 * @returns Result containing the value or error
 *
 * @example
 * ```typescript
 * const result = wrap(() => {
 *   return JSON.parse(jsonString);
 * });
 * ```
 */
export function wrap<T>(fn: () => T): Result<T, Error> {
  try {
    const data = fn();
    return success(data);
  } catch (error) {
    return failure(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Unwraps Result value (throws on error)
 *
 * Extracts the success value from a Result, throwing the error if failed.
 * Use with caution as this reintroduces exception-based error handling.
 *
 * @template T - Success data type
 * @template E - Error type
 * @param result - Result to unwrap
 * @returns The unwrapped success value
 * @throws The error if Result is a failure
 *
 * @example
 * ```typescript
 * const result = success(42);
 * const value = unwrap(result); // 42
 *
 * const error = failure(new Error('Failed'));
 * unwrap(error); // Throws Error
 * ```
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.success) {
    return result.data;
  }
  throw result.error;
}

/**
 * Unwraps Result value or returns default
 *
 * Safely extracts the success value from a Result, returning a default value if failed.
 *
 * @template T - Success data type
 * @template E - Error type
 * @param result - Result to unwrap
 * @param defaultValue - Default value to return on failure
 * @returns The unwrapped value or default
 *
 * @example
 * ```typescript
 * const result = failure(new Error('Failed'));
 * const value = unwrapOr(result, 0); // 0
 * ```
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  return result.success ? result.data : defaultValue;
}

/**
 * Maps Result value
 *
 * Transforms the success value of a Result using the provided function.
 * Preserves failure Results unchanged.
 *
 * @template T - Original success type
 * @template U - Transformed success type
 * @template E - Error type
 * @param result - Result to map
 * @param fn - Transformation function
 * @returns Mapped Result
 *
 * @example
 * ```typescript
 * const result = success(5);
 * const doubled = map(result, x => x * 2);
 * // { success: true, data: 10 }
 * ```
 */
export function map<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  return result.success ? success(fn(result.data)) : result;
}

/**
 * Maps Result value asynchronously
 *
 * Transforms the success value of a Result using an async function.
 * Preserves failure Results unchanged.
 *
 * @template T - Original success type
 * @template U - Transformed success type
 * @template E - Error type
 * @param result - Result to map
 * @param fn - Async transformation function
 * @returns Promise resolving to mapped Result
 */
export async function mapAsync<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Promise<U>
): Promise<Result<U, E>> {
  if (result.success) {
    try {
      const mapped = await fn(result.data);
      return success(mapped);
    } catch (error) {
      return failure(error as E);
    }
  }
  return result;
}

/**
 * Flat maps Result value
 *
 * Transforms the success value of a Result using a function that returns a Result.
 * Useful for chaining operations that can fail.
 *
 * @template T - Original success type
 * @template U - Transformed success type
 * @template E - Error type
 * @param result - Result to flat map
 * @param fn - Transformation function returning Result
 * @returns Flat mapped Result
 *
 * @example
 * ```typescript
 * const result = success('42');
 * const parsed = flatMap(result, str => {
 *   const num = parseInt(str);
 *   return isNaN(num) ? failure(new Error('Not a number')) : success(num);
 * });
 * ```
 */
export function flatMap<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> {
  return result.success ? fn(result.data) : result;
}

/**
 * Flat maps Result value asynchronously
 *
 * Transforms the success value of a Result using an async function that returns a Result.
 * Useful for chaining async operations that can fail.
 *
 * @template T - Original success type
 * @template U - Transformed success type
 * @template E - Error type
 * @param result - Result to flat map
 * @param fn - Async transformation function returning Result
 * @returns Promise resolving to flat mapped Result
 */
export async function flatMapAsync<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => AsyncResult<U, E>
): Promise<Result<U, E>> {
  return result.success ? await fn(result.data) : result;
}

/**
 * Maps Result error
 *
 * Transforms the error value of a Result using the provided function.
 * Preserves success Results unchanged.
 *
 * @template T - Success type
 * @template E - Original error type
 * @template F - Transformed error type
 * @param result - Result to map
 * @param fn - Error transformation function
 * @returns Result with mapped error
 */
export function mapError<T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> {
  return result.success ? result : failure(fn(result.error));
}

/**
 * Combines multiple Results
 *
 * Combines a tuple of Results into a single Result containing a tuple of values.
 * Fails if any of the input Results is a failure.
 *
 * @template T - Tuple of success types
 * @param results - Tuple of Results to combine
 * @returns Result containing tuple of values or first error
 *
 * @example
 * ```typescript
 * const results = combine([
 *   success(1),
 *   success('hello'),
 *   success(true)
 * ]);
 * // { success: true, data: [1, 'hello', true] }
 * ```
 */
export function combine<T extends readonly unknown[]>(
  results: { [K in keyof T]: Result<T[K], Error> }
): Result<T, Error> {
  const values: unknown[] = [];
  
  for (const result of results) {
    if (!result.success) {
      return result;
    }
    values.push(result.data);
  }
  
  return success(values as unknown as T);
}

/**
 * Combines array of Results
 *
 * Converts an array of Results into a Result of an array.
 * Fails if any of the input Results is a failure.
 *
 * @template T - Success type
 * @param results - Array of Results to combine
 * @returns Result containing array of values or first error
 *
 * @example
 * ```typescript
 * const results = all([
 *   success(1),
 *   success(2),
 *   success(3)
 * ]);
 * // { success: true, data: [1, 2, 3] }
 * ```
 */
export function all<T>(results: Result<T, Error>[]): Result<T[], Error> {
  const values: T[] = [];
  
  for (const result of results) {
    if (!result.success) {
      return result;
    }
    values.push(result.data);
  }
  
  return success(values);
}