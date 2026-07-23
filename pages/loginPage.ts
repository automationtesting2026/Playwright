import { Page } from '@playwright/test';
import { BasePage } from './basePage';
import { loginPageLocators } from '../locators/loginPage.locators';
import { AppConstants } from '../constants/appConstants';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigateToApplication(appUrl: string): Promise<void> {
    await this.navigate(appUrl);
  }

  async enterEmail(email: string): Promise<void> {
    await this.fill(loginPageLocators.emailInput, email);
  }

  async enterPassword(password: string): Promise<void> {
    await this.fill(loginPageLocators.passwordInput, password);
  }

  async clickLogin(): Promise<void> {
    await this.click(loginPageLocators.loginButton);
  }

  async login(email: string, password: string): Promise<void> {
    await this.enterEmail(email);
    await this.enterPassword(password);
    // Click and wait for navigation to ensure we land on the home page
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'load', timeout: AppConstants.defaultTimeout }),
      this.page.locator(loginPageLocators.loginButton).click()
    ]);
  }

  async getLoginErrorText(): Promise<string> {
    return await this.getText(loginPageLocators.errorMessage);
  }

  async isHomePageVisible(): Promise<boolean> {
    // Prefer explicit home page validation locator when available
    if (loginPageLocators.homePageValidation && !loginPageLocators.homePageValidation.includes('YOUR_HOME_PAGE_VALIDATION_XPATH')) {
      return await this.isVisible(loginPageLocators.homePageValidation);
    }

    // Fallback: consider navigation away from the login page as a successful login
    const currentUrl = await this.getPageUrl();
    return !currentUrl.toLowerCase().includes('login') && !currentUrl.toLowerCase().includes('signin');
  }
}
