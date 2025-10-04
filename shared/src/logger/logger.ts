/**
 * Logger
 *
 * Structured logging implementation using Pino logger library.
 * Provides consistent logging across all layers with support for pretty printing
 * in development and JSON output in production.
 *
 * @fileoverview Logger implementation
 * @author aoki-h-jp
 * @version 1.0.0
 */
import pino from 'pino';
import type { LogLevel } from '../types/common.js';

/**
 * Logger configuration
 *
 * Configuration options for creating a Logger instance.
 * This tool is designed for local-only use (see ADR-005), so environment
 * configuration is not needed.
 *
 * @interface LoggerConfig
 * @property {LogLevel} level - Minimum log level to output
 * @property {string} service - Service name for log context
 * @property {boolean} [prettyPrint] - Enable pretty printing (default: false)
 */
export interface LoggerConfig {
  level: LogLevel;
  service: string;
  prettyPrint?: boolean;
}

/**
 * Default logger instance (for backward compatibility)
 *
 * Singleton logger instance used by utility functions that don't receive
 * a logger parameter. Can be configured via setDefaultLogger().
 *
 * @private
 */
let defaultLogger: Logger | null = null;

/**
 * Sets default logger
 *
 * Configures the default logger instance used by the log() utility function.
 * Useful for setting up logging before individual loggers are created.
 *
 * @param config - Logger configuration
 *
 * @example
 * ```typescript
 * setDefaultLogger({
 *   level: 'debug',
 *   service: 'my-app',
 *   prettyPrint: true
 * });
 * ```
 */
export function setDefaultLogger(config: LoggerConfig): void {
  defaultLogger = new Logger(config);
}

/**
 * Gets default logger
 *
 * Returns the default logger instance, creating one with default configuration
 * if it doesn't exist yet.
 *
 * @returns Default Logger instance
 *
 * @example
 * ```typescript
 * const logger = getDefaultLogger();
 * logger.info('Using default logger');
 * ```
 */
export function getDefaultLogger(): Logger {
  if (!defaultLogger) {
    defaultLogger = new Logger({
      level: 'info',
      service: 'default',
      prettyPrint: true,
    });
  }
  return defaultLogger;
}

/**
 * Default logging function
 *
 * Convenience function for logging using the default logger instance.
 * Useful for quick logging without creating a logger instance.
 *
 * @param level - Log level
 * @param message - Log message
 * @param metadata - Optional metadata object
 *
 * @example
 * ```typescript
 * log('info', 'Application started');
 * log('error', 'Failed to connect', { host: 'localhost', port: 5432 });
 * ```
 */
export function log(level: LogLevel, message: string, metadata?: Record<string, unknown>): void {
  const logger = getDefaultLogger();
  logger[level](message, metadata);
}

/**
 * Logger class
 *
 * Main logger class providing structured logging with Pino.
 * Supports multiple log levels, metadata attachment, and child logger creation.
 *
 * @class Logger
 * @example
 * ```typescript
 * const logger = new Logger({
 *   level: 'info',
 *   service: 'my-service',
 *   prettyPrint: false
 * });
 *
 * logger.info('Service started');
 * logger.error('Operation failed', { error: err.message });
 *
 * const childLogger = logger.child({ userId: '123' });
 * childLogger.info('User action'); // Includes userId in all logs
 * ```
 */
export class Logger {
  private logger: pino.Logger;
  private config: LoggerConfig;

  /**
   * Creates a new Logger instance
   *
   * Initializes a Pino logger with the specified configuration.
   * Sets up pretty printing for development or JSON output for production.
   *
   * @param config - Logger configuration
   */
  constructor(config: LoggerConfig) {
    this.config = config;

    const pinoConfig: pino.LoggerOptions = {
      level: config.level,
      ...(config.prettyPrint
        ? {
            transport: {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'yyyy-mm-dd HH:MM:ss',
                ignore: 'pid,hostname',
              },
            },
          }
        : {}),
    };

    this.logger = pino(pinoConfig);
  }

  /**
   * Creates child logger with additional context
   *
   * Creates a child logger that inherits configuration from the parent
   * and includes additional bindings in all log entries.
   *
   * @param bindings - Additional context to include in all logs
   * @returns New Logger instance with additional bindings
   *
   * @example
   * ```typescript
   * const requestLogger = logger.child({ requestId: '123', userId: 'abc' });
   * requestLogger.info('Processing request'); // Includes requestId and userId
   * ```
   */
  child(bindings: Record<string, unknown>): Logger {
    const childLogger = new Logger(this.config);
    childLogger.logger = this.logger.child(bindings);
    return childLogger;
  }

  /**
   * Trace level log
   *
   * Logs a trace level message. Use for very detailed diagnostic information.
   *
   * @param message - Log message
   * @param metadata - Optional metadata object
   */
  trace(message: string, metadata?: Record<string, unknown>): void {
    this.logger.trace({ ...metadata, service: this.config.service }, message);
  }

  /**
   * Debug level log
   *
   * Logs a debug level message. Use for diagnostic information.
   *
   * @param message - Log message
   * @param metadata - Optional metadata object
   */
  debug(message: string, metadata?: Record<string, unknown>): void {
    this.logger.debug({ ...metadata, service: this.config.service }, message);
  }

  /**
   * Info level log
   *
   * Logs an info level message. Use for general informational messages.
   *
   * @param message - Log message
   * @param metadata - Optional metadata object
   */
  info(message: string, metadata?: Record<string, unknown>): void {
    this.logger.info({ ...metadata, service: this.config.service }, message);
  }

  /**
   * Warn level log
   *
   * Logs a warning level message. Use for potentially harmful situations.
   *
   * @param message - Log message
   * @param metadata - Optional metadata object
   */
  warn(message: string, metadata?: Record<string, unknown>): void {
    this.logger.warn({ ...metadata, service: this.config.service }, message);
  }

  /**
   * Error level log
   *
   * Logs an error level message. Use for error events.
   *
   * @param message - Log message
   * @param metadata - Optional metadata object
   */
  error(message: string, metadata?: Record<string, unknown>): void {
    this.logger.error({ ...metadata, service: this.config.service }, message);
  }

  /**
   * Fatal level log
   *
   * Logs a fatal level message. Use for critical errors that cause shutdown.
   *
   * @param message - Log message
   * @param metadata - Optional metadata object
   */
  fatal(message: string, metadata?: Record<string, unknown>): void {
    this.logger.fatal({ ...metadata, service: this.config.service }, message);
  }
}