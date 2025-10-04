/**
 * Mock data for topics testing
 */

export const mockTopicNode = {
  id: 'topic-123',
  name: 'Artificial Intelligence',
  slug: 'artificial-intelligence',
  description: 'AI and machine learning products',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

export const mockTopicsResponse = {
  topics: {
    edges: [
      {
        node: mockTopicNode,
        cursor: 'cursor-1'
      },
      {
        node: {
          ...mockTopicNode,
          id: 'topic-124',
          name: 'Web Development',
          slug: 'web-development'
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

export const mockTopicsResponseSingle = {
  topics: {
    edges: [
      {
        node: mockTopicNode,
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

export const mockTopicsQueryVariables = {
  first: 20,
  after: undefined,
  order: 'POPULAR' as const
};
