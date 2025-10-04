/**
 * Mock data for posts testing
 */

export const mockPostNode = {
  id: 'post-123',
  name: 'Test Product',
  tagline: 'A great test product',
  description: 'This is a test product description',
  url: 'https://example.com',
  votesCount: 100,
  commentsCount: 25,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  featuredAt: '2024-01-01T00:00:00Z',
  user: {
    id: 'user-123',
    name: 'Test User',
    username: 'testuser',
    profileImage: 'https://example.com/avatar.jpg'
  },
  topics: {
    edges: [
      {
        node: {
          id: 'topic-1',
          name: 'Technology',
          slug: 'technology'
        }
      }
    ]
  }
};

export const mockPostsResponse = {
  posts: {
    edges: [
      {
        node: mockPostNode,
        cursor: 'cursor-1'
      },
      {
        node: {
          ...mockPostNode,
          id: 'post-124',
          name: 'Another Product'
        },
        cursor: 'cursor-2'
      }
    ],
    pageInfo: {
      hasNextPage: true,
      hasPreviousPage: false,
      startCursor: 'cursor-1',
      endCursor: 'cursor-2'
    }
  }
};

export const mockPostsResponseSingle = {
  posts: {
    edges: [
      {
        node: mockPostNode,
        cursor: 'cursor-1'
      }
    ],
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: 'cursor-1',
      endCursor: 'cursor-1'
    }
  }
};

export const mockPostsQueryVariables = {
  first: 10,
  after: undefined,
  order: 'POPULAR' as const,
  topic: undefined
};
