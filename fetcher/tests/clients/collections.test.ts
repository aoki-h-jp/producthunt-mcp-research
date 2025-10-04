/**
 * CollectionsClient Tests
 *
 * Comprehensive test suite for the CollectionsClient class, which handles all
 * Product Hunt collection-related API operations. This test suite validates the
 * client's ability to fetch collections with various parameters, handle pagination,
 * manage different page sizes, and properly handle errors.
 *
 * The CollectionsClient is responsible for:
 * - Fetching collections with pagination support
 * - Supporting various page sizes
 * - Managing cursor-based pagination
 * - Handling empty collection responses
 * - Providing proper error handling for all operations
 *
 * @fileoverview Test suite for CollectionsClient functionality
 * @author aoki-h-jp
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CollectionsClient } from '../../src/clients/collections.js';
import { Logger, RateLimiter } from '@producthunt-mcp-research/shared';
import { mockCollectionsResponse, mockCollectionsQueryVariables } from '../fixtures/mock-data/collections.js';
import { PRODUCT_HUNT_API_ENDPOINT } from '../../src/constants/api.js';

/**
 * Mock BaseGraphQLClient
 *
 * Mocks the BaseGraphQLClient to isolate CollectionsClient testing from the base
 * client implementation. This mock provides a controlled environment for
 * testing CollectionsClient-specific functionality without depending on the actual
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
      return { success: true, data: mockCollectionsResponse };
    }
  }
}));

describe('CollectionsClient', () => {
  let collectionsClient: CollectionsClient;
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

    collectionsClient = new CollectionsClient(
      { apiToken: 'test-token', endpoint: PRODUCT_HUNT_API_ENDPOINT },
      { maxAttempts: 3, baseDelay: 1000, maxDelay: 30000, backoffMultiplier: 2 },
      mockRateLimiter,
      mockLogger
    );
  });

  describe('getCollections', () => {
    it('should fetch collections with valid parameters', async () => {
      const result = await collectionsClient.getCollections(mockCollectionsQueryVariables);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockCollectionsResponse);
        expect(result.data.collections.edges).toHaveLength(2);
        expect(result.data.collections.edges[0].node.id).toBe('collection-123');
        expect(result.data.collections.edges[0].node.name).toBe('Best AI Tools');
      }
    });

    it('should handle pagination with after cursor', async () => {
      const variablesWithCursor = {
        ...mockCollectionsQueryVariables,
        after: 'cursor-1'
      };

      const result = await collectionsClient.getCollections(variablesWithCursor);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockCollectionsResponse);
      }
    });

    it('should handle different page sizes', async () => {
      const variablesWithPageSize = {
        ...mockCollectionsQueryVariables,
        first: 50
      };

      const result = await collectionsClient.getCollections(variablesWithPageSize);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockCollectionsResponse);
      }
    });

    it('should handle network errors', async () => {
      // Mock network error
      const mockExecuteQuery = vi.fn().mockResolvedValue({
        success: false,
        error: new Error('Network error')
      });

      (collectionsClient as any).executeQuery = mockExecuteQuery;

      const result = await collectionsClient.getCollections(mockCollectionsQueryVariables);

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

      (collectionsClient as any).executeQuery = mockExecuteQuery;

      const result = await collectionsClient.getCollections(mockCollectionsQueryVariables);

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

      (collectionsClient as any).executeQuery = mockExecuteQuery;

      const result = await collectionsClient.getCollections(mockCollectionsQueryVariables);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Rate limit exceeded');
      }
    });

    it('should handle empty collections response', async () => {
      // Mock empty collections response
      const mockExecuteQuery = vi.fn().mockResolvedValue({
        success: true,
        data: {
          collections: {
            edges: [],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null
            }
          }
        }
      });

      (collectionsClient as any).executeQuery = mockExecuteQuery;

      const result = await collectionsClient.getCollections(mockCollectionsQueryVariables);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.collections.edges).toHaveLength(0);
        expect(result.data.collections.pageInfo.hasNextPage).toBe(false);
      }
    });
  });
});
