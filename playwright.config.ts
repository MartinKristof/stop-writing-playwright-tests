import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Read from ".env" file.
dotenv.config({ path: path.resolve(__dirname, '.env') });

const SAUCE_DEMO_BASE_URL = process.env.SAUCE_DEMO_BASE_URL ?? 'https://www.saucedemo.com/';

export default defineConfig({
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
      name: 'setup',
      testMatch: /.*\.seed.spec.ts/,
    },
    {
      name: 'logged user',
      testIgnore: /.*\.seed\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
  outputDir: 'test-results',
});


