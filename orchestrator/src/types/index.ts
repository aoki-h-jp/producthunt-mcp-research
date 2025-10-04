/**
 * Orchestrator Types
 *
 * Core type definitions for the orchestrator layer.
 *
 * @fileoverview Core orchestrator type definitions
 * @author aoki-h-jp
 * @version 1.0.0
 */

/**
 * Sync statistics
 *
 * Base statistics for synchronization operations.
 *
 * @interface SyncStats
 */
export interface SyncStats {
  totalFetched: number;
  totalSaved: number;
  errors: number;
  startTime: Date;
  endTime?: Date;
  duration?: number; // milliseconds
  nextCursor?: string; // Cursor for resuming sync
  postsProcessed?: number; // Number of posts processed (for post sync)
  usersProcessed?: number; // Number of unique users processed (for post sync)
}

/**
 * Sync options
 *
 * Options for controlling synchronization behavior.
 *
 * @interface SyncOptions
 */
export interface SyncOptions {
  /** Batch size for API requests */
  batchSize?: number;

  /** Maximum number of items to fetch */
  maxItems?: number;

  /** Cursor for pagination (null = start from beginning, undefined = no cursor) */
  cursor?: string | null;

  /** Progress callback */
  onProgress?: (progress: number, message: string) => void;
}
