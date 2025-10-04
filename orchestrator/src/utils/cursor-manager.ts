/**
 * Cursor Manager
 *
 * Manages cursor persistence for resumable synchronization.
 *
 * @fileoverview Cursor management utilities
 * @author aoki-h-jp
 * @version 1.0.0
 */
import { promises as fs } from 'fs';
import { join } from 'path';
import { Logger } from '@producthunt-mcp-research/shared';

export interface CursorState {
  topics?: string;
  collections?: string;
  posts?: string;
  lastUpdated: string;
}

export class CursorManager {
  private readonly cursorFile: string;
  private logger: Logger;

  constructor(logger: Logger, dataDir: string = './data') {
    this.logger = logger;
    this.cursorFile = join(dataDir, 'sync-cursors.json');
  }

  /**
   * Load cursor state from file
   */
  async loadCursors(): Promise<CursorState | null> {
    try {
      await fs.access(this.cursorFile);
      const data = await fs.readFile(this.cursorFile, 'utf-8');
      const cursors = JSON.parse(data) as CursorState;

      this.logger.info('Loaded cursor state', {
        topics: cursors.topics,
        collections: cursors.collections,
        posts: cursors.posts,
        lastUpdated: cursors.lastUpdated
      });

      return cursors;
    } catch (error) {
      this.logger.info('No cursor file found, starting fresh');
      return null;
    }
  }

  /**
   * Save cursor state to file
   */
  async saveCursors(cursors: CursorState): Promise<void> {
    try {
      // Ensure data directory exists
      const dataDir = join(this.cursorFile, '..');
      await fs.mkdir(dataDir, { recursive: true });

      const updatedCursors: CursorState = {
        ...cursors,
        lastUpdated: new Date().toISOString()
      };

      await fs.writeFile(this.cursorFile, JSON.stringify(updatedCursors, null, 2));

      this.logger.info('Saved cursor state', {
        topics: updatedCursors.topics,
        collections: updatedCursors.collections,
        posts: updatedCursors.posts,
        lastUpdated: updatedCursors.lastUpdated
      });
    } catch (error) {
      this.logger.warn('Failed to save cursor state', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * Update specific cursor
   */
  async updateCursor(type: 'topics' | 'collections' | 'posts', cursor: string | undefined): Promise<void> {
    const currentCursors = await this.loadCursors() || {
      lastUpdated: new Date().toISOString()
    };

    if (cursor) {
      currentCursors[type] = cursor;
    } else {
      delete currentCursors[type];
    }

    await this.saveCursors(currentCursors);
  }

  /**
   * Clear all cursors
   */
  async clearCursors(): Promise<void> {
    try {
      await fs.unlink(this.cursorFile);
      this.logger.info('Cleared all cursors');
    } catch (error) {
      this.logger.info('No cursor file to clear');
    }
  }

  /**
   * Get cursor file path
   */
  getCursorFilePath(): string {
    return this.cursorFile;
  }
}
