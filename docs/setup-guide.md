# Setup Guide

This guide is the source of truth for preparing a local environment and validating that the framework is ready to run.

## 1) Prerequisites

- Node.js 24+ (`.nvmrc` is pinned to `24`)
- npm 11+ (bundled with Node 24)
- Git

Optional but recommended:

- `nvm` for Node version management

## 2) Clone and install

```bash
git clone https://github.com/AKogut/playwright-ecommerce-framework.git
cd playwright-ecommerce-framework
nvm use || nvm install
npm ci
```

Install Playwright browsers:

```bash
npx playwright install
```

## 3) Configure environment

Create local environment file:

```bash
cp .env.example .env
```

Default values in `.env.example` already target SauceDemo and standard test users.

Key reliability flags:

- `SKIP_BASE_URL_HEALTHCHECK=false` keeps startup validation enabled
- `BASE_URL_HEALTHCHECK_RETRIES=3` retries when endpoint is unstable
- `BASE_URL_HEALTHCHECK_BACKOFF_MS=2000` waits between retries

Timeout controls:

- `GLOBAL_TIMEOUT_MS`
- `TEST_TIMEOUT_MS`
- `EXPECT_TIMEOUT_MS`

## 4) Verify installation

Run static checks:

```bash
npm run typecheck
npm run lint
npm run format
```

Run smoke suite:

```bash
npm run test:smoke
```

Open HTML report:

```bash
npm run report
```

## 5) Common command set

Core suites:

```bash
npm test
npm run test:smoke
npm run test:regression
npm run test:critical
npm run test:api
npm run test:untagged
```

Browser-specific projects:

```bash
npm run test:smoke:chromium
npm run test:smoke:firefox
npm run test:smoke:webkit
npm run test:regression:chromium
npm run test:regression:firefox
npm run test:regression:webkit
npm run test:critical:chromium
npm run test:critical:firefox
npm run test:critical:webkit
```

## 6) Troubleshooting

- **Node mismatch**: run `nvm use` and confirm with `node --version`.
- **Playwright browser errors**: rerun `npx playwright install`.
- **Base URL health check fails**: verify `BASE_URL` and network access; temporarily set `SKIP_BASE_URL_HEALTHCHECK=true` only for diagnostics.
- **No report artifacts in CI**: verify workflow artifacts from `playwright-report-*`, `allure-results-*`, and `test-results-*`.
