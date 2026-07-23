# Enterprise Playwright Framework

## Overview

This TypeScript Playwright framework uses Page Object Model (POM), fixtures, reusable utilities, environment support, cross-browser execution, parallel test execution, HTML reporting, and failure artifacts.

## Architecture and Folder Structure

- `tests/` - End-to-end and UI test cases.
- `pages/` - Page object classes containing actions.
- `locators/` - Selector definitions separated from page actions.
- `fixtures/` - Custom Playwright fixtures and test extensions.
- `utils/` - General helper utilities (waits, date handling, file helpers).
- `helpers/` - Supporting helpers like logging.
- `config/` - Environment configuration and runtime environment mapping.
- `constants/` - Shared constants.
- `reports/` - HTML reports and logs.
- `screenshots/` - Failure screenshots.
- `videos/` - Failure videos.
- `playwright.config.ts` - Playwright test runner configuration.
- `.env` - Environment variables.

## Install

```bash
npm install
```

## Run Tests

- `npm test` - Execute tests against default env.
- `npm run test:qa` - Run tests in QA environment.
- `npm run test:uat` - Run tests in UAT environment.
- `npm run test:prod` - Run tests in PROD environment.
- `npm run test:report` - Open the generated HTML report.

## Best Practices

- Use POM for page-level actions and separate locators.
- Keep test cases readable and data-driven.
- Use fixtures for environment and logging.
- Store environment-specific values in `.env` and `config/environments.ts`.
- Configure retries and failure artifacts in `playwright.config.ts`.

## Extending the Framework

- Add new page object classes in `pages/`.
- Add locators to `locators/`.
- Add helper utilities to `helpers/` and `utils/`.
- Add more environments in `config/environments.ts`.
- Use `test.describe`, `test.beforeEach`, and custom fixtures for shared setup.
