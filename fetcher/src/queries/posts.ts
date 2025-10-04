/**
 * Posts-related GraphQL queries
 */
import { gql } from 'graphql-request';

export const GET_POSTS = gql`
  query GetPosts($first: Int!, $after: String, $postedAfter: DateTime) {
    posts(first: $first, after: $after, postedAfter: $postedAfter) {
      edges {
        node {
          id
          name
          tagline
          description
          url
          website
          votesCount
          commentsCount
          createdAt
          featuredAt
          thumbnail {
            type
            url
            videoUrl
          }
          media {
            type
            url
            videoUrl
          }
          user {
            id
            name
            username
            headline
            coverImage
            createdAt
          }
          topics {
            edges {
              node {
                id
                name
                description
                slug
                followersCount
              }
            }
          }
          collections(first: 1) {
            totalCount
          }
          comments(first: 5) {
            edges {
              node {
                id
                body
                createdAt
                votesCount
                isVoted
                parentId
                url
                userId
                user {
                  id
                  name
                  username
                  headline
                  coverImage
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
            totalCount
          }
        }
        cursor
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


