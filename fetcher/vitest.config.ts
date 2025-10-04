import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        'src/generated/',
        '**/*.d.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@producthunt-mcp-research/shared': resolve(__dirname, '../shared/src/index.ts')
    }
  }
});
