/// <reference types="vitest/config" />
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Optional: point tests at an already-installed Chromium (e.g. on CI).
const executablePath = process.env.VIA_CHROMIUM_PATH;

export default defineConfig({
  plugins: [react()],
  // Pre-bundle large dependencies so the test browser doesn't reload mid-run.
  optimizeDeps: {
    include: ['react-aria-components', 'lucide-react', 'recharts', '@internationalized/date'],
  },
  test: {
    projects: [
      {
        // Token checks: generated files in sync with the .pen file, WCAG contrast.
        test: {
          name: 'unit',
          include: ['src/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        // Every story rendered in Chromium: play functions + axe accessibility checks.
        extends: true,
        plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({
              ...(executablePath ? { launchOptions: { executablePath } } : {}),
              // Copy buttons write to the clipboard; grant it in the test browser.
              contextOptions: { permissions: ['clipboard-read', 'clipboard-write'] },
            }),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
