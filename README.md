# Playwright Ecommerce Framework

Production-style Playwright + TypeScript E2E framework for SauceDemo:
[https://www.saucedemo.com/](https://www.saucedemo.com/).

## Current setup

- TypeScript + Playwright test runner
- ESLint + Prettier
- Single environment config (`BASE_URL` + timeouts)
- Centralized Playwright timeouts and failure artifacts (screenshots, video, trace)

## Environment configuration

1. Copy `.env.example` into `.env`
2. Update values if needed

```bash
cp .env.example .env
```

Key variables:

- `BASE_URL`
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

## Run tests

```bash
npm test
npm run test:smoke
npm run test:regression
npm run test:smoke:chromium
npm run test:untagged
npm run report
```
