/**
 * Rate Limiting
 *
 * Token bucket rate limiting implementation for controlling request frequency.
 * Supports burst capacity and sustained rate limits with automatic token refill.
 *
 * @fileoverview Rate limiting utilities
 * @author aoki-h-jp
 * @version 1.0.0
 */
import type { RateLimitConfig } from '../config/index.js';
import { getDefaultLogger } from '@producthunt-mcp-research/shared';

/**
 * Rate limiter
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.tokens = config.burstLimit;
    this.lastRefill = Date.now();
  }

  /**
   * Execute request (apply rate limiting)
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    await this.waitForToken();
    return await fn();
  }

  /**
   * Wait for token
   */
  async waitForToken(): Promise<void> {
    this.refillTokens();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }

    // Wait if tokens are insufficient
    const waitTime = 1000 / this.config.requestsPerSecond;
    getDefaultLogger().debug(`Rate limit reached, waiting ${waitTime}ms`);

    await new Promise(resolve => setTimeout(resolve, waitTime));
    return this.waitForToken();
  }

  /**
   * Refill tokens
   */
  private refillTokens(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = (timePassed / 1000) * this.config.requestsPerSecond;

    this.tokens = Math.min(this.config.burstLimit, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Get current token count
   */
  getAvailableTokens(): number {
    this.refillTokens();
    return Math.floor(this.tokens);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RateLimitConfig>): void {
    Object.assign(this.config, config);

    // Adjust token count if burst limit is changed
    if (config.burstLimit !== undefined) {
      this.tokens = Math.min(this.tokens, config.burstLimit);
    }
  }
}

/**
 * Global rate limiter map
 */
const rateLimiters = new Map<string, RateLimiter>();

/**
 * Get or create named rate limiter
 */
export function getRateLimiter(name: string, config: RateLimitConfig): RateLimiter {
  if (!rateLimiters.has(name)) {
    rateLimiters.set(name, new RateLimiter(config));
  }
  return rateLimiters.get(name)!;
}

/**
 * Remove rate limiter
 */
export function removeRateLimiter(name: string): void {
  rateLimiters.delete(name);
}

/**
 * Clear all rate limiters
 */
export function clearRateLimiters(): void {
  rateLimiters.clear();
}
