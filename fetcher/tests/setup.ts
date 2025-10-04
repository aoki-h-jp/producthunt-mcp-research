/**
 * Vitest test setup
 *
 * Global test configuration and mocks
 */
import { vi } from 'vitest';

// Mock environment variables
process.env.PH_API_TOKEN = 'test-api-token';
process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests

// Mock console methods to reduce test output noise
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};
