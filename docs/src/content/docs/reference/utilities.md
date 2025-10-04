---
title: Utilities
description: Shared utility functions and classes used across the project
---

The utilities module provides shared functionality used across all layers of the project, including logging, result handling, rate limiting, and retry mechanisms.

## Logger

Structured logging utility with multiple log levels and pretty-printing support.

### Constructor

```typescript
new Logger(config: LoggerConfig)
```

**Options:**

```typescript
interface LoggerConfig {
  level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  service: string;
  prettyPrint?: boolean;
}
```

**Parameters:**

- `level` - Minimum log level to output
- `service` - Service name for log context
- `prettyPrint` (optional) - Enable pretty-printed logs (default: false)

---

### Log Levels

Log levels in order of severity:

1. **trace** - Most detailed debugging information
2. **debug** - Detailed debugging information
3. **info** - General informational messages
4. **warn** - Warning messages for potential issues
5. **error** - Error messages for failures
6. **fatal** - Critical errors that may cause application termination

---

### Output Format

**Standard (prettyPrint: false):**

```json
{"level":"info","time":"2024-01-15T10:00:00.000Z","service":"api","msg":"Request completed","userId":"123"}
```

**Pretty (prettyPrint: true):**

```
[INFO] 2024-01-15T10:00:00.000Z api: Request completed
  userId: "123"
```

## Result Type

Type-safe error handling using discriminated unions.

### AsyncResult<T, E>

A Promise that resolves to either success or failure.

```typescript
type AsyncResult<T, E> = Promise<
  | { success: true; data: T }
  | { success: false; error: E }
>;
```

## RateLimiter

Token bucket algorithm for rate limiting API requests.

### RateLimiter

Advanced rate limiter with token bucket algorithm supporting burst capacity.

### Constructor

```typescript
new RateLimiter(config: RateLimitConfig)
```

**Configuration:**

```typescript
interface RateLimitConfig {
  requestsPerSecond: number;  // default: 1
  burstLimit: number;         // default: 5
}
```

**Parameters:**

- `requestsPerSecond` - Rate at which tokens are added (default: 1)
- `burstLimit` - Maximum tokens that can accumulate (default: 5)

---

### execute()

Executes a function with rate limiting applied.

```typescript
async execute<T>(fn: () => Promise<T>): Promise<T>
```

**Behavior:**

- Applies rate limiting before executing the function
- Returns the result of the function execution
- Handles rate limiting automatically

---

### updateConfig()

Updates the rate limiter configuration at runtime.

```typescript
updateConfig(config: Partial<RateLimitConfig>): void
```

**Parameters:**

- `config` - Partial configuration to update

**Behavior:**

- Updates configuration without recreating the limiter
- Adjusts token bucket capacity if burstLimit changes
- Useful for dynamic rate limit adjustment

---

### How It Works

**Token Bucket Algorithm:**

1. Bucket starts with `burstLimit` tokens
2. Tokens are added at `requestsPerSecond` rate
3. Max tokens capped at `burstLimit`
4. Each request consumes one token
5. If no tokens, request waits

---

### Utility Functions

#### getRateLimiter()

Gets or creates a named rate limiter instance.

```typescript
function getRateLimiter(name: string, config: RateLimitConfig): RateLimiter
```

**Parameters:**

- `name` - Unique name for the rate limiter
- `config` - Rate limiter configuration

**Example:**

```typescript
import { getRateLimiter } from '@producthunt-mcp-research/fetcher';

// Get or create named rate limiter
const apiLimiter = getRateLimiter('producthunt-api', {
  requestsPerSecond: 0.5,
  burstLimit: 3
});
```

#### removeRateLimiter()

Removes a named rate limiter instance.

```typescript
function removeRateLimiter(name: string): void
```

**Parameters:**

- `name` - Name of the rate limiter to remove

**Example:**

```typescript
import { removeRateLimiter } from '@producthunt-mcp-research/fetcher';

// Clean up rate limiter
removeRateLimiter('producthunt-api');
```

---

## Retry Utility

Automatic retry with exponential backoff.

### retry()

Retries a function with exponential backoff.

```typescript
async function retry<T>(
  fn: () => Promise<T>,
  config: RetryConfig,
  shouldRetry?: (error: Error) => boolean
): Promise<T>
```

**Configuration:**

```typescript
interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}
```

**Parameters:**

- `fn` - Async function to retry
- `config.maxAttempts` - Maximum retry attempts
- `config.baseDelay` - Initial delay in milliseconds
- `config.maxDelay` - Maximum delay cap
- `config.backoffMultiplier` - Delay multiplier for each retry
- `shouldRetry` (optional) - Function to determine if error should be retried

---

### Exponential Backoff

Delay calculation: `delay = min(baseDelay * (multiplier ^ attempt), maxDelay)`

---

### Error Handling

```typescript
try {
  const data = await retry(riskyOperation, retryConfig);
  console.log('Success:', data);
} catch (error) {
  console.error('All retries failed:', error);
}
```

## Related

- [Fetcher API](/reference/fetcher/) - Uses rate limiting and retry
- [Orchestrator API](/reference/orchestrator/) - Uses Result types and logging
