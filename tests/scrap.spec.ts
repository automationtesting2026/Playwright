import { test } from '../fixtures/customFixtures';
import { LoginPage } from '../pages/loginPage';
import { HomePage } from '../pages/homePage';
import { ScrapPage } from '../pages/scrapPage';
import { expect } from '@playwright/test';

test('Scrap module end-to-end', async ({ page, env, logger }) => {
  logger.info('Starting scrap E2E');
  const login = new LoginPage(page);
  const home = new HomePage(page);

  await login.navigateToApplication(env.baseUrl);
  await login.login(env.username, env.password);
  await page.screenshot({ path: `screenshots/step-1-home-${Date.now()}.png`, fullPage: true });

  // Open E scrap module and then New Request inside that module
  const escrapResult = await home.clickEscrapTile();
  logger.info('Escrap module result: ' + (escrapResult ? 'opened' : 'not-opened'));
  const escrapPage: any = escrapResult && typeof escrapResult === 'object' && typeof escrapResult.url === 'function' ? escrapResult : page;
  logger.info(`E scrap page URL: ${await escrapPage.url()}`);
  await escrapPage.screenshot({ path: `screenshots/step-2-after-escrap-click-${Date.now()}.png`, fullPage: true });
  const scrap = new ScrapPage(escrapPage);
  await scrap.openNewRequest();
  await escrapPage.screenshot({ path: `screenshots/step-3-request-modal-${Date.now()}.png`, fullPage: true });

  await scrap.selectScrapType('Tractor Scrap');
  await escrapPage.screenshot({ path: `screenshots/step-3-tractor-scrap-selected-${Date.now()}.png`, fullPage: true });

  await scrap.fillBasicDetails('Platform2', 'Project C');
  await page.screenshot({ path: `screenshots/step-4-basic-details-${Date.now()}.png`, fullPage: true });

  await scrap.addScrapRowAndFill('weywe', 'wetry', '36');
  await page.screenshot({ path: `screenshots/step-5-scrap-row-${Date.now()}.png`, fullPage: true });

  await scrap.submitRequest();
  await page.screenshot({ path: `screenshots/step-6-submitted-${Date.now()}.png`, fullPage: true });

  // Expect a success information dialog present
  const info = page.getByText('ESCRAP Request Created Successfully', { exact: false });
  expect(await info.isVisible()).toBeTruthy();
});
