import { Page } from '@playwright/test';
import { BasePage } from './basePage';
import { loginPageLocators } from '../locators/loginPage.locators';
import { AppConstants } from '../constants/appConstants';

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async clickSwiftTile(): Promise<import('@playwright/test').Page | null> {
    const prevUrl = await this.getPageUrl();
    // Try multiple locator strategies for the tile
    const strategies = [
      () => this.page.getByRole('button', { name: /SWIFT/i }).first(),
      () => this.page.getByRole('link', { name: /SWIFT/i }).first(),
      () => this.page.getByText('SWIFT', { exact: true }).first(),
      () => this.page.getByText('SWIFT', { exact: false }).first()
    ];

    let swiftLocator: import('@playwright/test').Locator | null = null;
    for (const s of strategies) {
      const loc = s();
      try {
        await loc.waitFor({ state: 'visible', timeout: 2000 });
        swiftLocator = loc;
        break;
      } catch {
        // try next
      }
    }
    if (!swiftLocator) throw new Error('SWIFT tile not found');

    // Try to detect a popup/new page
    const popupPromise = this.page.context().waitForEvent('page', { timeout: 2000 }).catch(() => null);
    await swiftLocator.click();
    const popup = await popupPromise;
    if (popup) {
      await popup.waitForLoadState('load');
      return popup;
    }

    // Detect SPA navigation or frame navigation by polling for URL changes in pages/frames
    const start = Date.now();
    const timeout = Math.max(AppConstants.defaultTimeout, 20000);
    while (Date.now() - start < timeout) {
      // check context pages
      const pages = this.page.context().pages();
        for (const p of pages) {
        try {
          const u = p.url();
          if (u && u !== prevUrl && !u.startsWith('about:')) return true;
        } catch {
          // ignore
        }
      }
      // if any page changed, return that page
      for (const p of pages) {
        try {
          const u = p.url();
          if (u && u !== prevUrl && !u.startsWith('about:')) return p;
        } catch {}
      }

      // check frames in the current page
      const frames = this.page.frames();
      for (const f of frames) {
        try {
          const fu = f.url();
          if (fu && fu !== prevUrl && !fu.startsWith('about:')) return true;
        } catch {
          // ignore
        }
      }

      await new Promise((r) => setTimeout(r, 250));
    }

    // As a last resort detect SWIFT app loaded by presence of VOB tile or VOB HOME header
      try {
        const vobHeader = this.page.getByText('VOB HOME', { exact: false }).first();
        await vobHeader.waitFor({ state: 'visible', timeout: 2000 });
        return this.page;
      } catch {
        try {
          const vob = this.page.getByText('VOB', { exact: true }).first();
          await vob.waitFor({ state: 'visible', timeout: 2000 });
          return this.page;
        } catch {
          return null;
        }
      }
  }

  async clickFdvobTile(): Promise<import('@playwright/test').Page | null> {
    const prevUrl = await this.getPageUrl();
    const fdvobLocator = this.page.getByText('FDVOB', { exact: true }).first();
    // try case-insensitive contains if exact not present
    try {
      await fdvobLocator.waitFor({ state: 'visible', timeout: AppConstants.defaultTimeout });
    } catch {
      // fallback to contains
      const alt = this.page.getByText('FDVOB', { exact: false }).first();
      await alt.waitFor({ state: 'visible', timeout: AppConstants.defaultTimeout });
      return await this._clickAndDetectOpen(alt, prevUrl);
    }

    return await this._clickAndDetectOpen(fdvobLocator, prevUrl);
  }

  async clickVobTile(): Promise<import('@playwright/test').Page | null> {
    const prevUrl = await this.getPageUrl();
    // try exact VOB then contains
    let vobLocator = this.page.getByText('VOB', { exact: true }).first();
    try {
      await vobLocator.waitFor({ state: 'visible', timeout: AppConstants.defaultTimeout });
    } catch {
      vobLocator = this.page.getByText('VOB', { exact: false }).first();
      await vobLocator.waitFor({ state: 'visible', timeout: AppConstants.defaultTimeout });
    }

    const opened = await this._clickAndDetectOpen(vobLocator, prevUrl);
    if (opened instanceof Object && 'url' in opened) return opened as import('@playwright/test').Page;
    if (opened === true) return this.page;

    // fallback: wait for vob landing header defined in locators
    if (loginPageLocators.vobLandingHeader) {
      try {
        const header = this.page.locator(loginPageLocators.vobLandingHeader);
        await header.waitFor({ state: 'visible', timeout: AppConstants.defaultTimeout });
        return this.page;
      } catch {
        // ignore
      }
    }

    return null;
  }

  private async _clickAndDetectOpen(locator: import('@playwright/test').Locator, prevUrl: string): Promise<import('@playwright/test').Page | true | null> {
    const popupPromise = this.page.context().waitForEvent('page', { timeout: 2000 }).catch(() => null);
    await locator.click();
    const popup = await popupPromise;
    if (popup) {
      await popup.waitForLoadState('load');
      return popup;
    }

    try {
      await this.page.waitForNavigation({ waitUntil: 'load', timeout: AppConstants.defaultTimeout });
    } catch {
      // ignore
    }

    const current = await this.getPageUrl();
    if (current !== prevUrl && current !== '') return true;

    // check context pages for a changed url
    const pages = this.page.context().pages();
    for (const p of pages) {
      try {
        const u = p.url();
        if (u && u !== prevUrl && !u.startsWith('about:')) return p;
      } catch {}
    }

    return null;
  }
}
