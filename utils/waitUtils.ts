import { Locator } from '@playwright/test';
import { AppConstants } from '../constants/appConstants';

export class WaitUtils {
  static async waitUntilVisible(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout: AppConstants.defaultTimeout });
  }

  static async waitUntilHidden(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout: AppConstants.defaultTimeout });
  }

  static async waitForText(locator: Locator, expectedText: string): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout: AppConstants.defaultTimeout });
    await locator.waitFor({ state: 'attached', timeout: AppConstants.defaultTimeout });
    await locator.page().waitForFunction(
      (element, text) => element.textContent?.includes(text),
      locator,
      expectedText,
      { timeout: AppConstants.defaultTimeout }
    );
  }
}
