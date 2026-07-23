export const scrapPageLocators = {
  // Home tiles
  newRequestTile: "xpath=//div[.//text()[normalize-space()='New Request']] | //div[contains(., 'New Request')]",

  // Request Type modal
  requestTypeModal: "xpath=//div[.//text()[contains(normalize-space(.), 'Request Type')]]",
  scrapTypeRadio: (label: string) => `xpath=//label[.//text()[contains(normalize-space(.), '${label}')]]//input[@type='radio']`,
  requestTypeNextButton: "xpath=//button[.//text()[normalize-space()='Next']] | //button[contains(., 'Next')]",

  // New Request page fields (best-effort selectors)
  platformNameLabel: "xpath=//label[contains(., 'Platform Name')]/following-sibling::*//input | //label[contains(., 'Platform Name')]/..//input",
  projectNameLabel: "xpath=//label[contains(., 'Project Name')]/following-sibling::*//input | //label[contains(., 'Project Name')]/..//input",

  // Scrap details table add button
  scrapDetailsAddButton: "xpath=//button[contains(@class,'add') or contains(., '+') or contains(., 'Add') ]",

  // Reason for scrap textarea
  reasonForScrap: "xpath=//label[contains(., 'Reason For Scrap')]/following-sibling::textarea | //textarea[contains(@placeholder,'Reason')]",

  // Submit flow
  submitButton: "xpath=//button[.//text()[normalize-space()='Submit']] | //button[contains(., 'Submit')]",
  confirmProceedButton: "xpath=//button[.//text()[normalize-space()='Proceed']] | //button[contains(., 'Proceed')]",
  infoOkButton: "xpath=//button[.//text()[normalize-space()='OK']] | //button[contains(., 'OK') or contains(., 'Ok')]",
};
