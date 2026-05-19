# Folder Structure

Reference for where framework responsibilities live and where new code should be added.

## Repository tree

```text
.
|-- .github/workflows/
|   |-- code-quality.yml
|   |-- nightly-regression.yml
|   `-- pr-review-smoke.yml
|-- docs/
|   |-- README.md            # documentation hub
|   |-- quality-overview.md  # one-pager for reviewers
|   |-- assets/              # demo screenshots
|   |-- architecture.md
|   |-- ci-pipeline.md
|   |-- demo-screenshots.md
|   |-- folder-structure.md
|   |-- setup-guide.md
|   |-- tag-strategy.md
|   |-- test-strategy.md
|   |-- troubleshooting.md
|   `-- ui-audit-saucedemo.md
|-- scripts/
|   `-- flaky-report.mjs
|-- src/
|   |-- config/
|   |   |-- allure-reporter.ts
|   |   |-- environment.ts
|   |   |-- global-setup.ts
|   |   |-- global-teardown.ts
|   |   `-- run-environment-metadata.ts
|   |-- data/
|   |   |-- checkout.data.ts
|   |   |-- products.ts
|   |   `-- users.ts
|   |-- fixtures/
|   |   |-- ui/
|   |   |   |-- auth.fixture.ts
|   |   |   |-- data.fixture.ts
|   |   |   |-- network.fixture.ts
|   |   |   `-- pages.fixture.ts
|   |   `-- ui.fixture.ts
|   |-- page-objects/
|   |   |-- base.component.ts
|   |   |-- base.page.ts
|   |   |-- cart.page.ts
|   |   |-- checkout.page.ts
|   |   |-- login.page.ts
|   |   `-- products.page.ts
|   |-- selectors/
|   |   |-- cart.selectors.ts
|   |   |-- checkout.selectors.ts
|   |   |-- index.ts
|   |   |-- login.selectors.ts
|   |   `-- products.selectors.ts
|   `-- utils/
|       |-- error-handler.ts
|       |-- logger.ts
|       `-- product-name.util.ts
|-- tests/
|   |-- api/
|   |   |-- fixtures/mock-products.har
|   |   |-- network-intercept-clear-routes.spec.ts
|   |   |-- network-intercept-custom-handler.spec.ts
|   |   |-- network-intercept-har-replay.spec.ts
|   |   |-- network-intercept-mock-api.spec.ts
|   |   `-- network-intercept-mock-status.spec.ts
|   |-- regression/
|   |   |-- cart-add-multiple-products.spec.ts
|   |   |-- cart-remove-product.spec.ts
|   |   |-- checkout-missing-first-name.spec.ts
|   |   |-- checkout-missing-last-name.spec.ts
|   |   |-- checkout-missing-postal-code.spec.ts
|   |   |-- checkout-validate-cart-total.spec.ts
|   |   |-- login-empty-password.spec.ts
|   |   |-- login-empty-username.spec.ts
|   |   |-- login-invalid-credentials.spec.ts
|   |   `-- login-locked-user.spec.ts
|   `-- smoke/
|       |-- add-product-to-cart.spec.ts
|       |-- checkout-happy-path.spec.ts
|       |-- login-valid.spec.ts
|       |-- logout.spec.ts
|       `-- products-list-visible.spec.ts
|-- .env.example
|-- .nvmrc
|-- CONTRIBUTING.md
|-- LICENSE
|-- playwright.config.ts
|-- package.json
`-- tsconfig.json
```

## Responsibility map

- `src/config`: runtime lifecycle, environment parsing, reporter wiring
- `src/fixtures`: shared test context and composable domain fixtures
- `src/page-objects`: UI workflows and assertions for each page/component
- `src/selectors`: single source of selector truth for page objects
- `src/data`: deterministic and generated input datasets
- `src/utils`: cross-cutting helpers (logging, error handling, naming)
- `tests/smoke`: high-signal critical-path checks
- `tests/regression`: broader coverage for negative and edge flows
- `tests/api`: network interception and HAR-driven scenarios
- `docs`: framework guides and architectural references

## Conventions for adding new code

- Add new user-flow actions to `page-objects`, not directly to test files.
- Add or update selectors in `selectors` first, then consume from page objects.
- Keep fixture composition in `fixtures/ui`, and expose via `@fx/ui`.
- Keep tests scenario-oriented: one behavior per spec file when practical.
- Place long-form operational knowledge in `docs` and link it from `README.md`.
