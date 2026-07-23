import { Page, Locator } from '@playwright/test';
import { AppConstants } from '../constants/appConstants';

export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(path: string): Promise<void> {
    await this.page.goto(path, { waitUntil: 'load' });
  }

  async click(locator: string | Locator): Promise<void> {
    await this.page.locator(locator).click({ timeout: AppConstants.defaultTimeout });
  }

  async fill(locator: string | Locator, value: string): Promise<void> {
    await this.page.locator(locator).fill(value, { timeout: AppConstants.defaultTimeout });
  }

  async type(locator: string | Locator, value: string): Promise<void> {
    await this.page.locator(locator).type(value, { timeout: AppConstants.defaultTimeout });
  }

  async getText(locator: string | Locator): Promise<string> {
    return await this.page.locator(locator).innerText({ timeout: AppConstants.defaultTimeout });
  }

  async isVisible(locator: string | Locator): Promise<boolean> {
    return await this.page.locator(locator).isVisible({ timeout: AppConstants.defaultTimeout });
  }

  async waitForElement(locator: string | Locator): Promise<void> {
    await this.page.locator(locator).waitFor({ state: 'visible', timeout: AppConstants.defaultTimeout });
  }

  async uploadFile(locator: string | Locator, filePath: string): Promise<void> {
    await this.page.setInputFiles(locator, filePath);
  }

  async getPageUrl(): Promise<string> {
    return this.page.url();
  }
}
