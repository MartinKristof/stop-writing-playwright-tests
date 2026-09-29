import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Read from ".env" file.
dotenv.config({ path: path.resolve(__dirname, '.env') });

const SAUCE_DEMO_BASE_URL = process.env.SAUCE_DEMO_BASE_URL || 'https://www.saucedemo.com/';

export default defineConfig({
  // No testDir: the whole repository is the agents' write sandbox. artifacts/ holds specs to read, not run.
  testIgnore: '**/artifacts/**',
  fullyParallel: true,
  retries: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/junit-results.xml' }],
  ],
  use: {
    baseURL: SAUCE_DEMO_BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    testIdAttribute: 'data-test',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  outputDir: 'test-results',
});


