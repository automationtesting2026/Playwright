import { defineConfig, devices } from '@playwright/test';
import envConfig from './config/env';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: {
    timeout: 10_000
  },
  forbidOnly: !!process.env.CI,
  retries:  1 ,
  workers: process.env.CI ? 2 : 4,
  reporter: [
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['list']
  ],
  outputDir: 'test-results',
  use: {
    baseURL: envConfig.baseUrl,
    headless: false,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 15_000,
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'off',
    trace: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        // Use a standard Chrome user agent to reduce automation detection
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      }
    }
  ]
});
