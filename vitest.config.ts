import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      reporter: ['text', 'html'],
      reportsDirectory: 'coverage',
      all: false,
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['**/*.d.ts', 'src/**/__tests__/**', 'tests/**'],
    },
  },
});
