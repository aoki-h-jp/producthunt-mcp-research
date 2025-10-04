/**
 * Topics-related GraphQL queries
 */
import { gql } from 'graphql-request';

export const GET_TOPICS = gql`
  query GetTopics($first: Int!, $after: String) {
    topics(first: $first, after: $after) {
      edges {
        node {
          id
          name
          description
          slug
          followersCount
          postsCount
          createdAt
          image
          url
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


