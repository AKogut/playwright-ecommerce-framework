# UI Audit: SauceDemo

Target: [https://www.saucedemo.com/](https://www.saucedemo.com/)

## Core user journey map

1. Login (`/`)
2. Products (`/inventory.html`)
3. Cart (`/cart.html`)
4. Checkout step one (`/checkout-step-one.html`)
5. Checkout step two (`/checkout-step-two.html`)
6. Confirmation (`/checkout-complete.html`)

## Stable selector strategy

- Prefer `data-test` locators for all actionable controls.
- Use semantic text assertions for key page headers.
- Avoid brittle CSS chains for core flows.
- Keep product actions dynamic with slugified product names.

## High-value scenarios

- Critical smoke:
  - Valid login
  - Product catalog visible
  - Add to cart
  - Checkout happy path
  - Logout
- Regression baseline:
  - Invalid/locked login
  - Required field validations
  - Multi-product cart checks
  - Item removal from cart

## Risks and mitigations

- Dynamic network latency can impact setup checks.
  - Mitigation: health-check retries and backoff in global setup.
- Test omission risk when tags are forgotten.
  - Mitigation: `untagged-chromium` project with `grepInvert`.
