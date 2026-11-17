# Changelog

Notable changes to this framework. Routine dependency bumps are omitted; they are
visible in the commit history and arrive weekly through Dependabot.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- `npm audit` gate in Code Quality: high and critical advisories fail the build, and
  findings below that threshold are written to the job summary.
- Auto-merge for Dependabot pull requests whose update type is not a major. Branch
  protection still requires all nine checks, so nothing merges unverified.
- Triage job on the nightly regression: when a scheduled run fails it probes the
  application under test and opens a single issue, distinguishing a broken suite from
  a demo site that is unavailable.
- Project changelog.

### Changed

- Dependency overrides pin `minimatch` to ^11.0.9 and `glob` to ^14.0.6, clearing
  fourteen moderate advisories that Dependabot could not fix because the packages are
  transitive and constrained by their parents.
- Allure moved to 3.33.0. The previous hold at 3.20.1 existed because
  `@allurereport/web-commons` pinned a vulnerable `dompurify`; upstream has relaxed it.
- `engines.node` corrected to `>=26`, matching `.nvmrc` and the workflows.

### Removed

- Empty `src/api/` placeholder directory.

## 2026-11-09

### Changed

- Runtime moved to Node 26 LTS across the workflows, `.nvmrc` and the setup guide.

## 2026-11-04

### Added

- Public test history published through the Flakemetry demo, rebuilt nightly from the
  artifacts the suite already uploads. Needs no secret.
- Per-run test results retained for 90 days.
- Security policy, code owners and a social preview image.

## 2026-10-26

### Changed

- Dependencies refreshed and two new advisories cleared (`dompurify`, `markdown-it`).
- `dotenv`, `commitlint` and `@types/node` taken to current majors. TypeScript stays on
  6: version 7 removes the `baseUrl` option this project's `tsconfig.json` relies on.

## 2026-09-16

### Added

- Dependabot configuration: weekly grouped updates for npm and GitHub Actions, with
  majors left for deliberate review.
- Playwright container image resolved from the lockfile, so an upgrade is a lockfile
  change and needs no workflow edit.
- Daily rebuild of the dashboard and Allure report, so the published site reflects the
  current health of `main` rather than the last merge.

### Fixed

- Allure trend history, which had never accumulated: the report job was fetching the
  Allure 2 history layout, which Allure 3 does not write. History is now a JSONL file
  carried across deploys.
- `npm run test:untagged` exiting non-zero when every test was correctly tagged.
- Report build outputs leaking into git, Prettier and ESLint, which blocked commits.

### Security

- Twelve advisories patched, including arbitrary code execution in `@faker-js/faker`.
- Flakemetry actions pinned to a commit rather than a branch.

## 2026-08-06

### Added

- Living test-health dashboard published to GitHub Pages: suite by browser status,
  pass-rate trend, slowest tests and a badge.
- Flakemetry integration: every test execution is emitted as an OpenTelemetry span,
  fail-open so an unreachable endpoint never fails a run.
- Rich per-run job summary, and a sticky pull-request comment carrying the flaky
  verdict back to where changes are reviewed.

## 2026-06-19

### Fixed

- Nightly and smoke runs timing out at the job limit on every browser. Browser
  installation hung during extraction on Node 24 with Playwright below 1.60; the test
  jobs now run inside the official Playwright container, which ships browsers
  preinstalled.
