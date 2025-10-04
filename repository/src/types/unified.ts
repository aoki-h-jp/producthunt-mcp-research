/**
 * Unified Database Types
 *
 * Type definitions for the unified collection that stores all Product Hunt entities.
 *
 * @fileoverview Unified type definitions for posts, topics, and collections
 * @author aoki-h-jp
 * @version 1.0.0
 */
import type { EntityType } from '../schemas/schema.js';

/**
 * Base unified record interface
 */
export interface UnifiedRecord {
  id: string;
  entity_type: EntityType;
  name: string;
  description?: string;
  url?: string;
  created_at: Date;
  updated_at: Date;
  content_hash: string;
  fetched_at: Date;
  document: string;
  embedding?: number[];
}

/**
 * Post-specific fields
 */
export interface PostFields {
  tagline?: string;
  website?: string;
  votes_count?: number;
  comments_count?: number;
  featured_at?: Date;
  user_id?: string;
  user_name?: string;
  user_username?: string;
  user_avatar_url?: string;
  thumbnail_url?: string;
  gallery_images?: string;
  topics?: string;
  collections_count?: number;
  comments?: string;
}

/**
 * Topic-specific fields
 */
export interface TopicFields {
  slug?: string;
  followers_count?: number;
}

/**
 * Collection-specific fields
 */
export interface CollectionFields {
  tagline?: string;
  followers_count?: number;
  featured_at?: Date;
  user_id?: string;
  user_name?: string;
  user_username?: string;
  user_avatar_url?: string;
  thumbnail_url?: string;
  posts_count?: number;
}

/**
 * Unified post record
 */
export interface UnifiedPost extends UnifiedRecord, PostFields {
  entity_type: 'post';
}

/**
 * Unified topic record
 */
export interface UnifiedTopic extends UnifiedRecord, TopicFields {
  entity_type: 'topic';
}

/**
 * Unified collection record
 */
export interface UnifiedCollection extends UnifiedRecord, CollectionFields {
  entity_type: 'collection';
}

/**
 * Union type for all unified records
 */
export type UnifiedEntity = UnifiedPost | UnifiedTopic | UnifiedCollection;

/**
 * Type guard functions
 */
export function isUnifiedPost(record: UnifiedEntity): record is UnifiedPost {
  return record.entity_type === 'post';
}

export function isUnifiedTopic(record: UnifiedEntity): record is UnifiedTopic {
  return record.entity_type === 'topic';
}

export function isUnifiedCollection(record: UnifiedEntity): record is UnifiedCollection {
  return record.entity_type === 'collection';
}

/**
 * Convert existing database records to unified format
 */
export interface UnifiedMapper {
  fromPost(post: any): UnifiedPost;
  fromTopic(topic: any): UnifiedTopic;
  fromCollection(collection: any): UnifiedCollection;
}
