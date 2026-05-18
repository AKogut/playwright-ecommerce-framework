# Playwright Ecommerce Framework

[![Smoke Run](https://github.com/AKogut/playwright-ecommerce-framework/actions/workflows/pr-review-smoke.yml/badge.svg?branch=main)](https://github.com/AKogut/playwright-ecommerce-framework/actions/workflows/pr-review-smoke.yml)
[![Code Quality Checks](https://github.com/AKogut/playwright-ecommerce-framework/actions/workflows/code-quality.yml/badge.svg?branch=main)](https://github.com/AKogut/playwright-ecommerce-framework/actions/workflows/code-quality.yml)
[![Regression Run](https://github.com/AKogut/playwright-ecommerce-framework/actions/workflows/nightly-regression.yml/badge.svg?branch=main)](https://github.com/AKogut/playwright-ecommerce-framework/actions/workflows/nightly-regression.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Production-style Playwright + TypeScript E2E framework for [SauceDemo](https://www.saucedemo.com/), focused on maintainability, fast feedback, and CI-ready reporting.

## Portfolio highlights

- **Problem:** E-commerce E2E suites become hard to maintain when selectors, test data, and reporting logic live inside individual specs.
- **Solution:** A layered Playwright + TypeScript framework with Page Objects, merged fixtures, tagged suites, and CI workflows that merge Allure results across browsers.
- **Result:** Faster PR feedback (parallel critical, smoke, and API jobs), reproducible triage artifacts, and a published Allure dashboard after every merge to `main`.

[![Playwright](https://img.shields.io/badge/Playwright-45ba4b?logo=playwright&logoColor=white)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Allure Report](https://img.shields.io/badge/Allure_Report-FF6B35?logo=allure&logoColor=white)](https://allurereport.org/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?logo=githubactions&logoColor=white)](https://github.com/features/actions)

| Suite                      | Scenarios |
| -------------------------- | --------: |
| Smoke (`@smoke`)           |         6 |
| Regression (`@regression`) |        12 |
| API (`tests/api`)          |         5 |
| **Total**                  |    **23** |

## What this framework gives you

- Stable Page Object Model with selector abstraction
- Typed fixtures for pages, data, auth, and network mocking
- Clear suite boundaries (`smoke`, `regression`, `critical`, `api`, `untagged`)
- Health-checked global setup and metadata-driven global teardown
- Built-in HTML, JUnit, JSON, and Allure reporting
- CI pipelines for PR critical/smoke checks, quality gates, and nightly regression

## Documentation

- [CI pipeline diagram](docs/ci-pipeline.md)
- [Architecture diagram and runtime flow](docs/architecture.md)
- [Setup guide](docs/setup-guide.md)
- [Folder structure reference](docs/folder-structure.md)
- [Tag strategy](docs/tag-strategy.md)
- [Contribution guide](CONTRIBUTING.md)
- [Demo screenshots](docs/demo-screenshots.md)
- [UI audit for SauceDemo](docs/ui-audit-saucedemo.md)

## Quick start

Prerequisites:

- Node.js 24+ (project pin in `.nvmrc`)
- npm 11+ (installed with Node 24)

```bash
cp .env.example .env
npm ci
npx playwright install
npm run test:smoke
```

## Demo screenshots

![Login page](docs/assets/demo-login-page.png)
![Products page](docs/assets/demo-products-page.png)
![Checkout complete page](docs/assets/demo-checkout-complete.png)

## Useful commands

```bash
# all tests
npm test

# suites
npm run test:smoke
npm run test:regression
npm run test:critical
npm run test:api
npm run test:untagged

# browser-specific projects
npm run test:smoke:chromium
npm run test:smoke:firefox
npm run test:smoke:webkit
npm run test:regression:chromium
npm run test:regression:firefox
npm run test:regression:webkit
npm run test:critical:chromium
npm run test:critical:firefox
npm run test:critical:webkit

# static checks
npm run typecheck
npm run lint
npm run format
```

## Reports

**Live Allure report (latest `main` run):** [https://akogut.github.io/playwright-ecommerce-framework/](https://akogut.github.io/playwright-ecommerce-framework/)

If Pages is unavailable or you need a specific workflow run, open the [Smoke Run](https://github.com/AKogut/playwright-ecommerce-framework/actions/workflows/pr-review-smoke.yml) workflow, select the run, and download the **`allure-report-bundle`** artifact (merged HTML). Extract and open `index.html` locally.

```bash
npm run report
npm run report:allure
```

During GitHub Actions runs:

- Playwright HTML report artifacts are uploaded as `playwright-report-<job>-<browser>`.
- Raw Allure results are uploaded as `allure-results-<job>-<browser>`.
- A merged Allure HTML artifact is produced as `allure-report-bundle`.
- On failing jobs, `test-results-<job>-<browser>` includes screenshots, videos, traces.

After merge to `main`, the Smoke Run workflow deploys the merged report to GitHub Pages (`deploy-allure-pages`). See [CI pipeline diagram](docs/ci-pipeline.md) for the full flow.

## Environment variables

Defined in `.env.example`:

- `BASE_URL`
- `STANDARD_USER_USERNAME`, `STANDARD_USER_PASSWORD`
- `LOCKED_USER_USERNAME`, `LOCKED_USER_PASSWORD`
- `PROBLEM_USER_USERNAME`, `PROBLEM_USER_PASSWORD`
- `PERFORMANCE_USER_USERNAME`, `PERFORMANCE_USER_PASSWORD`
- `SKIP_BASE_URL_HEALTHCHECK`
- `BASE_URL_HEALTHCHECK_RETRIES`
- `BASE_URL_HEALTHCHECK_BACKOFF_MS`
- `GLOBAL_TIMEOUT_MS`
- `TEST_TIMEOUT_MS`
- `EXPECT_TIMEOUT_MS`

## License

This project is licensed under the [MIT License](LICENSE).
