# Playwright Ecommerce Framework

[![Smoke Run](https://github.com/AKogut/playwright-ecommerce-framework/actions/workflows/pr-review-smoke.yml/badge.svg?branch=main)](https://github.com/AKogut/playwright-ecommerce-framework/actions/workflows/pr-review-smoke.yml)
[![Code Quality Checks](https://github.com/AKogut/playwright-ecommerce-framework/actions/workflows/code-quality.yml/badge.svg?branch=main)](https://github.com/AKogut/playwright-ecommerce-framework/actions/workflows/code-quality.yml)
[![Regression Run](https://github.com/AKogut/playwright-ecommerce-framework/actions/workflows/nightly-regression.yml/badge.svg?branch=main)](https://github.com/AKogut/playwright-ecommerce-framework/actions/workflows/nightly-regression.yml)

Production-style Playwright + TypeScript E2E framework for SauceDemo:
[https://www.saucedemo.com/](https://www.saucedemo.com/).

## Project highlights

- Page Object Model with reusable base actions
- Typed fixtures for pages and test data
- Auth fixture invoked directly in each authorized test
- One test per spec file for cleaner ownership and reviewability
- Smoke and regression suites with tag-based projects
- Global setup/teardown lifecycle for run validation and logging
- Rich artifacts on failure: screenshot, video, trace
- HTML and JUnit reporting for local and CI workflows

## Architecture

```text
src/
  config/
    environment.ts
    global-setup.ts
    global-teardown.ts
  data/
    users.ts
    products.ts
    checkout.data.ts
  fixtures/
    ui.fixture.ts
    ui/
      pages.fixture.ts
      data.fixture.ts
      auth.fixture.ts
      network.fixture.ts
  page-objects/
    base.page.ts
    login.page.ts
    products.page.ts
    cart.page.ts
    checkout.page.ts
  utils/
    product-name.util.ts
tests/
  api/
    fixtures/
      *.har
    *.spec.ts (network mock/HAR examples)
  smoke/
    *.spec.ts (one test per file)
  regression/
    *.spec.ts (one test per file)
docs/
  ui-audit-saucedemo.md
```

## Environment configuration

Copy `.env.example` into `.env`:

```bash
cp .env.example .env
```

Key variables:

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

## Prerequisites

- Node.js 24+ (see `.nvmrc`)

## Setup

```bash
npm ci
npx playwright install
```

## Run test suites

```bash
npm test
npm run test:smoke
npm run test:regression
npm run test:untagged
npm run test:api
```

## Run isolated browser projects

```bash
npm run test:smoke:chromium
npm run test:smoke:firefox
npm run test:smoke:webkit
npm run test:regression:chromium
npm run test:regression:firefox
npm run test:regression:webkit
```

## Reports

```bash
npm run report
```

After GitHub Actions test jobs, download the **`playwright-report-<job>-<browser>`** artifact (for example `playwright-report-smoke-chromium`), unzip it, and open `playwright-report/index.html` in a browser (no Allure CLI needed). Allure raw results remain under **`allure-results-<job>-<browser>`** for `npm run report:allure:*`. If the test step failed, also download **`test-results-<job>-<browser>`** and unzip it next to the report folder so screenshots, videos, and traces resolve correctly. `<browser>` is one of `chromium`, `firefox`, or `webkit` from the workflow matrix.

Every workflow run also produces a merged **`allure-report-bundle`** artifact (HTML generated with `npx allure generate`).

### GitHub Pages (Allure)

After merge to **`main`**, the **Smoke Run** workflow deploys the merged Allure HTML site to **GitHub Pages** (job `deploy-allure-pages`). One-time repository setup:

1. **Settings → Pages → Build and deployment**: set **Source** to **GitHub Actions** (not “Deploy from a branch”).
2. Approve the **`github-pages`** environment the first time GitHub prompts for it (branch protection / deployment rules).

The public site URL is shown on the successful `deploy-allure-pages` run (typically `https://<owner>.github.io/<repo>/` for project pages, depending on your Pages domain settings).

## Network intercept helpers

The shared `network` fixture is available from `@fx/ui` and provides:

- `network.mockJson(route, body, options?)` for API stubbing
- `network.mock(route, handler)` for custom route handlers
- `network.replayHar(harPath, options?)` for HAR replay
- `network.clearRoutes()` to remove active route handlers

Example test: `tests/api/network-intercept-mock-api.spec.ts`.
HAR replay example: `tests/api/network-intercept-har-replay.spec.ts`.
