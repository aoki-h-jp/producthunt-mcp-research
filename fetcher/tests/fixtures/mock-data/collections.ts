/**
 * Mock data for collections testing
 */

export const mockCollectionNode = {
  id: 'collection-123',
  name: 'Best AI Tools',
  description: 'A curated collection of the best AI tools',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  postsCount: 15,
  user: {
    id: 'user-123',
    name: 'Test User',
    username: 'testuser',
    profileImage: 'https://example.com/avatar.jpg'
  }
};

export const mockCollectionsResponse = {
  collections: {
    edges: [
      {
        node: mockCollectionNode,
        cursor: 'cursor-1'
      },
      {
        node: {
          ...mockCollectionNode,
          id: 'collection-124',
          name: 'Web Development Tools',
          description: 'Tools for web developers'
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

export const mockCollectionsResponseSingle = {
  collections: {
    edges: [
      {
        node: mockCollectionNode,
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

export const mockCollectionsQueryVariables = {
  first: 10,
  after: undefined
};
