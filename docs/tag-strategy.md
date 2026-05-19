# Tag Strategy

This guide defines how test tags map to suites and Playwright projects in this repository.

## Tag taxonomy

- `@smoke`: core end-to-end user journeys that provide fast confidence.
- `@regression`: broader behavior coverage, including negative and edge cases.
- `@critical`: highest-priority checks for production readiness (must stay stable).

## Tagging rules

1. Every UI test should include either `@smoke` or `@regression`.
2. `@critical` is a priority marker and should be used together with `@smoke` for must-pass flows.
3. API/network specs stay under `tests/api` and are currently tagged as `@regression`.
4. Untagged tests are treated as a hygiene problem and should be fixed quickly.

## Playwright project mapping

Projects are generated per browser (`chromium`, `firefox`, `webkit`) for:

- `smoke-*` -> `grep: /@smoke\b/`
- `regression-*` -> `grep: /@regression\b/`
- `critical-*` -> `grep: /@critical\b/`

There is also `untagged-chromium`, which runs with `grepInvert` against known suite tags to find tests missing classification.

## Practical examples

```ts
test('valid login redirects to products page @smoke @critical', async ({ auth, productsPage }) => {
  await auth.loginAsStandardUser();
  await productsPage.expectOnProductsPage();
});
```

```ts
test('checkout validation for missing postal code @regression', async ({ ... }) => {
  // ...
});
```

## Useful commands

```bash
# run all critical tests
npm run test:critical

# run critical project by browser
npm run test:critical:chromium
npm run test:critical:firefox
npm run test:critical:webkit

# detect missing tags
npm run test:untagged
```

## CI usage

- PR workflow runs a dedicated `critical` job on Chromium as a fast merge gate.
- Full smoke and API matrices continue to run across Chromium, Firefox, and WebKit.

See [Test strategy](test-strategy.md) for suite inventory, risk prioritization, and PR exit criteria.
