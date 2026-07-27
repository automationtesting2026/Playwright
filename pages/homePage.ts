import { Page } from '@playwright/test';
import { BasePage } from './basePage';
import { loginPageLocators } from '../locators/loginPage.locators';
import { scrapPageLocators } from '../locators/scrapPage.locators';
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

  async clickEscrapTile(): Promise<import('@playwright/test').Page | null> {
    const prevUrl = await this.getPageUrl();
    
    // Strategy 1: Try case-insensitive text match on buttons first
    try {
      const buttons = await this.page.locator('button').all();
      for (const button of buttons) {
        const text = await button.textContent();
        if (text && text.toLowerCase().includes('escrap')) {
          if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
            console.log(`Found Escrap button with text: ${text}`);
            await button.scrollIntoViewIfNeeded();
            const popupPromise = this.page.context().waitForEvent('page', { timeout: 5000 }).catch(() => null);
            await button.click({ force: true, timeout: AppConstants.defaultTimeout });
            const popup = await popupPromise;
            if (popup) {
              await popup.waitForLoadState('load');
              return popup;
            }
            await this.page.waitForTimeout(2000);
            return this.page;
          }
        }
      }
    } catch (err) {
      console.log('Strategy 1 failed:', err);
    }

    // Strategy 2: Try divs and spans with escrap text
    try {
      const escrapElements = await this.page.locator(`xpath=//*[contains(translate(normalize-space(.), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'escrap')]`).all();
      for (const element of escrapElements) {
        if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
          console.log('Found Escrap element via xpath');
          await element.scrollIntoViewIfNeeded();
          const popupPromise = this.page.context().waitForEvent('page', { timeout: 5000 }).catch(() => null);
          await element.click({ force: true, timeout: AppConstants.defaultTimeout });
          const popup = await popupPromise;
          if (popup) {
            await popup.waitForLoadState('load');
            return popup;
          }
          await this.page.waitForTimeout(2000);
          return this.page;
        }
      }
    } catch (err) {
      console.log('Strategy 2 failed:', err);
    }

    // Strategy 3: Try the locator from scrapPageLocators
    const selectorStrings = [
      scrapPageLocators.escrapTile,
      'button:has-text("Escrap")',
      'button:has-text("eScrap")',
      'text=/Escrap/i',
      'text=/eScrap/i',
    ];

    let locatorToClick = null as import('@playwright/test').Locator | null;

    for (const selector of selectorStrings) {
      const candidate = this.page.locator(selector).first();
      if (await candidate.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log(`Found Escrap tile with selector: ${selector}`);
        locatorToClick = candidate;
        break;
      }
    }

    // Try in frames if not found on page
    if (!locatorToClick) {
      for (const frame of this.page.frames()) {
        for (const selector of selectorStrings) {
          const candidate = frame.locator(selector).first();
          if (await candidate.isVisible({ timeout: 1000 }).catch(() => false)) {
            console.log(`Found Escrap tile in frame with selector: ${selector}`);
            locatorToClick = candidate;
            break;
          }
        }
        if (locatorToClick) break;
      }
    }

    if (!locatorToClick) {
      const counts = await Promise.all(selectorStrings.map(async (selector) => {
        const pageCount = await this.page.locator(selector).count().catch(() => 0);
        const frameCounts = await Promise.all(this.page.frames().map(async (frame) => frame.locator(selector).count().catch(() => 0)));
        return `${selector} => page:${pageCount}, frames:${frameCounts.join(',')}`;
      }));
      throw new Error(`Escrap tile not found on the home page. Counts: ${counts.join(' | ')}`);
    }

    await locatorToClick.scrollIntoViewIfNeeded();
    const popupPromise = this.page.context().waitForEvent('page', { timeout: 5000 }).catch(() => null);
    await locatorToClick.click({ force: true, timeout: AppConstants.defaultTimeout });

    const popup = await popupPromise;
    if (popup) {
      await popup.waitForLoadState('load');
      return popup;
    }

    if (this.page.isClosed()) {
      const nextPage = await this._findOpenPageAfter(prevUrl);
      if (nextPage) return nextPage;
      throw new Error('Escrap click closed the original page and no other open page could be located');
    }

    try {
      await this.page.waitForNavigation({ waitUntil: 'load', timeout: AppConstants.defaultTimeout });
    } catch {
      // ignore if navigation is SPA-driven or page closed
    }

    const currentUrl = await this.getPageUrl();
    if (currentUrl !== prevUrl && currentUrl !== '') {
      return this.page;
    }

    const pages = this.page.context().pages();
    for (const p of pages) {
      try {
        const url = p.url();
        if (url && url !== prevUrl && !url.startsWith('about:')) return p;
      } catch {
        // ignore
      }
    }

    const newRequestPage = await this._waitForNewRequestPage(20000);
    if (newRequestPage) return newRequestPage;

    if (this.page.isClosed()) {
      const nextPage = await this._findOpenPageAfter(prevUrl);
      if (nextPage) return nextPage;
    }

    return this.page;
  }

  private async _findOpenPageAfter(prevUrl: string): Promise<import('@playwright/test').Page | null> {
    for (const p of this.page.context().pages()) {
      if (p.isClosed()) continue;
      try {
        const url = p.url();
        if (url && url !== prevUrl && !url.startsWith('about:')) {
          return p;
        }
      } catch {
        // ignore
      }
    }

    const openPages = this.page.context().pages().filter((p) => !p.isClosed());
    return openPages.length ? openPages[0] : null;
  }

  private async _waitForNewRequestPage(timeoutMs: number): Promise<import('@playwright/test').Page | null> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      for (const p of this.page.context().pages()) {
        if (await this._pageHasNewRequest(p)) return p;
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    return null;
  }

  private async _pageHasNewRequest(page: import('@playwright/test').Page): Promise<boolean> {
    const visibleMain = await page.locator(scrapPageLocators.newRequestTile).first().isVisible({ timeout: 1000 }).catch(() => false);
    if (visibleMain) return true;

    for (const frame of page.frames()) {
      const visibleFrame = await frame.locator(scrapPageLocators.newRequestTile).first().isVisible({ timeout: 1000 }).catch(() => false);
      if (visibleFrame) return true;
    }
    return false;
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
