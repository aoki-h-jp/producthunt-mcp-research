/**
 * Common Types
 *
 * Shared type definitions used across all layers of the application. Includes Result types
 * for error handling and logging types. Uses Zod for runtime validation and type safety.
 *
 * This tool is designed for local-only use (see ADR-005), so environment configuration
 * has been removed for simplicity.
 *
 * @fileoverview Common type definitions
 * @author aoki-h-jp
 * @version 1.0.0
 */
import { z } from 'zod';

/**
 * Result type
 *
 * Discriminated union type for representing success or failure outcomes.
 * Provides type-safe error handling without throwing exceptions, following
 * the functional programming paradigm for error management.
 *
 * @template T - Success data type
 * @template E - Error type (defaults to Error)
 *
 * @example
 * ```typescript
 * function divide(a: number, b: number): Result<number> {
 *   if (b === 0) return { success: false, error: new Error('Division by zero') };
 *   return { success: true, data: a / b };
 * }
 *
 * const result = divide(10, 2);
 * if (result.success) {
 *   console.log(result.data); // 5
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Async result type
 *
 * Promise wrapper for Result type, commonly used for asynchronous operations.
 * Combines Promise with Result pattern for type-safe async error handling.
 *
 * @template T - Success data type
 * @template E - Error type (defaults to Error)
 *
 * @example
 * ```typescript
 * async function fetchData(): AsyncResult<string> {
 *   try {
 *     const data = await api.get('/data');
 *     return { success: true, data };
 *   } catch (error) {
 *     return { success: false, error: error as Error };
 *   }
 * }
 * ```
 */
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

/**
 * Log level schema
 *
 * Zod enum schema for log levels, ordered from most to least verbose.
 * Follows Pino logger level convention.
 *
 * @example
 * ```typescript
 * const level = LogLevelSchema.parse('info'); // OK
 * const level = LogLevelSchema.parse('verbose'); // Throws ZodError
 * ```
 */
export const LogLevelSchema = z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']);

/**
 * Log level type
 *
 * Logging severity level.
 * Inferred from LogLevelSchema for type safety.
 */
export type LogLevel = z.infer<typeof LogLevelSchema>;