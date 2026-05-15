import { defineConfig, devices } from '@playwright/test';

/**
 * VLTHR Terminal UI Audit - Playwright Config
 * Run with: npx playwright test tests/audit.spec.ts --headed
 */

const BASE_URL = process.env.APP_URL || 'https://vlthr-terminal.vercel.app';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Run sequentially for audit
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'test-results/html-report' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'on',
    screenshot: 'on',
    video: 'on',
    // Use Chrome on Windows (already installed, no download needed)
    channel: 'chrome',
    headless: false, // Must be headed for manual login
    viewport: { width: 1440, height: 900 },
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },
  projects: [
    {
      name: 'audit',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
