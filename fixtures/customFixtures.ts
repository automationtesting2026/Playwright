import { test as baseTest, chromium, BrowserContextOptions, Browser, BrowserContext, Page } from '@playwright/test';
import envConfig from '../config/env';
import { LoggerHelper } from '../helpers/loggerHelper';

export type CustomFixtures = {
  env: typeof envConfig;
  logger: LoggerHelper;
};

const test = baseTest.extend<CustomFixtures>({
  env: [envConfig, { scope: 'test' }],
  logger: async ({}, use) => {
    const logger = new LoggerHelper();
    await use(logger);
  }
});

export { test };
export const expect = test.expect;
