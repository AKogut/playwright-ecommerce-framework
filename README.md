# Playwright Ecommerce Framework

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

## Network intercept helpers

The shared `network` fixture is available from `@fx/ui` and provides:

- `network.mockJson(route, body, options?)` for API stubbing
- `network.mock(route, handler)` for custom route handlers
- `network.replayHar(harPath, options?)` for HAR replay
- `network.clearRoutes()` to remove active route handlers

Example test: `tests/api/network-intercept-mock-api.spec.ts`.
HAR replay example: `tests/api/network-intercept-har-replay.spec.ts`.
