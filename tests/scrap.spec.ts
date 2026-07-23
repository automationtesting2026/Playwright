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

  // Open SWIFT and then New Request inside SWIFT
  const swiftResult = await home.clickSwiftTile();
  logger.info('SWIFT result: ' + (swiftResult ? 'opened' : 'not-opened'));
  const swiftPage: any = swiftResult && typeof swiftResult === 'object' && typeof swiftResult.url === 'function' ? swiftResult : page;
  const scrap = new ScrapPage(swiftPage);
  await scrap.openNewRequest();
  await page.screenshot({ path: `screenshots/step-2-request-modal-${Date.now()}.png` });

  await scrap.selectScrapType('Tractor Scrap');
  await page.screenshot({ path: `screenshots/step-3-scrap-type-${Date.now()}.png` });

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
