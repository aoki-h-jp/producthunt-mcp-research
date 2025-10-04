#!/usr/bin/env node
/**
 * CLI for Product Hunt Data Orchestrator
 *
 * Command-line interface for running synchronization commands.
 *
 * @fileoverview Orchestrator CLI
 * @author aoki-h-jp
 * @version 1.0.0
 */

// Load environment variables from .env file in project root
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// From dist/src/cli.js -> ../../.. to reach project root
const projectRoot = resolve(__dirname, '../../..');
config({ path: resolve(projectRoot, '.env') });

import { createFetcher } from '@producthunt-mcp-research/fetcher';
import {
  DatabaseClient,
  Repository,
  EmbeddingService,
  loadDatabaseConfig
} from '@producthunt-mcp-research/repository';
import { Logger } from '@producthunt-mcp-research/shared';
import { syncAll, syncPosts, syncTopics, syncCollections, setupDatabase } from './index.js';
import type { OrchestratorRepository } from './index.js';

/**
 * Parse command line arguments
 */
function parseArgs(): { command: string; options: any } {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  const options: any = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--maxItems=')) {
      options.maxItems = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--batchSize=')) {
      options.batchSize = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--clearCursors')) {
      options.clearCursors = true;
    }
  }

  return { command, options };
}

/**
 * Show help message
 */
function showHelp(): void {
  console.log(`
Product Hunt Data Orchestrator CLI

Usage: pnpm run <command> [options]

Commands:
  setup        Initialize database tables (run once before first sync)
  all          Sync all data (topics, collections, posts)
  topics       Sync topics only
  collections  Sync collections only
  posts        Sync posts only (including comments)

Options:
  --max-items=N       Maximum number of items to fetch (default: 100)
  --batch-size=N      Batch size for fetching (default: 10)

Examples:
  pnpm run setup
  pnpm run sync:all
  pnpm run sync:posts -- --max-items=200
  pnpm run sync:posts -- --batch-size=20
  `);
}

/**
 * Main CLI function
 */
async function main(): Promise<void> {
  const { command, options } = parseArgs();

  if (command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    process.exit(0);
  }

  // Initialize logger
  const logger = new Logger({
    level: 'info',
    service: 'orchestrator-cli'
  });

  try {
    logger.info('Initializing orchestrator CLI', { command, options });

    // Create fetcher
    const fetcher = createFetcher();

    // Create database client
    const dbConfig = loadDatabaseConfig();
    const client = new DatabaseClient(dbConfig, logger);
    await client.connect();

    // Create embedding service
    logger.info('Initializing embedding service');
    const embeddingService = new EmbeddingService({
      modelName: dbConfig.embeddingModel, // Use configured model
    }, logger);

    // Initialize embedding model (preload for better performance)
    await embeddingService.initialize();
    logger.info('Embedding service initialized successfully');

    // Create repositories with embedding service
    const repository: OrchestratorRepository = {
      client,
      repository: new Repository(client, logger, dbConfig, embeddingService),
    };

    // Execute command
    let result;
    switch (command) {
      case 'setup': {
        logger.info('Running database setup');
        const setupResult = await setupDatabase(repository.client, dbConfig, logger);
        if (setupResult.success) {
          logger.info('Database setup completed successfully');
          await repository.client.disconnect();
          process.exit(0);
        } else {
          logger.error('Database setup failed', { error: setupResult.error.message });
          await repository.client.disconnect();
          process.exit(1);
        }
        break;
      }

      case 'all':
        logger.info('Running sync:all command');
        if (options.clearCursors) {
          const { CursorManager } = await import('./utils/cursor-manager.js');
          const cursorManager = new CursorManager(logger);
          await cursorManager.clearCursors();
          logger.info('Cursors cleared');
        }
        result = await syncAll(fetcher, repository, options, logger);
        break;

      case 'topics':
        logger.info('Running sync:topics command');
        if (options.clearCursors) {
          const { CursorManager } = await import('./utils/cursor-manager.js');
          const cursorManager = new CursorManager(logger);
          await cursorManager.clearCursors();
          logger.info('Cursors cleared');
        }
        result = await syncTopics(fetcher, repository, options, logger);
        break;

      case 'collections':
        logger.info('Running sync:collections command');
        if (options.clearCursors) {
          const { CursorManager } = await import('./utils/cursor-manager.js');
          const cursorManager = new CursorManager(logger);
          await cursorManager.clearCursors();
          logger.info('Cursors cleared');
        }
        result = await syncCollections(fetcher, repository, options, logger);
        break;

      case 'posts':
        logger.info('Running sync:posts command');
        if (options.clearCursors) {
          const { CursorManager } = await import('./utils/cursor-manager.js');
          const cursorManager = new CursorManager(logger);
          await cursorManager.clearCursors();
          logger.info('Cursors cleared');
        }
        result = await syncPosts(fetcher, repository, options, logger);
        break;

      default:
        logger.error(`Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }

    // Handle result
    if (result.success) {
      logger.info('Synchronization completed successfully', { stats: result.data });
      await client.disconnect();
      process.exit(0);
    } else {
      logger.error('Synchronization failed', { error: result.error.message });
      await client.disconnect();
      process.exit(1);
    }

  } catch (error) {
    logger.error('CLI execution failed', {
      error: error instanceof Error ? error.message : String(error)
    });
    process.exit(1);
  }
}

// Run CLI
main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
