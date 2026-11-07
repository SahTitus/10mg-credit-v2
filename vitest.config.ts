import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  // Match Next.js automatic JSX transform while tsconfig keeps jsx set to preserve
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/tests/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./src/tests/setup.ts'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '.next/', 'src/tests/', 'docs/'],
    },
  },
});
