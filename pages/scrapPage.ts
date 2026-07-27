import { Page } from '@playwright/test';
import { BasePage } from './basePage';
import { scrapPageLocators } from '../locators/scrapPage.locators';
import { AppConstants } from '../constants/appConstants';

export class ScrapPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async openNewRequest(): Promise<void> {
    // Debug counts
    const textCountLocator = this.page.locator('text=/New Request/i');
    const textCount = await textCountLocator.count().catch(() => 0);
    const roleLocator = this.page.getByRole('button', { name: /New Request/i });
    const roleCount = await roleLocator.count().catch(() => 0);
    const locator = this.page.locator(scrapPageLocators.newRequestTile);
    const locatorCount = await locator.count().catch(() => 0);
    console.log(`openNewRequest: counts text=${textCount}, role=${roleCount}, locator=${locatorCount}`);

    // Log matching elements for debugging
    if (textCount > 0) {
      const textHandles = await textCountLocator.elementHandles();
      for (let i = 0; i < textHandles.length; i += 1) {
        const details = await textHandles[i].evaluate((el) => ({
          tagName: el.tagName,
          role: el.getAttribute('role'),
          text: el.textContent?.trim(),
          outerHTML: el.outerHTML.slice(0, 300)
        }));
        console.log(`openNewRequest: textMatch[${i}]`, details);
      }
    }

    if (roleCount > 0) {
      const roleHandles = await roleLocator.elementHandles();
      for (let i = 0; i < roleHandles.length; i += 1) {
        const details = await roleHandles[i].evaluate((el) => ({
          tagName: el.tagName,
          role: el.getAttribute('role'),
          text: el.textContent?.trim(),
          outerHTML: el.outerHTML.slice(0, 300)
        }));
        console.log(`openNewRequest: roleMatch[${i}]`, details);
      }
    }

    if (locatorCount > 0) {
      const handles = await locator.elementHandles();
      for (let i = 0; i < handles.length; i += 1) {
        const details = await handles[i].evaluate((el) => ({
          tagName: el.tagName,
          role: el.getAttribute('role'),
          text: el.textContent?.trim(),
          outerHTML: el.outerHTML.slice(0, 300)
        }));
        console.log(`openNewRequest: locatorMatch[${i}]`, details);
      }
    }

    const roleButton = this.page.getByRole('button', { name: /New Request/i }).first();
    try {
      if (await roleButton.isVisible({ timeout: 2000 })) {
        console.log('openNewRequest: clicking role-based button');
        await roleButton.click({ force: true });
        return;
      }
    } catch (err) {
      console.log('openNewRequest: role button not visible or failed', err);
    }

    const newRequest = locator.first();
    if (await newRequest.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('openNewRequest: clicking locator-based element');
      await newRequest.click({ force: true });
      return;
    }

    // try frames
    for (const frame of this.page.frames()) {
      const frameNewRequest = frame.locator(scrapPageLocators.newRequestTile).first();
      if (await frameNewRequest.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('openNewRequest: clicking frame locator');
        await frameNewRequest.click({ force: true });
        return;
      }
      const fRole = frame.getByRole('button', { name: /New Request/i }).first();
      if (await fRole.isVisible({ timeout: 1000 }).catch(() => false)) {
        console.log('openNewRequest: clicking frame role button');
        await fRole.click({ force: true });
        return;
      }
    }

    // Fallback: find element by text and click the nearest clickable ancestor
    const textLocator = this.page.getByText('New Request', { exact: false }).first();
    if (await textLocator.isVisible({ timeout: 1000 }).catch(() => false)) {
      console.log('openNewRequest: clicking fallback text locator');
      const handle = await textLocator.elementHandle();
      if (handle) {
        await this.page.evaluate((el) => {
          let node: any = el;
          while (node && node.nodeType === 1) {
            const role = node.getAttribute && node.getAttribute('role');
            const tag = node.tagName && node.tagName.toLowerCase();
            if (tag === 'button' || role === 'button' || node.onclick) {
              node.click();
              return true;
            }
            node = node.parentElement;
          }
          el.click();
          return true;
        }, handle);
        return;
      }
    }

    throw new Error('New Request tile not found in page or frames');
  }

  async selectScrapType(type: string): Promise<void> {
    const normalizedType = type.trim();
    const clickAndProceed = async (context: any, selection: import('@playwright/test').Locator) => {
      await selection.waitFor({ state: 'visible', timeout: AppConstants.defaultTimeout });
      await selection.click({ force: true });
      const nextButton = context.locator(scrapPageLocators.requestTypeNextButton).first();
      await nextButton.waitFor({ state: 'visible', timeout: AppConstants.defaultTimeout });
      await nextButton.click({ force: true });
    };

    const findInContext = async (context: any): Promise<boolean> => {
      const modal = context.locator(scrapPageLocators.requestTypeModal).first();
      if (!(await modal.isVisible({ timeout: 3000 }).catch(() => false))) {
        return false;
      }

      const normalizedValue = normalizedType.replace(/\s+/g, '_');
      const candidates = [
        modal.locator(scrapPageLocators.scrapTypeRadio(normalizedType)).first(),
        modal.locator(`xpath=//input[@type='radio' and (contains(@value,'${normalizedValue}') or contains(@id,'${normalizedValue}'))]`).first(),
        modal.locator(`xpath=//label[normalize-space(.)='${normalizedType}']`).first(),
        modal.locator(`label:has-text("${normalizedType}")`).first(),
        modal.locator(scrapPageLocators.scrapTypeOption(normalizedType)).first(),
      ];

      for (const candidate of candidates) {
        if (await candidate.isVisible({ timeout: 1000 }).catch(() => false)) {
          await clickAndProceed(context, candidate);
          return true;
        }
      }

      return false;
    };

    if (await findInContext(this.page)) return;

    for (const frame of this.page.frames()) {
      if (await findInContext(frame)) return;
    }

    const pageLabel = this.page.getByLabel(normalizedType).first();
    if (await pageLabel.isVisible({ timeout: 3000 }).catch(() => false)) {
      await clickAndProceed(this.page, pageLabel);
      return;
    }

    const pageFallback = this.page.locator(`label:has-text("${normalizedType}")`).first();
    if (await pageFallback.isVisible({ timeout: 3000 }).catch(() => false)) {
      await clickAndProceed(this.page, pageFallback);
      return;
    }

    throw new Error(`Request type modal option '${type}' not found in page or frames`);
  }

  private async fillSelectField(label: string, placeholder: string, value: string): Promise<void> {
    const candidateLocators = [
      this.page.locator(`xpath=//label[contains(normalize-space(.), '${label}')]/following::input[@role='combobox'][1]`).first(),
      this.page.locator(`xpath=//label[contains(normalize-space(.), '${label}')]/following::input[contains(@class,'widget-combobox-input')][1]`).first(),
      this.page.locator(`xpath=//input[contains(@class,'widget-combobox-input') and (@role='combobox' or @aria-autocomplete)]`).first(),
      this.page.locator(`xpath=//div[contains(normalize-space(.), '${placeholder}')]/preceding::input[@role='combobox'][1]`).first(),
    ];

    let field: any = null;
    for (const locator of candidateLocators) {
      if (await locator.isVisible({ timeout: 1000 }).catch(() => false)) {
        field = locator;
        break;
      }
    }

    if (!field) {
      field = candidateLocators[0];
    }

    await field.scrollIntoViewIfNeeded();
    await field.click({ force: true });
    await this.page.waitForTimeout(500);

    // Wait for dropdown to open - look for various dropdown containers
    const dropdownLocators = [
      this.page.locator("xpath=//ul[@role='listbox' or contains(@class,'downshift')] | //div[@role='listbox'] | //div[contains(@class,'dropdown-menu')]").first(),
      this.page.locator("xpath=//div[contains(@class,'dropdown') or contains(@class,'menu') or contains(@class,'popup')]//div | //div[contains(@class,'options')]").first(),
    ];

    let dropdownFound = false;
    for (const dropdown of dropdownLocators) {
      if (await dropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
        dropdownFound = true;
        console.log(`Found dropdown for ${label}`);

        // Try multiple XPath variants to find the option
        const optionVariants = [
          `xpath=.//li[normalize-space(.)='${value}']`,
          `xpath=.//div[normalize-space(.)='${value}']`,
          `xpath=.//span[normalize-space(.)='${value}']`,
          `xpath=.//li[contains(., '${value}')]`,
          `xpath=.//div[contains(., '${value}')]`,
        ];

        for (const optionXpath of optionVariants) {
          const optionLocator = dropdown.locator(optionXpath).first();
          if (await optionLocator.isVisible({ timeout: 1000 }).catch(() => false)) {
            console.log(`Found option: ${value} using xpath: ${optionXpath}`);
            await optionLocator.click({ force: true });
            await this.page.waitForTimeout(300);
            return;
          }
        }
      }
    }

    // Fallback: if dropdown not found or option not selected, try typing and arrow keys
    if (!dropdownFound) {
      console.log(`Dropdown not found for ${label}, trying keyboard navigation`);
      await field.clear();
      await field.fill(value);
      await this.page.waitForTimeout(300);
    }

    // Try arrow down and enter to select
    await field.press('ArrowDown');
    await this.page.waitForTimeout(200);
    await field.press('Enter');
    await this.page.waitForTimeout(300);
  }

  async fillBasicDetails(platform: string, project: string): Promise<void> {
    console.log(`Starting fillBasicDetails: platform=${platform}, project=${project}`);
    
    // Add a small delay to ensure the form is fully rendered
    await this.page.waitForTimeout(500);
    
    await this.fillSelectField('Platform Name', 'select platform', platform);
    console.log(`Platform Name filled with: ${platform}`);
    
    await this.page.waitForTimeout(500);
    
    await this.fillSelectField('Project Name', 'select project', project);
    console.log(`Project Name filled with: ${project}`);  
  }

  async addScrapRowAndFill(trNo: string, desc: string, reason?: string): Promise<void> {
    console.log("click add button to append a new scrap detail row");
    
    // Wait for add button to be available
    const addButton = this.page.locator(scrapPageLocators.scrapDetailsAddButton).first();
    await addButton.waitFor({ state: 'visible', timeout: AppConstants.defaultTimeout }).catch(() => {
      throw new Error('Unable to find Scrap Details add-row button');
    });
    
    await addButton.scrollIntoViewIfNeeded();
    console.log("Clicking add button");
    await addButton.click({ force: true });
    
    // Wait for a new row to appear in the table
    await this.page.waitForTimeout(1000);
    
    // STRATEGY 1: Find inputs by role (textbox) - most reliable Playwright approach
    console.log("Attempting STRATEGY 1: Finding inputs by role='textbox'");
    let firstInput = this.page.getByRole('textbox').nth(0);
    let secondInput = this.page.getByRole('textbox').nth(1);
    
    try {
      const firstVisible = await firstInput.isVisible({ timeout: 2000 }).catch(() => false);
      if (firstVisible) {
        console.log("SUCCESS: Found inputs using role='textbox'");
        await this.fillTableInputs(firstInput, secondInput, trNo, desc);
        await this.fillReasonIfNeeded(reason);
        return;
      }
    } catch (err) {
      console.log("STRATEGY 1 failed:", err);
    }
    
    // STRATEGY 2: Find all visible inputs in the table and use the first two
    console.log("Attempting STRATEGY 2: Finding all visible inputs in table");
    try {
      const allInputs = await this.page.locator("//table//input").all();
      console.log(`Found ${allInputs.length} total inputs in table`);
      
      if (allInputs.length >= 2) {
        // Find the first two visible inputs
        for (let i = 0; i < allInputs.length - 1; i++) {
          const isVisible1 = await allInputs[i].isVisible({ timeout: 1000 }).catch(() => false);
          const isVisible2 = await allInputs[i + 1].isVisible({ timeout: 1000 }).catch(() => false);
          
          if (isVisible1 && isVisible2) {
            console.log(`SUCCESS: Found visible inputs at indices ${i} and ${i + 1}`);
            firstInput = this.page.locator("//table//input").nth(i);
            secondInput = this.page.locator("//table//input").nth(i + 1);
            await this.fillTableInputs(firstInput, secondInput, trNo, desc);
            await this.fillReasonIfNeeded(reason);
            return;
          }
        }
      }
    } catch (err) {
      console.log("STRATEGY 2 failed:", err);
    }
    
    // STRATEGY 3: Look for specific column headers and find inputs under them
    console.log("Attempting STRATEGY 3: Finding inputs by column headers");
    try {
      const tractorHeader = this.page.getByText('Tractor No', { exact: false }).first();
      const descHeader = this.page.getByText('Description', { exact: false }).first();
      
      if (await tractorHeader.isVisible({ timeout: 1000 }).catch(() => false)) {
        console.log("Found Tractor No header, looking for input below");
        const tractorInput = tractorHeader.locator('xpath=following::input[1]').first();
        const descInput = descHeader.locator('xpath=following::input[1]').first();
        
        if (await tractorInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          console.log("SUCCESS: Found inputs under column headers");
          await this.fillTableInputs(tractorInput, descInput, trNo, desc);
          await this.fillReasonIfNeeded(reason);
          return;
        }
      }
    } catch (err) {
      console.log("STRATEGY 3 failed:", err);
    }
    
    // STRATEGY 4: Use data-testid or look for recently added row (last row in table)
    console.log("Attempting STRATEGY 4: Finding last row in table");
    try {
      const lastRow = this.page.locator("//table//tbody//tr").last();
      const lastRowInputs = lastRow.locator("input");
      const lastRowInputCount = await lastRowInputs.count();
      console.log(`Last row has ${lastRowInputCount} inputs`);
      
      if (lastRowInputCount >= 2) {
        firstInput = lastRowInputs.nth(0);
        secondInput = lastRowInputs.nth(1);
        
        if (await firstInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          console.log("SUCCESS: Found inputs in last row");
          await this.fillTableInputs(firstInput, secondInput, trNo, desc);
          await this.fillReasonIfNeeded(reason);
          return;
        }
      }
    } catch (err) {
      console.log("STRATEGY 4 failed:", err);
    }
    
    // STRATEGY 5: Use evaluate to find inputs directly via DOM
    console.log("Attempting STRATEGY 5: Using evaluate to find inputs via DOM");
    try {
      const inputs = await this.page.evaluate(() => {
        const tableInputs = Array.from(document.querySelectorAll('table input:not([type="hidden"])'));
        return tableInputs.slice(-2).map((inp: any) => ({
          value: inp.value,
          visible: inp.offsetParent !== null,
          placeholder: inp.placeholder
        }));
      });
      console.log("Found inputs via DOM:", inputs);
      
      if (inputs.length >= 2) {
        // Get the last two inputs (most likely the new row)
        firstInput = this.page.locator("table input:not([type='hidden'])").nth(-2);
        secondInput = this.page.locator("table input:not([type='hidden'])").nth(-1);
        
        console.log("SUCCESS: Found inputs via DOM evaluate");
        await this.fillTableInputs(firstInput, secondInput, trNo, desc);
        await this.fillReasonIfNeeded(reason);
        return;
      }
    } catch (err) {
      console.log("STRATEGY 5 failed:", err);
    }

    throw new Error('Unable to find row input fields after trying 5 different strategies');
  }

  private async fillTableInputs(firstInput: import('@playwright/test').Locator, secondInput: import('@playwright/test').Locator, trNo: string, desc: string): Promise<void> {
    // Wait for inputs to be visible and enabled
    await firstInput.waitFor({ state: 'visible', timeout: AppConstants.defaultTimeout });
    await secondInput.waitFor({ state: 'visible', timeout: AppConstants.defaultTimeout });
    
    console.log(`Filling Tractor No with: ${trNo}`);
    await firstInput.click({ force: true });
    await firstInput.clear();
    await firstInput.fill(trNo);
    await this.page.waitForTimeout(300);
    
    console.log(`Filling Description with: ${desc}`);
    await secondInput.click({ force: true });
    await secondInput.clear();
    await secondInput.fill(desc);
    await this.page.waitForTimeout(300);
  }

  private async fillReasonIfNeeded(reason: string | undefined): Promise<void> {
    if (reason) {
      console.log(`Filling Reason with: ${reason}`);
      const reasonLocator = this.page.locator(scrapPageLocators.reasonForScrap).first();
      if (await reasonLocator.isVisible({ timeout: 2000 }).catch(() => false)) {
        await reasonLocator.click();
        await reasonLocator.clear();
        await reasonLocator.fill(reason);
      }
    }
  }

  async submitRequest(): Promise<void> {
    await this.page.locator(scrapPageLocators.submitButton).click();
    await this.page.locator(scrapPageLocators.confirmProceedButton).click();
    // wait for info dialog
    await this.page.locator(scrapPageLocators.infoOkButton).waitFor({ state: 'visible', timeout: AppConstants.defaultTimeout });
    await this.page.locator(scrapPageLocators.infoOkButton).click();
  }
}
