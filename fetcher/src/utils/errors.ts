/**
 * Error Classes
 *
 * Error class hierarchy for type-safe error handling.
 * Provides specialized error types for different failure scenarios.
 *
 * @fileoverview Error class definitions
 * @author aoki-h-jp
 * @version 1.0.0
 */

/**
 * Error information
 */
export interface ErrorInfo {
  code: string;
  message: string;
  details?: Record<string, unknown> | undefined;
  timestamp: Date;
  stack?: string | undefined;
}

/**
 * Base error class
 *
 * Abstract base class for all custom errors.
 *
 * @abstract
 * @class BaseError
 * @extends Error
 */
export abstract class BaseError extends Error {
  public readonly code: string;
  public readonly timestamp: Date;
  public readonly details?: Record<string, unknown> | undefined;

  constructor(
    code: string,
    message: string,
    details?: Record<string, unknown> | undefined
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.timestamp = new Date();
    this.details = details;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toErrorInfo(): ErrorInfo {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

/**
 * Configuration error
 */
export class ConfigError extends BaseError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('CONFIG_ERROR', message, details);
  }
}

/**
 * Network error
 */
export class NetworkError extends BaseError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('NETWORK_ERROR', message, details);
  }
}

/**
 * API error
 */
export class ApiError extends BaseError {
  public readonly statusCode?: number | undefined;
  public readonly response?: unknown;

  constructor(
    message: string,
    statusCode?: number | undefined,
    response?: unknown,
    details?: Record<string, unknown> | undefined
  ) {
    super('API_ERROR', message, { ...details, statusCode, response });
    this.statusCode = statusCode;
    this.response = response;
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends BaseError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('AUTHENTICATION_ERROR', message, details);
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends BaseError {
  public readonly retryAfter?: number | undefined;

  constructor(
    message: string,
    retryAfter?: number | undefined,
    details?: Record<string, unknown> | undefined
  ) {
    super('RATE_LIMIT_ERROR', message, { ...details, retryAfter });
    this.retryAfter = retryAfter;
  }
}

/**
 * Converts unknown error to BaseError
 */
export function toBaseError(error: unknown): BaseError {
  if (error instanceof BaseError) {
    return error;
  }
  
  if (error instanceof Error) {
    const err = error;
    return new class extends BaseError {
      constructor() {
        super('UNKNOWN_ERROR', err.message, {
          originalName: err.name,
          originalStack: err.stack,
        });
      }
    }();
  }
  
  const errorStr = String(error);
  return new class extends BaseError {
    constructor() {
      super('UNKNOWN_ERROR', errorStr);
    }
  }();
}

/**
 * Checks if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof NetworkError) {
    return true;
  }
  
  if (error instanceof ApiError) {
    return error.statusCode ? error.statusCode >= 500 : false;
  }
  
  if (error instanceof RateLimitError) {
    return true;
  }
  
  return false;
}