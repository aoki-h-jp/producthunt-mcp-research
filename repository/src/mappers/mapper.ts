/**
 * Product Hunt Mapper
 *
 * Converts existing database records (DbPost, DbTopic, DbCollection) to unified format
 * for storage in the single collection.
 *
 * @fileoverview Mapper for converting entity-specific records to unified format
 * @author aoki-h-jp
 * @version 1.0.0
 */
import type { UnifiedPost, UnifiedTopic, UnifiedCollection } from '../types/unified.js';
import type { DbPost, DbTopic, DbCollection } from '../types/database.js';
import type { CollectionNode, TopicNode, PostNode } from '@producthunt-mcp-research/fetcher';

/**
 * Convert CollectionNode (GraphQL) to DbCollection
 */
export function mapCollectionNodeToDb(node: CollectionNode): DbCollection {
  const now = new Date().toISOString();

  return {
    id: node.id,
    name: node.name,
    tagline: node.tagline,
    description: node.description || undefined,
    url: node.url,
    followers_count: node.followersCount,
    featured_at: node.featuredAt || undefined,
    user_id: node.user.id,
    user_name: node.user.name,
    user_username: node.user.username,
    user_avatar_url: '', // Not available in current GraphQL query
    thumbnail_url: node.coverImage || undefined,
    posts_count: node.posts.totalCount,
    created_at: node.createdAt,
    updated_at: node.createdAt, // GraphQL doesn't provide updated_at
    content_hash: '', // Will be calculated later
    fetched_at: now,
  };
}

/**
 * Convert TopicNode (GraphQL) to DbTopic
 */
export function mapTopicNodeToDb(node: TopicNode): DbTopic {
  const now = new Date().toISOString();

  return {
    id: node.id,
    name: node.name,
    slug: node.slug,
    description: node.description,
    followers_count: node.followersCount,
    created_at: node.createdAt,
    updated_at: node.createdAt, // GraphQL doesn't provide updated_at
    content_hash: '', // Will be calculated later
    fetched_at: now,
  };
}

/**
 * Convert PostNode (GraphQL) to DbPost
 */
export function mapPostNodeToDb(node: PostNode): DbPost {
  const now = new Date().toISOString();

  return {
    id: node.id,
    name: node.name,
    tagline: node.tagline,
    description: node.description || '',
    url: node.url,
    website: node.website,
    votes_count: node.votesCount,
    comments_count: node.commentsCount,
    created_at: node.createdAt,
    updated_at: node.createdAt, // GraphQL doesn't provide updated_at
    featured_at: node.featuredAt || undefined,
    user_id: node.user.id,
    user_name: node.user.name,
    user_username: node.user.username,
    user_avatar_url: node.user.coverImage || '',
    thumbnail_url: node.thumbnail?.url || undefined,
    gallery_images: node.media.map(media => media.url),
    topics: node.topics.edges.map(edge => edge.node.id),
    collections_count: node.collections.totalCount,
    comments: [], // Comments are not fetched in current query
    content_hash: '', // Will be calculated later
    fetched_at: now,
  };
}

/**
 * Convert DbPost to UnifiedPost
 */
export function mapPostToUnified(post: DbPost): UnifiedPost {
  return {
    // Common fields
    id: post.id,
    entity_type: 'post',
    name: post.name,
    description: post.description,
    url: post.url,
    created_at: new Date(post.created_at),
    updated_at: new Date(post.updated_at),
    content_hash: post.content_hash || '',
    fetched_at: new Date(post.fetched_at),
    document: `${post.name || ''} - ${post.tagline || ''} - ${post.description || ''}`.trim(),

    // Post-specific fields
    tagline: post.tagline,
    website: post.website,
    votes_count: post.votes_count,
    comments_count: post.comments_count,
    featured_at: post.featured_at ? new Date(post.featured_at) : undefined,
    user_id: post.user_id,
    user_name: post.user_name,
    user_username: post.user_username,
    user_avatar_url: post.user_avatar_url,
    thumbnail_url: post.thumbnail_url,
    gallery_images: post.gallery_images ? JSON.stringify(post.gallery_images) : undefined,
    topics: post.topics ? JSON.stringify(post.topics) : undefined,
    collections_count: post.collections_count,
    comments: post.comments ? JSON.stringify(post.comments) : undefined,

    // Embedding (if exists)
    embedding: post.embedding,
  };
}

/**
 * Convert DbTopic to UnifiedTopic
 */
export function mapTopicToUnified(topic: DbTopic): UnifiedTopic {
  return {
    // Common fields
    id: topic.id,
    entity_type: 'topic',
    name: topic.name,
    description: topic.description,
    url: undefined, // topics don't have URLs
    created_at: new Date(topic.created_at),
    updated_at: new Date(topic.updated_at),
    content_hash: topic.content_hash || '',
    fetched_at: new Date(topic.fetched_at),
    document: `${topic.name || ''} - ${topic.description || ''}`.trim(),

    // Topic-specific fields
    slug: topic.slug,
    followers_count: topic.followers_count,

    // Embedding (if exists)
    embedding: topic.embedding,
  };
}

/**
 * Convert DbCollection to UnifiedCollection
 */
export function mapCollectionToUnified(collection: DbCollection): UnifiedCollection {
  return {
    // Common fields
    id: collection.id,
    entity_type: 'collection',
    name: collection.name,
    description: collection.description,
    url: collection.url,
    created_at: new Date(collection.created_at),
    updated_at: new Date(collection.updated_at),
    content_hash: collection.content_hash || '',
    fetched_at: new Date(collection.fetched_at),
    document: `${collection.name || ''} - ${collection.tagline || ''} - ${collection.description || ''}`.trim(),

    // Collection-specific fields
    tagline: collection.tagline,
    followers_count: collection.followers_count,
    featured_at: collection.featured_at ? new Date(collection.featured_at) : undefined,
    user_id: collection.user_id,
    user_name: collection.user_name,
    user_username: collection.user_username,
    user_avatar_url: collection.user_avatar_url,
    thumbnail_url: collection.thumbnail_url,
    posts_count: collection.posts_count,

    // Embedding (if exists)
    embedding: collection.embedding,
  };
}

/**
 * Product Hunt mapper class
 */
export class Mapper {
  /**
   * Convert GraphQL CollectionNode to DbCollection
   */
  fromCollectionNode(node: CollectionNode): DbCollection {
    return mapCollectionNodeToDb(node);
  }

  /**
   * Convert GraphQL TopicNode to DbTopic
   */
  fromTopicNode(node: TopicNode): DbTopic {
    return mapTopicNodeToDb(node);
  }

  /**
   * Convert GraphQL PostNode to DbPost
   */
  fromPostNode(node: PostNode): DbPost {
    return mapPostNodeToDb(node);
  }

  /**
   * Convert multiple GraphQL CollectionNodes to DbCollections
   */
  fromCollectionNodes(nodes: CollectionNode[]): DbCollection[] {
    return nodes.map(mapCollectionNodeToDb);
  }

  /**
   * Convert multiple GraphQL TopicNodes to DbTopics
   */
  fromTopicNodes(nodes: TopicNode[]): DbTopic[] {
    return nodes.map(mapTopicNodeToDb);
  }

  /**
   * Convert multiple GraphQL PostNodes to DbPosts
   */
  fromPostNodes(nodes: PostNode[]): DbPost[] {
    return nodes.map(mapPostNodeToDb);
  }

  /**
   * Map post to unified format
   */
  fromPost(post: DbPost): UnifiedPost {
    return mapPostToUnified(post);
  }

  /**
   * Map topic to unified format
   */
  fromTopic(topic: DbTopic): UnifiedTopic {
    return mapTopicToUnified(topic);
  }

  /**
   * Map collection to unified format
   */
  fromCollection(collection: DbCollection): UnifiedCollection {
    return mapCollectionToUnified(collection);
  }

  /**
   * Map multiple posts to unified format
   */
  fromPosts(posts: DbPost[]): UnifiedPost[] {
    return posts.map(mapPostToUnified);
  }

  /**
   * Map multiple topics to unified format
   */
  fromTopics(topics: DbTopic[]): UnifiedTopic[] {
    return topics.map(mapTopicToUnified);
  }

  /**
   * Map multiple collections to unified format
   */
  fromCollections(collections: DbCollection[]): UnifiedCollection[] {
    return collections.map(mapCollectionToUnified);
  }
}
