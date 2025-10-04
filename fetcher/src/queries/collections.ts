/**
 * Collections-related GraphQL queries
 */
import { gql } from 'graphql-request';

export const GET_COLLECTIONS = gql`
  query GetCollections($first: Int!, $after: String) {
    collections(first: $first, after: $after) {
      edges {
        node {
          id
          name
          tagline
          description
          url
          followersCount
          featuredAt
          coverImage
          createdAt
          user {
            id
            name
            username
          }
          posts(first: 1) {
            totalCount
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;


