export const scrapPageLocators = {
  // Home tiles - case insensitive escrap/escrap tile selector with multiple fallbacks
  escrapTile: "xpath=//div[@role='button'][contains(translate(normalize-space(.), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'escrap')] | //button[contains(translate(normalize-space(.), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'escrap')] | //a[contains(translate(normalize-space(.), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'escrap')] | //*[contains(translate(normalize-space(.), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'escrap') and (self::button or self::div or self::span or self::a or @role='button')]",
  newRequestTile: "xpath=//button[normalize-space(.)='New Request'] | //button[.//text()[normalize-space(.)='New Request']] | //a[normalize-space(.)='New Request'] | //span[normalize-space(.)='New Request'] | //div[.//text()[normalize-space(.)='New Request']]",

  // Request Type modal
  requestTypeModal: "xpath=//div[contains(translate(normalize-space(.), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'request type')]",
  scrapTypeRadio: (label: string) => {
    const normalized = label.replace(/\s+/g, '_');
    return `xpath=//input[@type='radio' and (contains(@value, '${normalized}') or contains(@id, '${normalized}'))] | //label[contains(normalize-space(.), '${label}')]/input[@type='radio']`;
  },
  scrapTypeOption: (label: string) => `xpath=//label[contains(normalize-space(.), '${label}')] | //div[contains(normalize-space(.), '${label}')] | //span[contains(normalize-space(.), '${label}')]`,
  requestTypeNextButton: "xpath=//button[.//text()[normalize-space()='Next']] | //button[contains(., 'Next')] | //button[contains(normalize-space(.), 'Next')] | //button[@title='Next']",

  // New Request page fields (best-effort selectors)
  platformNameLabel: "xpath=//label[contains(., 'Platform Name')]/following-sibling::*//input | //label[contains(., 'Platform Name')]/..//input",
  projectNameLabel: "xpath=//label[contains(., 'Project Name')]/following-sibling::*//input | //label[contains(., 'Project Name')]/..//input",

  // Scrap details table add button - look for buttons with + icon or action button classes
    scrapDetailsAddButton: "xpath=//button[@type='button']//span[@class='mx-icon-lined mx-icon-add']",
    // "xpath=//button[contains(@class,'add') or contains(@class,'actionButton') or .//span[contains(@class,'add')] or .//span[contains(., '+')] or contains(normalize-space(.), '+')]",

  // Reason for scrap textarea
  reasonForScrap: "xpath=//label[contains(., 'Reason For Scrap')]/following-sibling::textarea | //textarea[contains(@placeholder,'Reason')]",

  // Submit flow
  submitButton: "xpath=//button[.//text()[normalize-space()='Submit']] | //button[contains(., 'Submit')]",
  confirmProceedButton: "xpath=//button[.//text()[normalize-space()='Proceed']] | //button[contains(., 'Proceed')]",
  infoOkButton: "xpath=//button[.//text()[normalize-space()='OK']] | //button[contains(., 'OK') or contains(., 'Ok')]",
};
