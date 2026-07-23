import { expect } from '@playwright/test';
import { test } from '../fixtures/customFixtures';
import { LoginPage } from '../pages/loginPage';
import { HomePage } from '../pages/homePage';

test.describe('Login Flow', () => {
  test('should login using credentials from .env and verify home page', {
    timeout: 60000
  }, async ({ page, env, logger }) => {
    logger.info(`Starting login test for ${env.name} environment`);
    const loginPage = new LoginPage(page);

    await loginPage.navigateToApplication(env.baseUrl);
    await loginPage.login(env.username, env.password);

    try {
      expect(await loginPage.isHomePageVisible()).toBeTruthy();
      logger.info('Home page is displayed after login');

      // Click the SWIFT tile and verify the application opened
      const homePage = new HomePage(page);
      const opened = await homePage.clickSwiftTile();
      expect(opened).toBeTruthy();
      logger.info('SWIFT application opened after clicking the tile');

      // Click the VOB tile inside the SWIFT app (best-effort) and verify it opened
      const vobOpened = await homePage.clickVobTile();
      if (!vobOpened) {
        // capture screenshot from any open page if original closed
        let capturePage = page;
        try {
          if (page.isClosed()) {
            const pages = page.context().pages();
            capturePage = pages.length ? pages[0] : page;
          }
        } catch {
          capturePage = page;
        }

        try {
          await capturePage.screenshot({ path: `screenshots/vob-detect-failure-${Date.now()}.png`, fullPage: true });
        } catch {
          // ignore
        }

        logger.warn('VOB tile click did not show a detectable navigation; screenshot captured');
      } else {
        logger.info('VOB tile opened after clicking the tile');
      }
    } catch (error) {
      // If the original page was closed by the app, try to capture from any open page
      let capturePage = page;
      try {
        if (page.isClosed()) {
          const pages = page.context().pages();
          capturePage = pages.length ? pages[0] : page;
        }
      } catch {
        // fallback to original page if context access fails
        capturePage = page;
      }

      try {
        await capturePage.screenshot({ path: `screenshots/login-failure-${Date.now()}.png`, fullPage: true });
      } catch {
        // ignore screenshot failures
      }

      throw error;
    }
  });
});
