/**
 * Database Types
 *
 * Intermediate types between GraphQL nodes and unified entities.
 * These types represent the normalized database format before conversion to unified entities.
 *
 * @fileoverview Database-specific types for Product Hunt entities
 * @author aoki-h-jp
 * @version 1.0.0
 */

/**
 * Database representation of a Product Hunt post
 */
export interface DbPost {
  id: string;
  name: string;
  tagline: string;
  description: string;
  url: string;
  website?: string;
  votes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  featured_at?: string;
  user_id: string;
  user_name: string;
  user_username: string;
  user_avatar_url: string;
  thumbnail_url?: string;
  gallery_images?: string[];
  topics?: string[];
  collections_count?: number;
  comments?: unknown[];
  embedding?: number[];
  content_hash?: string;
  fetched_at: string;
}

/**
 * Database representation of a Product Hunt topic
 */
export interface DbTopic {
  id: string;
  name: string;
  slug: string;
  description?: string;
  followers_count: number;
  created_at: string;
  updated_at: string;
  embedding?: number[];
  content_hash?: string;
  fetched_at: string;
}

/**
 * Database representation of a Product Hunt collection
 */
export interface DbCollection {
  id: string;
  name: string;
  tagline?: string;
  description?: string;
  url?: string;
  followers_count?: number;
  featured_at?: string;
  user_id?: string;
  user_name?: string;
  user_username?: string;
  user_avatar_url?: string;
  thumbnail_url?: string;
  posts_count?: number;
  created_at: string;
  updated_at: string;
  embedding?: number[];
  content_hash?: string;
  fetched_at: string;
}

/**
 * Union type of all database entities
 */
export type DbEntity = DbPost | DbTopic | DbCollection;

/**
 * Type guard to check if entity is a DbPost
 */
export function isDbPost(entity: DbEntity): entity is DbPost {
  return 'votes_count' in entity && 'comments_count' in entity;
}

/**
 * Type guard to check if entity is a DbTopic
 */
export function isDbTopic(entity: DbEntity): entity is DbTopic {
  return 'slug' in entity && 'followers_count' in entity && !('votes_count' in entity);
}

/**
 * Type guard to check if entity is a DbCollection
 */
export function isDbCollection(entity: DbEntity): entity is DbCollection {
  return 'posts_count' in entity && !('votes_count' in entity) && !('slug' in entity);
}
