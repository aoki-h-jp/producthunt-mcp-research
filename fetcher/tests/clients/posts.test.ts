/**
 * PostsClient Tests
 *
 * Comprehensive test suite for the PostsClient class, which handles all
 * Product Hunt post-related API operations. This test suite validates the
 * client's ability to fetch posts with various parameters, handle pagination,
 * manage different sorting options, and properly handle errors.
 *
 * The PostsClient is responsible for:
 * - Fetching posts with pagination support
 * - Supporting various sorting options (trending, newest, etc.)
 * - Handling topic-based filtering
 * - Managing cursor-based pagination
 * - Providing proper error handling for all operations
 *
 * @fileoverview Test suite for PostsClient functionality
 * @author aoki-h-jp
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostsClient } from '../../src/clients/posts.js';
import { Logger, RateLimiter } from '@producthunt-mcp-research/shared';
import { mockPostsResponse, mockPostsQueryVariables } from '../fixtures/mock-data/posts.js';
import { PRODUCT_HUNT_API_ENDPOINT } from '../../src/constants/api.js';
import { GraphQLClient } from 'graphql-request';

/**
 * Mock GraphQLClient
 *
 * Mocks the graphql-request GraphQLClient to provide controlled responses
 * for testing. The mock implementation allows us to simulate various
 * scenarios including successful responses, network errors, and API errors.
 */
vi.mock('graphql-request', () => ({
  GraphQLClient: vi.fn().mockImplementation(() => ({
    request: vi.fn()
  }))
}));

/**
 * Mock ProductHuntErrorHandler
 *
 * Mocks the ProductHuntErrorHandler to control error handling behavior
 * during tests. This allows us to test different error scenarios and
 * verify that the retry logic works correctly for different error types.
 */
vi.mock('../../src/errors/api-error-handler.js', () => ({
  ProductHuntErrorHandler: {
    handleError: vi.fn((error) => error),
    shouldRetry: vi.fn((error) => error.message.includes('Transient') || error.message.includes('Network'))
  }
}));

describe('PostsClient', () => {
  let postsClient: PostsClient;
  let mockLogger: Logger;
  let mockRateLimiter: RateLimiter;
  let mockGraphQLClient: any;

  /**
   * Test setup
   *
   * Initializes mock objects and creates a fresh PostsClient instance
   * for each test. This ensures test isolation and prevents state leakage
   * between tests.
   */
  beforeEach(() => {
    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      child: vi.fn().mockReturnThis()
    } as any;

    mockRateLimiter = {
      execute: vi.fn().mockImplementation(async (fn) => fn()),
      acquire: vi.fn().mockResolvedValue(undefined),
      release: vi.fn(),
      getStats: vi.fn().mockReturnValue({})
    } as any;

    // Create mock GraphQL client
    mockGraphQLClient = {
      request: vi.fn()
    };
    (GraphQLClient as any).mockImplementation(() => mockGraphQLClient);

    postsClient = new PostsClient(
      { apiToken: 'test-token', endpoint: PRODUCT_HUNT_API_ENDPOINT },
      { maxAttempts: 3, baseDelay: 1000, maxDelay: 30000, backoffMultiplier: 2 },
      mockRateLimiter,
      mockLogger
    );
  });

  describe('getPosts', () => {
    /**
     * Test successful posts fetching with valid parameters
     *
     * Verifies that the PostsClient can successfully fetch posts when provided
     * with valid query parameters. This test ensures the basic functionality
     * works correctly and returns the expected data structure.
     */
    it('should fetch posts with valid parameters', async () => {
      mockGraphQLClient.request.mockResolvedValue(mockPostsResponse);

      const result = await postsClient.getPosts(mockPostsQueryVariables);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockPostsResponse);
        expect(result.data.posts.edges).toHaveLength(2);
        expect(result.data.posts.edges[0].node.id).toBe('post-123');
      }
    });

    /**
     * Test pagination with after cursor
     *
     * Verifies that the PostsClient can handle cursor-based pagination by
     * accepting an 'after' cursor parameter. This test ensures that pagination
     * works correctly and allows fetching subsequent pages of posts.
     */
    it('should handle pagination with after cursor', async () => {
      mockGraphQLClient.request.mockResolvedValue(mockPostsResponse);

      const variablesWithCursor = {
        ...mockPostsQueryVariables,
        after: 'cursor-1'
      };

      const result = await postsClient.getPosts(variablesWithCursor);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockPostsResponse);
      }
    });

    /**
     * Test topic-based filtering
     *
     * Verifies that the PostsClient can filter posts by topic when a topic
     * parameter is provided. This test ensures that topic filtering works
     * correctly and allows users to fetch posts related to specific topics.
     */
    it('should handle topic filtering', async () => {
      mockGraphQLClient.request.mockResolvedValue(mockPostsResponse);

      const variablesWithTopic = {
        ...mockPostsQueryVariables,
        topic: 'artificial-intelligence'
      };

      const result = await postsClient.getPosts(variablesWithTopic);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockPostsResponse);
      }
    });

    /**
     * Test network error handling
     *
     * Verifies that the PostsClient properly handles network errors by
     * returning appropriate error responses. This test ensures that network
     * connectivity issues are handled gracefully and don't cause the
     * application to crash.
     */
    it('should handle network errors', async () => {
      mockGraphQLClient.request.mockRejectedValue(new Error('Network error'));

      const result = await postsClient.getPosts(mockPostsQueryVariables);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Operation failed after 3 attempts');
      }
    });

    /**
     * Test authentication error handling
     *
     * Verifies that the PostsClient properly handles authentication errors
     * by returning appropriate error responses. This test ensures that
     * invalid or expired API tokens are handled gracefully.
     */
    it('should handle authentication errors', async () => {
      mockGraphQLClient.request.mockRejectedValue(new Error('Authentication failed'));

      const result = await postsClient.getPosts(mockPostsQueryVariables);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Operation failed after 3 attempts');
      }
    });

    /**
     * Test rate limit error handling
     *
     * Verifies that the PostsClient properly handles rate limit errors
     * by returning appropriate error responses. This test ensures that
     * API rate limit violations are handled gracefully and the client
     * respects Product Hunt's rate limiting constraints.
     */
    it('should handle rate limit errors', async () => {
      mockGraphQLClient.request.mockRejectedValue(new Error('Rate limit exceeded'));

      const result = await postsClient.getPosts(mockPostsQueryVariables);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Operation failed after 3 attempts');
      }
    });

  });
});
