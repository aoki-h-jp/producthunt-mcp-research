---
title: Orchestrator API
description: High-level API for synchronizing Product Hunt data
---

The Orchestrator API provides functions for coordinating data synchronization between the Product Hunt API (via Fetcher) and your local Qdrant instance (via Repository).

## Overview

The orchestrator layer sits between the fetcher and repository layers, managing the data flow:

```mermaid
graph LR
    A[Product Hunt API] --> B[Fetcher]
    B --> C[Orchestrator]
    C --> D[Repository]
    D --> E[Qdrant]
    
    subgraph "Data Flow"
        A
        B
        C
        D
        E
    end
    
    subgraph "Orchestrator Functions"
        F[syncAll]
        G[syncTopics]
        H[syncCollections]
        I[syncPosts]
    end
    
    C --> F
    C --> G
    C --> H
    C --> I
```

All orchestrator functions follow a consistent pattern:
- Accept a fetcher instance, repository, options, and logger
- Return an `AsyncResult<SyncStats, Error>`
- Handle errors gracefully with detailed logging

## Functions

### syncAll()

Synchronizes all data types (topics, collections, posts with comments) in a balanced manner with automatic resumption.

```typescript
async function syncAll(
  fetcher: FetcherInstance,
  repository: OrchestratorRepository,
  options?: SyncOptions,
  logger: Logger
): AsyncResult<SyncStats, Error>
```

**Parameters:**

- `fetcher` (`FetcherInstance`) - Fetcher instance for API operations
- `repository` (`OrchestratorRepository`) - Repository wrapper with database client
- `options` (`SyncOptions`, optional) - Synchronization options
- `logger` (`Logger`) - Logger instance for operation tracking

**Returns:**

`AsyncResult<SyncStats, Error>` - Result containing aggregated statistics or error

**Automatic Resumption:**

All sync functions (`syncAll`, `syncPosts`, `syncTopics`, `syncCollections`) automatically resume from where they left off using saved cursors. If interrupted, simply run the function again to continue from the last successful position. The `nextCursor` field in the returned statistics can be used to manually resume from a specific point.

---

### syncPosts()

Synchronizes Product Hunt posts (including comments) in batches. Fetches posts batch-by-batch, saves each batch to Qdrant, and updates the cursor after each batch.

```typescript
async function syncPosts(
  fetcher: FetcherInstance,
  repository: OrchestratorRepository,
  options?: SyncOptions,
  logger: Logger
): AsyncResult<SyncStats, Error>
```

**Parameters:**

- `fetcher` (`FetcherInstance`) - Fetcher instance
- `repository` (`OrchestratorRepository`) - Repository wrapper
- `options` (`SyncOptions`, optional) - Sync options (batchSize default: 5, maxItems default: 100)
- `logger` (`Logger`) - Logger instance

**Returns:**

`AsyncResult<SyncStats, Error>` - Result with sync statistics

**Batch Processing:**

1. Fetches one batch of posts (default: 5 items)
2. Saves batch to Qdrant
3. Updates cursor in `orchestrator/data/sync-cursors.json`
4. Repeats until `maxItems` reached or no more data

If interrupted, the next run will resume from the last saved cursor.

---

### syncTopics()

Synchronizes Product Hunt topics in batches. Fetches topics batch-by-batch, saves each batch to Qdrant, and updates the cursor after each batch.

```typescript
async function syncTopics(
  fetcher: FetcherInstance,
  repository: OrchestratorRepository,
  options?: SyncOptions,
  logger: Logger
): AsyncResult<SyncStats, Error>
```

**Parameters:**

- `fetcher` (`FetcherInstance`) - Fetcher instance
- `repository` (`OrchestratorRepository`) - Repository wrapper
- `options` (`SyncOptions`, optional) - Sync options (batchSize default: 10, maxItems default: 10000)
- `logger` (`Logger`) - Logger instance

**Returns:**

`AsyncResult<SyncStats, Error>` - Result with sync statistics

**Batch Processing:**

1. Fetches one batch of topics (default: 10 items)
2. Saves batch to Qdrant
3. Updates cursor in `orchestrator/data/sync-cursors.json`
4. Repeats until `maxItems` reached or no more data

If interrupted, the next run will resume from the last saved cursor.

---

### syncCollections()

Synchronizes Product Hunt collections in batches. Fetches collections batch-by-batch, saves each batch to Qdrant, and updates the cursor after each batch.

```typescript
async function syncCollections(
  fetcher: FetcherInstance,
  repository: OrchestratorRepository,
  options?: SyncOptions,
  logger: Logger
): AsyncResult<SyncStats, Error>
```

**Parameters:**

- `fetcher` (`FetcherInstance`) - Fetcher instance
- `repository` (`OrchestratorRepository`) - Repository wrapper
- `options` (`SyncOptions`, optional) - Sync options (batchSize default: 10, maxItems default: 10000)
- `logger` (`Logger`) - Logger instance

**Returns:**

`AsyncResult<SyncStats, Error>` - Result with sync statistics

**Batch Processing:**

1. Fetches one batch of collections (default: 10 items)
2. Saves batch to Qdrant
3. Updates cursor in `orchestrator/data/sync-cursors.json`
4. Repeats until `maxItems` reached or no more data

If interrupted, the next run will resume from the last saved cursor.

## Types

### OrchestratorRepository

Wrapper interface for repository layer components.

```typescript
interface OrchestratorRepository {
  client: DatabaseClient;
  repository: Repository;
}
```

**Properties:**

- `client` - DatabaseClient instance for connection management
- `repository` - Unified Repository instance for all entity types

---

### SyncOptions

Options for controlling synchronization behavior.

```typescript
interface SyncOptions {
  batchSize?: number;
  maxItems?: number;
  cursor?: string | null;
  onProgress?: (progress: number, message: string) => void;
}
```

**Properties:**

- `batchSize` (optional) - Number of items per API request (default varies by type: topics/collections=10, posts=5)
- `maxItems` (optional) - Maximum items to fetch (default varies by type)
- `cursor` (optional) - Cursor for pagination (null = start from beginning, undefined = no cursor)
- `onProgress` (optional) - Callback for progress updates

**Batch Processing:**

All sync functions fetch data in batches and save to Qdrant after each batch. This means:
- Progress is saved incrementally (cursor is updated after each batch)
- Interruptions are safe - resume from the last saved cursor
- Memory usage is controlled - only one batch is in memory at a time

---

### SyncStats

Statistics returned from synchronization operations.

```typescript
interface SyncStats {
  totalFetched: number;
  totalSaved: number;
  errors: number;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  nextCursor?: string;
  postsProcessed?: number;
  usersProcessed?: number;
}
```

**Properties:**

- `totalFetched` - Total items fetched from API
- `totalSaved` - Total items saved to database
- `errors` - Number of errors encountered
- `startTime` - Sync start timestamp
- `endTime` - Sync end timestamp (when completed)
- `duration` - Total duration in milliseconds
- `nextCursor` - Cursor for resuming sync (optional)
- `postsProcessed` - Number of posts processed (for post sync, optional)
- `usersProcessed` - Number of unique users processed (for post sync, optional)

---

## Related

- [CLI Reference](/reference/cli/) - Command-line interface for sync operations
- [Fetcher API](/reference/fetcher/) - Data fetching from Product Hunt API
- [Repository API](/reference/repository/) - Data persistence to Qdrant
