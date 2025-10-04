/**
 * Database Client (Local-Only)
 *
 * A write-only database client responsible for persisting Product Hunt data to local Qdrant.
 * Provides connection to local Qdrant vector database, collection management,
 * and write operations (upsert, delete).
 *
 * **Important: Local-Only Design**
 * This client is designed ONLY for local Qdrant instances in compliance with
 * Product Hunt API terms of service (personal use only). Remote/cloud Qdrant
 * connections are not supported.
 *
 * Note: This client does NOT provide search functionality.
 * Search operations are handled by the MCP server which directly accesses Qdrant.
 * This design ensures clear separation of concerns: repository layer handles data persistence,
 * while MCP server handles data retrieval and analysis.
 *
 * @fileoverview Product Hunt data persistence to local Qdrant
 * @author aoki-h-jp
 * @version 1.0.0
 *
 * @example
 * ```typescript
 * import { DatabaseClient } from './client/database.js';
 * import { loadDatabaseConfig } from './config/database.js';
 *
 * const config = loadDatabaseConfig();
 * const client = new DatabaseClient(config, logger);
 *
 * // Connect to local Qdrant (http://localhost:6333)
 * await client.connect();
 *
 * // Batch upsert (only batch operations supported)
 * await client.batchUpsert('posts', postsArray);
 *
 * // Disconnect
 * await client.disconnect();
 * ```
 */
import { Logger, AsyncResult, success, failure } from '@producthunt-mcp-research/shared';
import { QdrantClient } from '@qdrant/js-client-rest';
import type { DatabaseConfig } from '../config/database.js';
import { getModelSpecificConfig } from '../config/database.js';
import type { DbPost, DbTopic, DbCollection } from '../types/database.js';
// Schema types removed - using any for now

/**
 * Allowed database record types
 * Only these types can be inserted into the database
 */
export type DatabaseRecord = DbPost | DbTopic | DbCollection;

/**
 * Batch operation result
 */
export interface BatchResult {
  inserted: number;
  updated: number;
  errors: number;
  total: number;
}

/**
 * Qdrant payload value types
 */
export type QdrantPayloadValue =
  | string
  | number
  | boolean
  | null
  | undefined;

/**
 * Qdrant payload (all values must be primitives or JSON strings)
 */
export type QdrantPayload = Record<string, QdrantPayloadValue>;

/**
 * Qdrant payload schema types
 */
export type QdrantPayloadSchemaType = 
  | 'keyword'
  | 'integer' 
  | 'float'
  | 'bool'
  | 'datetime'
  | 'text'
  | 'geo';

/**
 * Qdrant payload index configuration
 */
export interface QdrantPayloadIndex {
  field_name: string;
  field_schema: QdrantPayloadSchemaType;
}

/**
 * Field schema configuration
 */
export interface FieldSchema {
  type: string;
  indexed: boolean;
}

/**
 * Collection schema configuration
 */
export interface CollectionSchema {
  name: string;
  vectorSize: number;
  distance: 'Cosine' | 'Euclid' | 'Dot' | 'Manhattan';
  payloadSchema: Record<string, FieldSchema>;
}

/**
 * Qdrant point (record with vector)
 */
interface QdrantPoint {
  id: string | number;
  vector: number[] | { [key: string]: number[] };
  payload: QdrantPayload;
}

/**
 * Database client (Write-only)
 *
 * This client provides batch write operations for Qdrant.
 * It does NOT include search functionality - all searches are handled by the MCP server.
 * Only batch operations are supported to optimize for bulk data ingestion.
 *
 * Supported operations:
 * - Connection management: connect(), disconnect()
 * - Collection management: createCollection(), collectionExists()
 * - Batch write operations: batchUpsert()
 */
export class DatabaseClient {
  private client: QdrantClient | null = null;
  private collections = new Set<string>();

  private modelConfig: ReturnType<typeof getModelSpecificConfig>;

  constructor(
    private config: DatabaseConfig,
    private logger: Logger
  ) {
    this.logger = logger.child({ component: 'producthunt-mcp-research-repository-database' });
    // Get model-specific configuration
    this.modelConfig = getModelSpecificConfig(config);
  }

  /**
   * Connect to local Qdrant database
   *
   * Only supports local Qdrant instances (typically http://localhost:6333).
   * This is by design to comply with Product Hunt API terms of service.
   */
  async connect(): AsyncResult<void, Error> {
    try {
      // Validate local-only URL
      if (!this.config.url.includes('localhost') && !this.config.url.includes('127.0.0.1')) {
        this.logger.warn('Non-localhost URL detected. This tool is designed for local-only use.', {
          url: this.config.url,
        });
      }

      this.logger.info('Connecting to local Qdrant', {
        url: this.config.url,
        collectionName: this.config.collectionName,
        vectorDimensions: this.modelConfig.vectorDimensions,
      });

      // Connect to local Qdrant instance (no API key needed for local)
      this.client = new QdrantClient({
        url: this.config.url,
      });

      // Verify connection with health check (simple collection list)
      try {
        await this.client.getCollections();
        this.logger.info('Successfully connected to local Qdrant');
      } catch (error) {
        this.logger.error('Failed to verify connection. Is Qdrant running locally?', {
          error: error instanceof Error ? error.message : String(error),
          hint: 'Run: docker run -p 6333:6333 -v ./qdrant_storage:/qdrant/storage qdrant/qdrant',
        });
        throw error;
      }

      return success(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to connect to Qdrant', {
        error: errorMessage,
        url: this.config.url,
      });

      return failure(
        new Error(`Failed to connect to Qdrant: ${errorMessage}`)
      );
    }
  }

  /**
   * Disconnect from local Qdrant
   *
   * Qdrant JS client doesn't require explicit disconnect,
   * but we keep this method for API consistency.
   */
  async disconnect(): AsyncResult<void, Error> {
    try {
      this.logger.info('Disconnecting from local Qdrant');
      this.client = null;
      this.collections.clear();
      this.logger.info('Successfully disconnected from local Qdrant');
      return success(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to disconnect from Qdrant', {
        error: errorMessage,
      });

      return failure(
        new Error(`Failed to disconnect from Qdrant: ${errorMessage}`)
      );
    }
  }

  /**
   * Check if collection exists
   */
  async collectionExists(collectionName: string): AsyncResult<boolean, Error> {
    try {
      if (!this.client) {
        return failure(new Error('Database client not connected'));
      }

      const response = await this.client.getCollection(collectionName);
      const exists = response !== null;

      this.logger.debug('Collection existence check', {
        collection: collectionName,
        exists,
      });

      return success(exists);
    } catch (error) {
      // Qdrant throws error if collection doesn't exist
      if (error instanceof Error && error.message.includes('Not found')) {
        return success(false);
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to check collection existence', {
        collection: collectionName,
        error: errorMessage,
      });

      return failure(
        new Error(`Failed to check collection existence: ${errorMessage}`)
      );
    }
  }

  /**
   * Create collection
   */
  async createCollection(schema: CollectionSchema): AsyncResult<void, Error> {
    try {
      if (!this.client) {
        return failure(new Error('Database client not connected'));
      }

      this.logger.info('Creating collection', {
        collection: schema.name,
        vectorSize: schema.vectorSize,
        distance: schema.distance,
      });

      // Create collection with named vector configuration
      await this.client.createCollection(schema.name, {
        vectors: {
          "fast-all-minilm-l6-v2": {
            size: schema.vectorSize,
            distance: schema.distance,
          },
        },
      });

      this.logger.debug('Collection created, setting up payload indexes');

      // Create payload indexes for indexed fields
      const indexPromises = Object.entries(schema.payloadSchema)
        .filter(([, fieldSchema]) => fieldSchema && fieldSchema.indexed)
        .map(async ([fieldName, fieldSchema]) => {
          try {
            const payloadIndex: QdrantPayloadIndex = {
              field_name: fieldName,
              field_schema: this.mapPayloadFieldType(fieldSchema.type),
            };
            
            if (!this.client) {
              throw new Error('Database client not connected');
            }
            await this.client.createPayloadIndex(schema.name, payloadIndex);

            this.logger.debug('Payload index created', {
              collection: schema.name,
              field: fieldName,
              type: fieldSchema.type,
            });
          } catch (error) {
            this.logger.warn('Failed to create payload index (non-fatal)', {
              collection: schema.name,
              field: fieldName,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        });

      await Promise.all(indexPromises);

      this.collections.add(schema.name);

      this.logger.info('Collection created successfully', {
        collection: schema.name,
        indexedFields: Object.entries(schema.payloadSchema)
          .filter(([, fs]) => fs && fs.indexed)
          .map(([fn]) => fn),
      });

      return success(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to create collection', {
        collection: schema.name,
        error: errorMessage,
      });

      return failure(
        new Error(`Failed to create collection: ${errorMessage}`)
      );
    }
  }

  /**
   * Map payload field type to Qdrant schema type
   */
  private mapPayloadFieldType(type: string | undefined): QdrantPayloadSchemaType {
    switch (type || 'keyword') {
      case 'keyword':
        return 'keyword';
      case 'integer':
        return 'integer';
      case 'float':
        return 'float';
      case 'bool':
        return 'bool';
      case 'datetime':
        return 'datetime';
      case 'text':
        return 'text';
      case 'geo':
        return 'geo';
      default:
        return 'keyword'; // Default to keyword
    }
  }

  /**
   * Batch upsert records
   *
   * Converts database records to Qdrant points and upserts them in batches.
   */
  async batchUpsert(
    collectionName: string,
    records: DatabaseRecord[]
  ): AsyncResult<BatchResult, Error> {
    try {
      if (!this.client) {
        return failure(new Error('Database client not connected'));
      }

      if (records.length === 0) {
        return success({ inserted: 0, updated: 0, errors: 0, total: 0 });
      }

      this.logger.info('Starting batch upsert', {
        collection: collectionName,
        totalRecords: records.length,
        batchSize: this.modelConfig.batchSize,
      });

      // Convert records to Qdrant points
      const points = this.recordsToPoints(records);

      // Split into batches
      const batches = this.chunkArray(points, this.modelConfig.batchSize);

      let inserted = 0;
      let errors = 0;

      // Upsert each batch
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];

        try {
          this.logger.debug(`Upserting batch ${i + 1}/${batches.length}`, {
            batchSize: batch.length,
          });

          await this.client.upsert(collectionName, {
            wait: true,
            points: batch,
          });

          inserted += batch.length;

          this.logger.debug(`Batch ${i + 1}/${batches.length} upserted successfully`);
        } catch (error) {
          errors += batch.length;
          this.logger.error(`Failed to upsert batch ${i + 1}/${batches.length}`, {
            error: error instanceof Error ? error.message : String(error),
            errorDetail: error,
            batchSize: batch.length,
            samplePoint: batch[0], // First point for debugging
          });
        }
      }

      const result: BatchResult = {
        inserted,
        updated: 0, // Qdrant upsert doesn't distinguish between insert and update
        errors,
        total: records.length,
      };

      this.logger.info('Batch upsert completed', {
        collection: collectionName,
        ...result,
      });

      return success(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to batch upsert', {
        collection: collectionName,
        error: errorMessage,
      });

      return failure(
        new Error(`Failed to batch upsert: ${errorMessage}`)
      );
    }
  }

  /**
   * Convert database records to Qdrant points
   */
  private recordsToPoints(records: DatabaseRecord[]): QdrantPoint[] {
    return records.map((record, idx) => {
      // Extract embedding (if exists)
      const embedding = record.embedding || new Array(this.modelConfig.vectorDimensions).fill(0);

      // Prepare payload (all fields except embedding)
      const payload: Partial<DatabaseRecord> = {};
      for (const [key, value] of Object.entries(record)) {
        if (key !== 'embedding') {
          (payload as Record<string, unknown>)[key] = value;
        }
      }

      // Add document field for MCP server compatibility
      const recordWithName = record as unknown as Record<string, unknown>;
      (payload as Record<string, unknown>).document = `${recordWithName.name || ''} - ${recordWithName.tagline || ''} - ${recordWithName.description || ''}`.trim();

      // Convert Date objects to ISO strings for Qdrant
      const serializedPayload = this.serializePayload(payload);

      // Use record ID if available, otherwise generate sequential ID
      // Product Hunt IDs are numeric strings, convert to number for Qdrant
      const pointId = record.id
        ? (typeof record.id === 'string' ? parseInt(record.id, 10) : record.id)
        : Date.now() + idx;

      return {
        id: pointId,
        vector: {
          "fast-all-minilm-l6-v2": embedding,
        },
        payload: serializedPayload,
      };
    });
  }

  /**
   * Serialize payload for Qdrant
   * Converts Date objects and other types to Qdrant-compatible formats
   */
  private serializePayload(payload: Partial<DatabaseRecord>): QdrantPayload {
    const serialized: QdrantPayload = {};

    for (const [key, value] of Object.entries(payload)) {
      if (value instanceof Date) {
        // Convert Date to ISO string
        serialized[key] = value.toISOString();
      } else if (Array.isArray(value)) {
        // Convert arrays to JSON string (Qdrant doesn't support array types directly in payload)
        serialized[key] = JSON.stringify(value);
      } else if (typeof value === 'object' && value !== null) {
        // Convert objects to JSON string
        serialized[key] = JSON.stringify(value);
      } else if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        value === null ||
        value === undefined
      ) {
        // Primitive types (string, number, boolean, null, undefined)
        serialized[key] = value;
      } else {
        // Fallback for unknown types (should not happen with proper typing)
        this.logger.warn('Unknown value type in payload, converting to string', {
          key,
          type: typeof value,
        });
        serialized[key] = String(value);
      }
    }

    return serialized;
  }

  /**
   * Split array into chunks
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.client !== null;
  }

  /**
   * Get client configuration
   */
  getConfig(): DatabaseConfig {
    return { ...this.config };
  }

  /**
   * Get model-specific configuration
   */
  getModelConfig() {
    return { ...this.modelConfig };
  }
}
