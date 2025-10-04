/**
 * TopicsClient Tests
 *
 * Comprehensive test suite for the TopicsClient class, which handles all
 * Product Hunt topic-related API operations. This test suite validates the
 * client's ability to fetch topics with various parameters, handle pagination,
 * manage different sorting options, and properly handle errors.
 *
 * The TopicsClient is responsible for:
 * - Fetching topics with pagination support
 * - Supporting various sorting options (trending, newest, etc.)
 * - Managing cursor-based pagination
 * - Providing proper error handling for all operations
 *
 * @fileoverview Test suite for TopicsClient functionality
 * @author aoki-h-jp
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TopicsClient } from '../../src/clients/topics.js';
import { Logger, RateLimiter } from '@producthunt-mcp-research/shared';
import { mockTopicsResponse, mockTopicsQueryVariables } from '../fixtures/mock-data/topics.js';
import { PRODUCT_HUNT_API_ENDPOINT } from '../../src/constants/api.js';

/**
 * Mock BaseGraphQLClient
 *
 * Mocks the BaseGraphQLClient to isolate TopicsClient testing from the base
 * client implementation. This mock provides a controlled environment for
 * testing TopicsClient-specific functionality without depending on the actual
 * GraphQL execution logic.
 */
vi.mock('../../src/clients/base.js', () => ({
  BaseGraphQLClient: class {
    protected client: any;
    protected logger: Logger;
    protected retryConfig: any;
    protected rateLimiter: RateLimiter;

    constructor(config: any, retryConfig: any, rateLimiter: RateLimiter, logger: Logger) {
      this.client = { request: vi.fn() };
      this.logger = logger;
      this.retryConfig = retryConfig;
      this.rateLimiter = rateLimiter;
    }

    async executeQuery<T>(query: string, variables: any, operationName: string): Promise<any> {
      // Mock implementation that returns successful response by default
      return { success: true, data: mockTopicsResponse };
    }
  }
}));

describe('TopicsClient', () => {
  let topicsClient: TopicsClient;
  let mockLogger: Logger;
  let mockRateLimiter: RateLimiter;

  beforeEach(() => {
    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      child: vi.fn().mockReturnThis()
    } as any;

    mockRateLimiter = {
      acquire: vi.fn().mockResolvedValue(undefined),
      release: vi.fn(),
      getStats: vi.fn().mockReturnValue({})
    } as any;

    topicsClient = new TopicsClient(
      { apiToken: 'test-token', endpoint: PRODUCT_HUNT_API_ENDPOINT },
      { maxAttempts: 3, baseDelay: 1000, maxDelay: 30000, backoffMultiplier: 2 },
      mockRateLimiter,
      mockLogger
    );
  });

  describe('getTopics', () => {
    it('should fetch topics with valid parameters', async () => {
      const result = await topicsClient.getTopics(mockTopicsQueryVariables);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockTopicsResponse);
        expect(result.data.topics.edges).toHaveLength(2);
        expect(result.data.topics.edges[0].node.id).toBe('topic-123');
        expect(result.data.topics.edges[0].node.name).toBe('Artificial Intelligence');
      }
    });

    it('should handle pagination with after cursor', async () => {
      const variablesWithCursor = {
        ...mockTopicsQueryVariables,
        after: 'cursor-1'
      };

      const result = await topicsClient.getTopics(variablesWithCursor);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockTopicsResponse);
      }
    });

    it('should handle different sort orders', async () => {
      const variablesWithOrder = {
        ...mockTopicsQueryVariables,
        order: 'RECENT' as const
      };

      const result = await topicsClient.getTopics(variablesWithOrder);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockTopicsResponse);
      }
    });

    it('should handle network errors', async () => {
      // Mock network error
      const mockExecuteQuery = vi.fn().mockResolvedValue({
        success: false,
        error: new Error('Network error')
      });

      (topicsClient as any).executeQuery = mockExecuteQuery;

      const result = await topicsClient.getTopics(mockTopicsQueryVariables);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Network error');
      }
    });

    it('should handle authentication errors', async () => {
      // Mock authentication error
      const mockExecuteQuery = vi.fn().mockResolvedValue({
        success: false,
        error: new Error('Authentication failed')
      });

      (topicsClient as any).executeQuery = mockExecuteQuery;

      const result = await topicsClient.getTopics(mockTopicsQueryVariables);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Authentication failed');
      }
    });

    it('should handle rate limit errors', async () => {
      // Mock rate limit error
      const mockExecuteQuery = vi.fn().mockResolvedValue({
        success: false,
        error: new Error('Rate limit exceeded')
      });

      (topicsClient as any).executeQuery = mockExecuteQuery;

      const result = await topicsClient.getTopics(mockTopicsQueryVariables);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Rate limit exceeded');
      }
    });

  });
});
