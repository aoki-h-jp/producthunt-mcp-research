---
title: Configuration
description: Configure Product Hunt data ingestion and database settings
---

This guide covers all configuration options for `producthunt-mcp-research`, including Product Hunt API settings, database configuration, rate limiting, and logging.

## Overview

Configuration is managed through environment variables with sensible defaults. The tool is designed to work out of the box with minimal configuration - only the Product Hunt API token is required.

**Configuration Layers:**

1. **Fetcher Configuration** - Product Hunt API, rate limiting, retry logic
2. **Repository Configuration** - Qdrant database settings
3. **Logging Configuration** - Log levels and output format

## Quick Start

The minimal configuration to get started:

```bash
# .env file or export in shell
export PH_API_TOKEN="your-product-hunt-api-token"
```

That's it! All other settings use sensible defaults.

## Configuration Summary

### Required

| Variable | Description | Default |
|----------|-------------|---------|
| `PH_API_TOKEN` | Product Hunt API token | Required |

### Optional - Fetcher

| Variable | Description | Default |
|----------|-------------|---------|
| `TIMEOUT` | Request timeout (ms) | `30000` |
| `REQUESTS_PER_SECOND` | Rate limit | `0.056` |
| `BURST_LIMIT` | Burst capacity | `3` |
| `MAX_RETRIES` | Retry attempts | `5` |
| `REQUEST_DELAY` | Initial retry delay (s) | `5.0` |
| `MAX_DELAY` | Max retry delay (ms) | `60000` |
| `BACKOFF_MULTIPLIER` | Backoff multiplier | `2.0` |

### Optional - Database

| Variable | Description | Default |
|----------|-------------|---------|
| `EMBEDDING_MODEL` | Embedding model name | `Xenova/all-MiniLM-L6-v2` |

### Optional - Logging

| Variable | Description | Default |
|----------|-------------|---------|
| `LOG_LEVEL` | Application log level | `info` |

## Product Hunt API Configuration

### PH_API_TOKEN

**Required.** Your Product Hunt API developer token.

```bash
export PH_API_TOKEN="your-token-here"
```

**How to get a token:**

See the [Product Hunt API Setup](/installation/#product-hunt-api-setup) section in the Installation guide for detailed instructions.

**Security note:** Never commit API tokens to version control. Use `.env` files (added to `.gitignore`) or secure secret management.

---

### TIMEOUT

Request timeout in milliseconds.

```bash
export TIMEOUT="30000"
```

- **Type:** Number (milliseconds)
- **Default:** `30000` (30 seconds)
- **When to change:** For slower connections or large responses

## Rate Limiting Configuration

Product Hunt API has rate limits. These settings control request frequency.

### REQUESTS_PER_SECOND

Maximum number of requests per second.

```bash
export REQUESTS_PER_SECOND="0.056"
```

- **Type:** Number (decimal)
- **Default:** `0.056` (50 requests per 15 minutes)
- **Recommended:** `0.056` (Based on Product Hunt API limits)
- **API Limit:** Product Hunt GraphQL API has complexity-based limits (6250 complexity points per 15 minutes). Other endpoints allow 450 requests per 15 minutes. [See details](https://api.producthunt.com/v2/docs/rate_limits/headers)

---

### BURST_LIMIT

Maximum number of requests that can burst at once.

```bash
export BURST_LIMIT="3"
```

- **Type:** Integer
- **Default:** `3`
- **Range:** `1` to `10`

**How it works:**

The rate limiter uses a token bucket algorithm:
- Bucket starts with `BURST_LIMIT` tokens
- Tokens refill at `REQUESTS_PER_SECOND` rate
- Each request consumes 1 token
- Requests wait if no tokens available

## Retry Configuration

Automatic retry with exponential backoff for failed requests.

### MAX_RETRIES

Maximum number of retry attempts.

```bash
export MAX_RETRIES="3"
```

- **Type:** Integer
- **Default:** `3`
- **Range:** `1` to `10`
- **Impact:** More retries = more resilient but slower on failures

---

### REQUEST_DELAY

Base delay between retries in seconds.

```bash
export REQUEST_DELAY="1.0"
```

- **Type:** Number (seconds, converted to milliseconds internally)
- **Default:** `1.0` (1 second)
- **Impact:** Initial wait time before first retry

---

### MAX_DELAY

Maximum delay between retries in milliseconds.

```bash
export MAX_DELAY="30000"
```

- **Type:** Integer (milliseconds)
- **Default:** `30000` (30 seconds)
- **Impact:** Caps exponential backoff to prevent extremely long waits

---

### BACKOFF_MULTIPLIER

Exponential backoff multiplier.

```bash
export BACKOFF_MULTIPLIER="2.0"
```

- **Type:** Number (decimal)
- **Default:** `2.0`
- **Impact:** How quickly retry delays increase

**Delay Calculation:**

```
delay = min(REQUEST_DELAY * (BACKOFF_MULTIPLIER ^ attempt), MAX_DELAY)
```

## Database Configuration

Qdrant vector database settings.

---

### EMBEDDING_MODEL

Embedding model for text vectorization.

```bash
export EMBEDDING_MODEL="Xenova/all-MiniLM-L6-v2"
```

- **Type:** String
- **Default:** `Xenova/all-MiniLM-L6-v2`
- **Supported Models:**
  - `Xenova/all-MiniLM-L6-v2` - Fast, lightweight (384 dimensions, Cosine distance)
  - `Xenova/all-mpnet-base-v2` - Higher quality (768 dimensions, Cosine distance)
  - `Xenova/all-MiniLM-L12-v2` - Balanced (384 dimensions, Cosine distance)

:::caution
Changing the model after data is stored may cause compatibility issues. Use the same model throughout your project.
:::

---


## Logging Configuration

### LOG_LEVEL

Application-wide log level.

```bash
export LOG_LEVEL="info"
```

- **Type:** `trace` | `debug` | `info` | `warn` | `error` | `fatal`
- **Default:** `info`

**Log Output:**

Logs are output to stdout in JSON format (default) or pretty-printed format (for local development).

```json
{"level":"info","time":"2024-01-15T10:00:00.000Z","service":"orchestrator","msg":"Synchronization completed","totalSaved":150}
```

## Configuration Files

### Using .env Files

Create a `.env` file in the project root or fetcher directory:

```bash
# .env
PH_API_TOKEN=your-token-here
LOG_LEVEL=info
REQUESTS_PER_SECOND=0.056
BURST_LIMIT=3
MAX_RETRIES=5
REQUEST_DELAY=5.0
MAX_DELAY=60000
EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2
```

Load it in your shell:

```bash
# Using dotenv
source .env

# Or with direnv
echo "dotenv" > .envrc
direnv allow
```

---
## Related

- [Quick Start](/quick-start/) - Get started with default configuration
- [CLI Reference](/reference/cli/) - Command-line options
