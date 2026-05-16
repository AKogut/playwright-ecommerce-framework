# Contributing Guide

Thanks for contributing to `playwright-ecommerce-framework`.

This guide defines the expected quality bar for code, tests, and pull requests.

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).

## Development setup

1. Use Node.js 24+ (project pin is in `.nvmrc`).
2. Install dependencies:

```bash
nvm use || nvm install
npm ci
npx playwright install
```

3. Create local environment file:

```bash
cp .env.example .env
```

## Branching and commit workflow

- Create a feature branch from `main`.
- Keep PRs focused and reviewable (one logical change set per PR).
- Use meaningful commit messages (Conventional Commits recommended, e.g. `feat:`, `fix:`, `docs:`, `test:`).

Before pushing:

```bash
npm run typecheck
npm run lint
npm run format
npm run test:smoke
```

If your changes affect API/network fixtures, also run:

```bash
npm run test:api
```

## Coding standards

- Write TypeScript with strict typing and avoid `any` unless justified.
- Keep test specs scenario-focused and readable.
- Place reusable UI actions/assertions in page objects (`src/page-objects`), not directly in tests.
- Keep selectors centralized in `src/selectors`.
- Reuse fixtures from `@fx/ui` rather than duplicating setup logic in test files.
- Favor stable `data-test` locators over brittle CSS chains.

## Test authoring guidelines

- Tag tests with `@smoke` or `@regression` when applicable.
- Keep one behavior per spec file where practical.
- Add negative-path coverage for validation and edge cases.
- For network-dependent behavior, prefer fixture-based mocking/HAR replay in `tests/api`.

To detect untagged tests:

```bash
npm run test:untagged
```

## Pull request checklist

- [ ] Scope is clear and linked to an issue/task.
- [ ] Documentation updated (`README.md` or files in `docs/`) if behavior changed.
- [ ] No secrets committed (`.env` and credentials stay local).
- [ ] Local checks pass (`typecheck`, `lint`, `format`, relevant test suites).
- [ ] CI is green (smoke, quality checks, and any affected workflows).

## Reporting and debugging

- Local HTML report: `npm run report`
- Allure report: `npm run report:allure`
- CI artifacts: `playwright-report-*`, `allure-results-*`, `test-results-*`

When reporting flaky behavior, include:

- failing spec path
- browser/project name
- reproduction command
- report artifact link or screenshot
