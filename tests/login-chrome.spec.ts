import { test, expect } from '@playwright/test';
import envConfig from '../config/env';
import { loginPageLocators } from '../locators/loginPage.locators';
import { LoginPage } from '../pages/loginPage';
import { HomePage } from '../pages/homePage';
import { ScrapPage } from '../pages/scrapPage';

test.describe('Login - Chrome visible', () => {
  test('should login, open E scrap module, and create a new request', async ({ page }) => {
    await page.goto(envConfig.baseUrl);

    const emailInput = page.locator(loginPageLocators.emailInput).first();
    const passwordInput = page.locator(loginPageLocators.passwordInput).first();
    const signInButton = page.getByRole('button', { name: 'Sign In', exact: true });

    await expect(emailInput).toBeVisible({ timeout: envConfig.waitTimeout });
    await expect(passwordInput).toBeVisible({ timeout: envConfig.waitTimeout });
    await expect(signInButton).toBeVisible({ timeout: envConfig.waitTimeout });

    await emailInput.fill(envConfig.username);
    await passwordInput.fill(envConfig.password);

    const loginPopupPromise = page.context().waitForEvent('page', { timeout: 6000 }).catch(() => null);
    await Promise.all([signInButton.click(), loginPopupPromise]);
    const homePage = (await loginPopupPromise) ?? page;
    await homePage.waitForLoadState('load');

    const loginError = homePage.locator('text=The username or password you entered is incorrect.');
    if (await loginError.isVisible({ timeout: 3000 }).catch(() => false)) {
      await homePage.screenshot({ path: 'test-results/login-invalid-credentials.png', fullPage: true });
      throw new Error('Login failed: invalid username or password. Check .env credentials.');
    }

    const home = new HomePage(homePage);

    const escrapResult = await home.clickEscrapTile();
    const targetPage = escrapResult ?? page;
    if (escrapResult) {
      await targetPage.waitForLoadState('load');
    }

    const scrap = new ScrapPage(targetPage);

    // Step 1: Open the New Request modal
    await scrap.openNewRequest();

    // Step 2: Wait for the Request Type modal to appear
    await targetPage.waitForSelector('text=Request Type', { timeout: envConfig.waitTimeout });

    // Step 3: Select Tractor Scrap and click Next
    await scrap.selectScrapType('Tractor Scrap');
    console.log('Selected Tractor Scrap and clicked Next');

    // Step 4: Wait for the New Request form page to open
    await targetPage.waitForSelector('text=Basic Details', { timeout: envConfig.waitTimeout });
    console.log('New Request form page is visible');

    // Debug: Log page content to understand dropdown structure
    console.log('==== DEBUG: Page content before filling details ====');
    const pageContent = await targetPage.evaluate(() => {
      const labels = Array.from(document.querySelectorAll('label')).map(l => l.textContent);
      const inputs = Array.from(document.querySelectorAll('input')).map(i => ({
        type: i.type,
        role: i.getAttribute('role'),
        placeholder: i.placeholder,
        className: i.className,
        visible: i.offsetParent !== null
      }));
      return { labels, inputs };
    });
    console.log('Page structure:', JSON.stringify(pageContent, null, 2));

    // Step 5: Choose Platform2 for Platform Name and Project C for Project Name
    await scrap.fillBasicDetails('Platform2', 'Project C');
    console.log('Filled Platform Name and Project Name');

    // Step 6: Wait for the Scrap Details section to be present before continuing
    await targetPage.waitForSelector('text=Scrap Details', { timeout: envConfig.waitTimeout });

    // Step 7: Click + to append a new scrap detail row
    await scrap.addScrapRowAndFill('1', '22');

    // Step 8: Confirm the new row is appended by checking the entered values
    await targetPage.waitForSelector('xpath=//table//tr[.//input][1]//td//input[@value="1"]', { timeout: envConfig.waitTimeout });
    await targetPage.waitForSelector('xpath=//table//tr[.//input][1]//td//input[@value="22"]', { timeout: envConfig.waitTimeout });
  });
});
