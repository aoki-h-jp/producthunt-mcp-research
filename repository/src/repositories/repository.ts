/**
 * Product Hunt Repository
 *
 * Repository for managing all Product Hunt entities in a single collection.
 * Provides methods for saving and retrieving posts, topics, and collections
 * with automatic embedding generation.
 *
 * @fileoverview Repository for all Product Hunt entities
 * @author aoki-h-jp
 * @version 1.0.0
 *
 * @example
 * ```typescript
 * import { Repository } from './repositories/repository.js';
 * import { EmbeddingService } from '../embeddings/service.js';
 *
 * const embeddingService = new EmbeddingService();
 * const repository = new Repository(client, logger, config, embeddingService);
 *
 * // Save posts
 * await repository.savePosts(posts);
 *
 * // Save topics
 * await repository.saveTopics(topics);
 *
 * // Save collections
 * await repository.saveCollections(collections);
 * ```
 */
import { Logger, AsyncResult, success, failure } from '@producthunt-mcp-research/shared';
import type { DatabaseClient } from '../client/database.js';
import type { DatabaseConfig } from '../config/database.js';
import type { EmbeddingService } from '../embeddings/service.js';
import type { UnifiedPost, UnifiedTopic, UnifiedCollection } from '../types/unified.js';
import type { DbPost, DbTopic, DbCollection } from '../types/database.js';
import { Mapper } from '../mappers/mapper.js';

/**
 * Repository for all Product Hunt entities
 */
export class Repository {
  private mapper: Mapper;

  constructor(
    private client: DatabaseClient,
    private logger: Logger,
    private config: DatabaseConfig,
    private embeddingService: EmbeddingService
  ) {
    this.mapper = new Mapper();
  }

  /**
   * Save posts to unified collection
   */
  async savePosts(posts: DbPost[]): AsyncResult<{ total: number; inserted: number; errors: number }, Error> {
    try {
      this.logger.info('Starting batch save of posts to unified collection', {
        count: posts.length,
        collection: 'producthunt'
      });

      // Convert to unified format
      const unifiedPosts = this.mapper.fromPosts(posts);

      // Generate embeddings
      this.logger.info('Generating embeddings for posts');
      const postsWithEmbeddings = await this.generateEmbeddingsForPosts(unifiedPosts);

      // Save to collection
      const result = await this.client.batchUpsert('producthunt', postsWithEmbeddings as any);
      if (!result.success) {
        return failure(result.error);
      }

      this.logger.info('Posts saved successfully to unified collection', {
        total: posts.length,
        inserted: result.data.inserted,
        errors: result.data.errors
      });

      return success({
        total: posts.length,
        inserted: result.data.inserted,
        errors: result.data.errors
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to save posts to unified collection', { error: errorMessage });
      return failure(new Error(`Failed to save posts: ${errorMessage}`));
    }
  }

  /**
   * Save topics to unified collection
   */
  async saveTopics(topics: DbTopic[]): AsyncResult<{ total: number; inserted: number; errors: number }, Error> {
    try {
      this.logger.info('Starting batch save of topics to unified collection', {
        count: topics.length,
        collection: 'producthunt'
      });

      // Convert to unified format
      const unifiedTopics = this.mapper.fromTopics(topics);

      // Generate embeddings
      this.logger.info('Generating embeddings for topics');
      const topicsWithEmbeddings = await this.generateEmbeddingsForTopics(unifiedTopics);

      // Save to collection
      const result = await this.client.batchUpsert('producthunt', topicsWithEmbeddings as any);
      if (!result.success) {
        return failure(result.error);
      }

      this.logger.info('Topics saved successfully to unified collection', {
        total: topics.length,
        inserted: result.data.inserted,
        errors: result.data.errors
      });

      return success({
        total: topics.length,
        inserted: result.data.inserted,
        errors: result.data.errors
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to save topics to unified collection', { error: errorMessage });
      return failure(new Error(`Failed to save topics: ${errorMessage}`));
    }
  }

  /**
   * Save collections to unified collection
   */
  async saveCollections(collections: DbCollection[]): AsyncResult<{ total: number; inserted: number; errors: number }, Error> {
    try {
      this.logger.info('Starting batch save of collections to unified collection', {
        count: collections.length,
        collection: 'producthunt'
      });

      // Convert to unified format
      const unifiedCollections = this.mapper.fromCollections(collections);

      // Generate embeddings
      this.logger.info('Generating embeddings for collections');
      const collectionsWithEmbeddings = await this.generateEmbeddingsForCollections(unifiedCollections);

      // Save to collection
      const result = await this.client.batchUpsert('producthunt', collectionsWithEmbeddings as any);
      if (!result.success) {
        return failure(result.error);
      }

      this.logger.info('Collections saved successfully to unified collection', {
        total: collections.length,
        inserted: result.data.inserted,
        errors: result.data.errors
      });

      return success({
        total: collections.length,
        inserted: result.data.inserted,
        errors: result.data.errors
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to save collections to unified collection', { error: errorMessage });
      return failure(new Error(`Failed to save collections: ${errorMessage}`));
    }
  }

  /**
   * Generate embeddings for posts
   */
  private async generateEmbeddingsForPosts(posts: UnifiedPost[]): Promise<UnifiedPost[]> {
    const texts = posts.map(post => post.document);
    const embeddingsResult = await this.embeddingService.generateEmbeddings(texts);

    if (!embeddingsResult.success) {
      throw new Error(`Failed to generate embeddings: ${embeddingsResult.error.message}`);
    }

    return posts.map((post, index) => ({
      ...post,
      embedding: embeddingsResult.data[index]
    }));
  }

  /**
   * Generate embeddings for topics
   */
  private async generateEmbeddingsForTopics(topics: UnifiedTopic[]): Promise<UnifiedTopic[]> {
    const texts = topics.map(topic => topic.document);
    const embeddingsResult = await this.embeddingService.generateEmbeddings(texts);

    if (!embeddingsResult.success) {
      throw new Error(`Failed to generate embeddings: ${embeddingsResult.error.message}`);
    }

    return topics.map((topic, index) => ({
      ...topic,
      embedding: embeddingsResult.data[index]
    }));
  }

  /**
   * Generate embeddings for collections
   */
  private async generateEmbeddingsForCollections(collections: UnifiedCollection[]): Promise<UnifiedCollection[]> {
    const texts = collections.map(collection => collection.document);
    const embeddingsResult = await this.embeddingService.generateEmbeddings(texts);

    if (!embeddingsResult.success) {
      throw new Error(`Failed to generate embeddings: ${embeddingsResult.error.message}`);
    }

    return collections.map((collection, index) => ({
      ...collection,
      embedding: embeddingsResult.data[index]
    }));
  }
}
