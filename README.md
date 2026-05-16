# Playwright Ecommerce Framework

[![Smoke Run](https://github.com/AKogut/playwright-ecommerce-framework/actions/workflows/pr-review-smoke.yml/badge.svg?branch=main)](https://github.com/AKogut/playwright-ecommerce-framework/actions/workflows/pr-review-smoke.yml)
[![Code Quality Checks](https://github.com/AKogut/playwright-ecommerce-framework/actions/workflows/code-quality.yml/badge.svg?branch=main)](https://github.com/AKogut/playwright-ecommerce-framework/actions/workflows/code-quality.yml)
[![Regression Run](https://github.com/AKogut/playwright-ecommerce-framework/actions/workflows/nightly-regression.yml/badge.svg?branch=main)](https://github.com/AKogut/playwright-ecommerce-framework/actions/workflows/nightly-regression.yml)

Production-style Playwright + TypeScript E2E framework for [SauceDemo](https://www.saucedemo.com/), focused on maintainability, fast feedback, and CI-ready reporting.

## What this framework gives you

- Stable Page Object Model with selector abstraction
- Typed fixtures for pages, data, auth, and network mocking
- Clear suite boundaries (`smoke`, `regression`, `api`, `untagged`)
- Health-checked global setup and metadata-driven global teardown
- Built-in HTML, JUnit, JSON, and Allure reporting
- CI pipelines for PR smoke checks, quality gates, and nightly regression

## Documentation

- [Architecture diagram and runtime flow](docs/architecture.md)
- [Setup guide](docs/setup-guide.md)
- [Folder structure reference](docs/folder-structure.md)
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

## Useful commands

```bash
# all tests
npm test

# suites
npm run test:smoke
npm run test:regression
npm run test:api
npm run test:untagged

# browser-specific projects
npm run test:smoke:chromium
npm run test:smoke:firefox
npm run test:smoke:webkit
npm run test:regression:chromium
npm run test:regression:firefox
npm run test:regression:webkit

# static checks
npm run typecheck
npm run lint
npm run format
```

## Reports

```bash
npm run report
npm run report:allure
```

During GitHub Actions runs:

- Playwright HTML report artifacts are uploaded as `playwright-report-<job>-<browser>`.
- Raw Allure results are uploaded as `allure-results-<job>-<browser>`.
- A merged Allure HTML artifact is produced as `allure-report-bundle`.
- On failing jobs, `test-results-<job>-<browser>` includes screenshots, videos, traces.

The smoke workflow also deploys merged Allure output to GitHub Pages after merge to `main` (job `deploy-allure-pages`).

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
