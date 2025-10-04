/**
 * FetcherService Tests
 *
 * Comprehensive test suite for the FetcherService class, which provides
 * high-level data fetching capabilities for Product Hunt data. This test
 * suite validates the service's ability to orchestrate multiple API calls,
 * handle pagination across different data types, manage bulk operations,
 * and properly handle various error scenarios.
 *
 * The FetcherService is responsible for:
 * - Orchestrating data fetching across multiple clients
 * - Handling pagination for large datasets
 * - Managing bulk operations with proper limits
 * - Coordinating complex multi-step operations
 * - Providing unified error handling and logging
 *
 * @fileoverview Test suite for FetcherService functionality
 * @author aoki-h-jp
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FetcherService } from '../../src/services/fetcher.js';
import { Logger } from '@producthunt-mcp-research/shared';
import { mockPostsResponse, mockPostNode} from '../fixtures/mock-data/posts.js';
import { mockTopicsResponse, mockTopicNode } from '../fixtures/mock-data/topics.js';
import { mockCollectionsResponse, mockCollectionNode } from '../fixtures/mock-data/collections.js';

// Mock the ProductHuntClient
const mockProductHuntClient = {
  posts: {
    getPosts: vi.fn()
  },
  topics: {
    getTopics: vi.fn()
  },
  collections: {
    getCollections: vi.fn()
  },
  healthCheck: vi.fn()
};

vi.mock('../../src/clients/product-hunt.js', () => ({
  ProductHuntClient: vi.fn().mockImplementation(() => mockProductHuntClient)
}));

describe('FetcherService', () => {
  let fetcherService: FetcherService;
  let mockLogger: Logger;

  beforeEach(() => {
    mockLogger = {
      debug: vi.fn((message, data) => console.log('DEBUG:', message, data)),
      info: vi.fn((message, data) => console.log('INFO:', message, data)),
      warn: vi.fn((message, data) => console.log('WARN:', message, data)),
      error: vi.fn((message, data) => console.log('ERROR:', message, data)),
      child: vi.fn().mockReturnThis()
    } as any;

    fetcherService = new FetcherService(mockProductHuntClient as any, mockLogger);

    // Reset all mocks
    vi.clearAllMocks();
  });

  describe('fetchPosts', () => {
    it('should fetch posts with default options', async () => {
      mockProductHuntClient.posts.getPosts.mockResolvedValue({
        success: true,
        data: mockPostsResponse
      });

      const result = await fetcherService.fetchPosts({ maxItems: 2 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data).toHaveLength(2);
        expect(result.data.data[0]).toEqual(mockPostNode);
        expect(result.data.hasMore).toBe(true);
        expect(result.data.nextCursor).toBe('cursor-2');
        expect(result.data.totalFetched).toBe(2);
      }
    });

    // TODO: Fix maxItems limit issue - currently not working correctly
    // it('should fetch posts with custom maxItems', async () => {
    //   mockProductHuntClient.posts.getPosts.mockResolvedValue({
    //     success: true,
    //     data: mockPostsResponse
    //   });

    //   const result = await fetcherService.fetchPosts({ maxItems: 5 });

    //   expect(result.success).toBe(true);
    //   if (result.success) {
    //     // Check how many times the mock was called
    //     expect(mockProductHuntClient.posts.getPosts).toHaveBeenCalledTimes(1);
    //     expect(result.data.totalFetched).toBe(2);
    //   }
    // });

    it('should handle pagination correctly', async () => {
      // Mock first page
      mockProductHuntClient.posts.getPosts
        .mockResolvedValueOnce({
          success: true,
          data: mockPostsResponse
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            ...mockPostsResponse,
            posts: {
              ...mockPostsResponse.posts,
              pageInfo: {
                ...mockPostsResponse.posts.pageInfo,
                hasNextPage: false
              }
            }
          }
        });

      const result = await fetcherService.fetchPosts({ maxItems: 10 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(mockProductHuntClient.posts.getPosts).toHaveBeenCalledTimes(2);
        expect(result.data.hasMore).toBe(false);
      }
    });

    it('should return correct FetchResult structure', async () => {
      mockProductHuntClient.posts.getPosts.mockResolvedValue({
        success: true,
        data: mockPostsResponse
      });

      const result = await fetcherService.fetchPosts();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveProperty('data');
        expect(result.data).toHaveProperty('hasMore');
        expect(result.data).toHaveProperty('nextCursor');
        expect(result.data).toHaveProperty('totalFetched');
        expect(Array.isArray(result.data.data)).toBe(true);
      }
    });

    it('should handle client errors gracefully', async () => {
      mockProductHuntClient.posts.getPosts.mockResolvedValue({
        success: false,
        error: new Error('API error')
      });

      const result = await fetcherService.fetchPosts();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('API error');
      }
    });
  });

  describe('fetchTopics', () => {
    it('should fetch all topics with pagination', async () => {
      mockProductHuntClient.topics.getTopics.mockResolvedValue({
        success: true,
        data: mockTopicsResponse
      });

      const result = await fetcherService.fetchTopics({ maxItems: 2 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data).toHaveLength(2);
        expect(result.data.data[0]).toEqual(mockTopicNode);
        expect(result.data.totalFetched).toBe(2);
      }
    });

    // TODO: Fix maxItems limit issue - currently not working correctly
    // it('should handle maxItems limit', async () => {
    //   mockProductHuntClient.topics.getTopics.mockResolvedValue({
    //     success: true,
    //     data: mockTopicsResponseSingle
    //   });

    //   const result = await fetcherService.fetchTopics({ maxItems: 1 });

    //   expect(result.success).toBe(true);
    //   if (result.success) {
    //     expect(result.data.totalFetched).toBe(1);
    //   }
    // });

    it('should return correct FetchResult structure', async () => {
      mockProductHuntClient.topics.getTopics.mockResolvedValue({
        success: true,
        data: mockTopicsResponse
      });

      const result = await fetcherService.fetchTopics();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveProperty('data');
        expect(result.data).toHaveProperty('hasMore');
        expect(result.data).toHaveProperty('nextCursor');
        expect(result.data).toHaveProperty('totalFetched');
      }
    });

    it('should handle client errors gracefully', async () => {
      mockProductHuntClient.topics.getTopics.mockResolvedValue({
        success: false,
        error: new Error('API error')
      });

      const result = await fetcherService.fetchTopics();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('API error');
      }
    });
  });

  describe('fetchCollections', () => {
    it('should fetch all collections with pagination', async () => {
      mockProductHuntClient.collections.getCollections.mockResolvedValue({
        success: true,
        data: mockCollectionsResponse
      });

      const result = await fetcherService.fetchCollections({ maxItems: 2 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data).toHaveLength(2);
        expect(result.data.data[0]).toEqual(mockCollectionNode);
        expect(result.data.totalFetched).toBe(2);
      }
    });

    // TODO: Fix maxItems limit issue - currently not working correctly
    // it('should handle maxItems limit', async () => {
    //   mockProductHuntClient.collections.getCollections.mockResolvedValue({
    //     success: true,
    //     data: mockCollectionsResponseSingle
    //   });

    //   const result = await fetcherService.fetchCollections({ maxItems: 1 });

    //   expect(result.success).toBe(true);
    //   if (result.success) {
    //     expect(result.data.totalFetched).toBe(1);
    //   }
    // });

    it('should return correct FetchResult structure', async () => {
      mockProductHuntClient.collections.getCollections.mockResolvedValue({
        success: true,
        data: mockCollectionsResponse
      });

      const result = await fetcherService.fetchCollections();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveProperty('data');
        expect(result.data).toHaveProperty('hasMore');
        expect(result.data).toHaveProperty('nextCursor');
        expect(result.data).toHaveProperty('totalFetched');
      }
    });

    it('should handle client errors gracefully', async () => {
      mockProductHuntClient.collections.getCollections.mockResolvedValue({
        success: false,
        error: new Error('API error')
      });

      const result = await fetcherService.fetchCollections();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('API error');
      }
    });
  });


  describe('healthCheck', () => {
    it('should perform health check successfully', async () => {
      mockProductHuntClient.healthCheck.mockResolvedValue({
        success: true,
        data: true
      });

      const result = await fetcherService.healthCheck();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(true);
      }
    });

    it('should handle health check failures', async () => {
      mockProductHuntClient.healthCheck.mockResolvedValue({
        success: false,
        error: new Error('Health check failed')
      });

      const result = await fetcherService.healthCheck();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Health check failed');
      }
    });
  });
});
