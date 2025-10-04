/**
 * Product Hunt Collection Schema
 *
 * Single collection schema that combines posts, topics, and collections
 * for efficient MCP-based search across all Product Hunt entities.
 *
 * @fileoverview Qdrant collection schema for all Product Hunt entities
 * @author aoki-h-jp
 * @version 1.0.0
 *
 * @example
 * ```typescript
 * import { COLLECTION_SCHEMA, buildSchema } from './schemas/schema.js';
 *
 * // Get schema
 * const schema = buildSchema(config);
 * ```
 */
import type { DatabaseConfig } from '../config/database.js';

/**
 * Entity types supported in the unified collection
 */
export type EntityType = 'post' | 'topic' | 'collection';

/**
 * Product Hunt collection schema
 *
 * Single collection that stores all Product Hunt entities (posts, topics, collections)
 * with entity_type field for filtering and type-specific fields.
 */
export const COLLECTION_SCHEMA = {
  name: 'producthunt',
  payloadSchema: {
    // === Common Fields (all entities) ===
    id: { type: 'keyword', indexed: true, description: 'Entity ID' },
    entity_type: { type: 'keyword', indexed: true, description: 'Entity type: post, topic, or collection' },
    name: { type: 'text', indexed: true, description: 'Entity name' },
    description: { type: 'text', indexed: false, description: 'Description' },
    url: { type: 'keyword', indexed: false, description: 'URL' },

    // Date and time information
    created_at: { type: 'datetime', indexed: true, description: 'Created at' },
    updated_at: { type: 'datetime', indexed: false, description: 'Updated at' },

    // Content hash (for change detection)
    content_hash: { type: 'keyword', indexed: true, description: 'Content hash' },

    // Metadata
    fetched_at: { type: 'datetime', indexed: true, description: 'Fetched at' },

    // MCP search field
    document: { type: 'text', indexed: false, description: 'Searchable document text for MCP' },

    // === Post-specific Fields ===
    tagline: { type: 'text', indexed: false, description: 'Post tagline' },
    website: { type: 'keyword', indexed: false, description: 'Website URL' },
    votes_count: { type: 'integer', indexed: true, description: 'Vote count' },
    comments_count: { type: 'integer', indexed: true, description: 'Comment count' },
    featured_at: { type: 'datetime', indexed: true, description: 'Featured at' },

    // User information (denormalized)
    user_id: { type: 'keyword', indexed: true, description: 'User ID' },
    user_name: { type: 'text', indexed: false, description: 'User name' },
    user_username: { type: 'keyword', indexed: true, description: 'Username' },
    user_avatar_url: { type: 'keyword', indexed: false, description: 'User avatar URL' },

    // Media
    thumbnail_url: { type: 'keyword', indexed: false, description: 'Thumbnail URL' },
    gallery_images: { type: 'keyword', indexed: false, description: 'Gallery images (JSON array as string)' },

    // Relations
    topics: { type: 'keyword', indexed: true, description: 'Topic IDs (JSON array as string)' },
    collections_count: { type: 'integer', indexed: false, description: 'Collections count' },

    // Nested comments
    comments: { type: 'keyword', indexed: false, description: 'Comments (JSON array as string)' },

    // === Topic-specific Fields ===
    slug: { type: 'keyword', indexed: true, description: 'Topic slug' },
    followers_count: { type: 'integer', indexed: true, description: 'Follower count' },

    // === Collection-specific Fields ===
    posts_count: { type: 'integer', indexed: false, description: 'Posts count' },
  },
} as const;

/**
 * Build full Qdrant collection schema with config
 */
export function buildSchema(config: DatabaseConfig) {
  return {
    ...COLLECTION_SCHEMA,
    vectorSize: config.vectorDimensions,
    distance: config.distance,
  };
}

/**
 * Get entity type from record
 */
export function getEntityType(record: Record<string, unknown>): EntityType | null {
  const entityType = record.entity_type;
  if (typeof entityType === 'string' && ['post', 'topic', 'collection'].includes(entityType)) {
    return entityType as EntityType;
  }
  return null;
}

/**
 * Check if record is of specific entity type
 */
export function isEntityType(record: Record<string, unknown>, type: EntityType): boolean {
  return getEntityType(record) === type;
}

/**
 * Get entity-specific fields for a given type
 */
export function getEntityFields(type: EntityType): string[] {
  const commonFields = ['id', 'entity_type', 'name', 'description', 'url', 'created_at', 'updated_at', 'content_hash', 'fetched_at', 'document'];

  switch (type) {
    case 'post':
      return [
        ...commonFields,
        'tagline', 'website', 'votes_count', 'comments_count', 'featured_at',
        'user_id', 'user_name', 'user_username', 'user_avatar_url',
        'thumbnail_url', 'gallery_images', 'topics', 'collections_count', 'comments'
      ];
    case 'topic':
      return [
        ...commonFields,
        'slug', 'followers_count'
      ];
    case 'collection':
      return [
        ...commonFields,
        'tagline', 'followers_count', 'featured_at',
        'user_id', 'user_name', 'user_username', 'user_avatar_url',
        'thumbnail_url', 'posts_count'
      ];
    default:
      return commonFields;
  }
}
