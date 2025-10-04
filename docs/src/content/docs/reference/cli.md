---
title: CLI Reference
description: Command-line interface reference for Product Hunt data synchronization
---

The orchestrator CLI provides commands for synchronizing Product Hunt data to your local Qdrant instance.

## Commands

All commands are run from the project root using pnpm:

### sync:all

Synchronizes all data types (topics, collections, and posts with comments) in a balanced manner with automatic resumption.

```bash
pnpm run sync:all
```

This command executes:
1. Topics synchronization
2. Collections synchronization
3. Posts synchronization (including comments)

**Automatic Resumption:** The command automatically resumes from where it left off using saved cursors. If interrupted, simply run the command again to continue from the last successful position.

### sync:topics

Synchronizes only Product Hunt topics.

```bash
pnpm run sync:topics
```

**Use case:** Update topic data independently.

### sync:collections

Synchronizes only Product Hunt collections.

```bash
pnpm run sync:collections
```

**Use case:** Update collection data independently.

### sync:posts

Synchronizes Product Hunt posts (including comments).

```bash
pnpm run sync:posts
```

**Use case:** Update post data independently.

## Options

Options are passed after `--` separator:

### --maxItems

Specify the maximum number of items to fetch.

```bash
pnpm run sync:posts -- --maxItems=200
```

- **Type:** Number
- **Default:** 100
- **Applies to:** `sync:all`, `sync:posts`, `sync:topics`, `sync:collections`

### --batchSize

Specify the number of items to fetch per API request.

```bash
pnpm run sync:posts -- --batchSize=20
```

- **Type:** Number
- **Default:** 10
- **Applies to:** `sync:all`, `sync:posts`, `sync:topics`, `sync:collections`

### --clearCursors

Clear saved cursors and start from the beginning (disables automatic resumption).

```bash
pnpm run sync:all -- --clearCursors
```

- **Type:** Boolean flag
- **Default:** false
- **Applies to:** `sync:all`, `sync:posts`, `sync:topics`, `sync:collections`
- **Note:** By default, all sync commands automatically resume from saved cursors. Use this flag to start fresh.


## Examples

### Basic Usage

Sync all data with default settings:

```bash
pnpm run sync:all
```

### Custom Post Sync

Fetch 500 posts in batches of 25:

```bash
pnpm run sync:posts -- --maxItems=500 --batchSize=25
```

### Multiple Options

Combine multiple options:

```bash
pnpm run sync:posts -- --maxItems=200 --batchSize=20
```

### Sequential Syncs

Run individual syncs in sequence:

```bash
pnpm run sync:topics -- --maxItems=50
pnpm run sync:collections -- --maxItems=20
pnpm run sync:posts -- --maxItems=100
```

### Automatic Resumption

The `sync:all` command automatically resumes from where it left off:

```bash
# First run - starts from beginning
pnpm run sync:all -- --maxItems=100

# If interrupted, second run continues from saved cursors
pnpm run sync:all -- --maxItems=100

# To start fresh, clear cursors first
pnpm run sync:all -- --clearCursors --maxItems=100
```

## Exit Codes

The CLI uses standard exit codes:

- **0:** Success - synchronization completed without errors
- **1:** Failure - synchronization failed (check logs for details)

## Error Handling

### API Rate Limit Exceeded

If you encounter rate limit errors:

```
[ERROR] API rate limit exceeded
```

**Solution:** The CLI automatically handles rate limiting with built-in delays. If you still encounter issues, reduce `--batchSize` or wait before retrying.

### Authentication Failed

```
[ERROR] Product Hunt API token is required
```

**Solution:** Ensure `PH_API_TOKEN` environment variable is set. See [Installation](/installation/) guide.

### Database Connection Failed

```
[ERROR] Failed to connect to database
```

**Solution:** Check that Qdrant is running and accessible:

```bash
# Verify Qdrant is running
curl http://localhost:6333/health

# If not running, start Qdrant
docker run -p 6333:6333 -p 6334:6334 \
  -v "$(pwd)/qdrant_storage:/qdrant/storage:z" \
  qdrant/qdrant
```

## Logging

The CLI outputs structured logs with different levels:

- `[INFO]` - Normal operation progress
- `[WARN]` - Non-critical warnings
- `[ERROR]` - Errors that caused failure

To adjust log verbosity, set the `LOG_LEVEL` environment variable:

```bash
export LOG_LEVEL=debug
pnpm run sync:all
```

## Related

- [Quick Start](/quick-start/) - Get started with basic synchronization
- [Orchestrator API](/reference/orchestrator/) - Programmatic API for the sync commands
- [Configuration](/configuration/) - Configure sync behavior and database settings
