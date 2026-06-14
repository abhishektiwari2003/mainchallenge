import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      // 'json' + 'json-summary' emit coverage-final.json + coverage-summary.json
      // (machine-readable for automated analyzers); 'lcov' emits lcov.info.
      reporter: ['text', 'text-summary', 'json', 'json-summary', 'lcov', 'html'],
      reportsDirectory: './coverage',
      // In Vitest v4, specifying `include` makes coverage count EVERY matching
      // source file (even those no test imports), so coverage is honest/complete.
      include: ['src/lib/**/*.ts', 'src/features/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/**/*.d.ts',
        'src/lib/supabase/**',
        'src/lib/ai/client.ts',
        'src/lib/env.ts',
        'src/lib/types.ts',
        'src/test/**',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
