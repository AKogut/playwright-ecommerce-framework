# Tag Strategy

This guide defines how test tags map to suites and Playwright projects in this repository.

## Tag taxonomy

- `@smoke`: core end-to-end user journeys that provide fast confidence.
- `@regression`: broader behavior coverage, including negative and edge cases.
- `@critical`: highest-priority checks for production readiness (must stay stable).
- `@accessibility`: focused WCAG smoke checks that also belong to a functional suite.
- `@visual`: opt-in screenshot comparisons that run through the dedicated visual project.

## Tagging rules

1. Every UI test should include either `@smoke` or `@regression`.
2. `@critical` is a priority marker and should be used together with `@smoke` for must-pass flows.
3. `@accessibility` is an overlay tag and should be paired with `@smoke` or `@regression`.
4. `@visual` specs live under `tests/visual` and are intentionally run through `npm run test:visual`.
5. API/network specs stay under `tests/api` and are currently tagged as `@regression`.
6. Untagged tests are treated as a hygiene problem and should be fixed quickly.

## Playwright project mapping

Projects are generated per browser (`chromium`, `firefox`, `webkit`) for:

- `smoke-*` -> `grep: /@smoke\b/`
- `regression-*` -> `grep: /@regression\b/`
- `critical-*` -> `grep: /@critical\b/`
- `visual-chromium` -> `grep: /@visual\b/`

There is also `untagged-chromium`, which runs with `grepInvert` against known suite and overlay tags to find tests missing classification.

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

# focused quality checks
npm run test:accessibility
npm run test:visual
```

## CI usage

- PR workflow runs a dedicated `critical` job on Chromium as a fast merge gate.
- Full smoke and API matrices continue to run across Chromium, Firefox, and WebKit.

See [Test strategy](test-strategy.md) for suite inventory, risk prioritization, and PR exit criteria.
