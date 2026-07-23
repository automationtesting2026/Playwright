import { Page } from '@playwright/test';
import { BasePage } from './basePage';
import { scrapPageLocators } from '../locators/scrapPage.locators';
import { AppConstants } from '../constants/appConstants';

export class ScrapPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async openNewRequest(): Promise<void> {
    await this.page.getByText('New Request', { exact: true }).first().waitFor({ state: 'visible', timeout: AppConstants.defaultTimeout });
    await this.page.getByText('New Request', { exact: true }).first().click();
  }

  async selectScrapType(type: string): Promise<void> {
    // Wait for modal and select radio
    const radio = this.page.locator(scrapPageLocators.scrapTypeRadio(type));
    await radio.waitFor({ state: 'visible', timeout: AppConstants.defaultTimeout });
    await radio.click();
    await this.page.locator(scrapPageLocators.requestTypeNextButton).click();
  }

  async fillBasicDetails(platform: string, project: string): Promise<void> {
    const platformInput = this.page.locator(scrapPageLocators.platformNameLabel);
    await platformInput.fill(platform);
    const projectInput = this.page.locator(scrapPageLocators.projectNameLabel);
    await projectInput.fill(project);
  }

  async addScrapRowAndFill(trNo: string, desc: string, reason: string): Promise<void> {
    try {
      await this.page.locator(scrapPageLocators.scrapDetailsAddButton).click();
    } catch {
      // ignore if not present
    }
    // Fill first row cells - best-effort
    await this.page.locator("xpath=//table//tr[.//input][1]//td//input").first().fill(trNo);
    await this.page.locator("xpath=//table//tr[.//input][1]//td//input").nth(1).fill(desc);
    await this.page.locator(scrapPageLocators.reasonForScrap).fill(reason);
  }

  async submitRequest(): Promise<void> {
    await this.page.locator(scrapPageLocators.submitButton).click();
    await this.page.locator(scrapPageLocators.confirmProceedButton).click();
    // wait for info dialog
    await this.page.locator(scrapPageLocators.infoOkButton).waitFor({ state: 'visible', timeout: AppConstants.defaultTimeout });
    await this.page.locator(scrapPageLocators.infoOkButton).click();
  }
}
