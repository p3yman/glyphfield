import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/index.ts', 'src/types.ts'],
      thresholds: {
        branches: 75,
        functions: 90,
        lines: 90,
        statements: 90,
      },
    },
  },
});
