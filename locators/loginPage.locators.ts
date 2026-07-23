export const loginPageLocators = {
  // Prefer explicit attributes: type=email, name/id containing user, or placeholder containing "email"
  emailInput:
    "xpath=//input[@type='email'] | //input[contains(translate(@placeholder, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'email')] | //input[contains(translate(@placeholder, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'user')] | //input[contains(translate(@placeholder, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'username')] | //input[contains(translate(@name, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'user')] | //input[contains(translate(@id, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'user') ]",
  // Use password input by type
  passwordInput: "xpath=//input[@type='password'] | //input[contains(translate(@placeholder, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'password')]",
  loginButton: "xpath=//button[normalize-space()='Sign In']",
  homePageValidation: 'xpath=YOUR_HOME_PAGE_VALIDATION_XPATH',
  // Tile on the home page for the SWIFT application
  swiftTile: "xpath=//div[.//text()[normalize-space()='SWIFT']] | //div[contains(., 'SWIFT')]",
  // Tile for VOB inside SWIFT app
  vobTile: "xpath=//div[.//text()[normalize-space()='VOB']] | //div[contains(., 'VOB')]",
  // Case-insensitive VOB landing page header (e.g. 'VOB HOME')
  vobLandingHeader: "xpath=//*[contains(translate(normalize-space(.), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'vob home')]",
  errorMessage: 'xpath=YOUR_LOGIN_ERROR_MESSAGE_XPATH'
};
