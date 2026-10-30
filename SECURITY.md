# Security Policy

## Reporting a vulnerability

Please do not open public issues for security vulnerabilities.

Report privately via [GitHub Security Advisories](https://github.com/AKogut/playwright-ecommerce-framework/security/advisories/new). You will receive an acknowledgement within 72 hours and a status update as the report is triaged.

## Scope

The framework in `src/`, the suites in `tests/` and the workflows that run them and publish the reports. The system under test, [SauceDemo](https://www.saucedemo.com/), is a public demo store and is out of scope.

## Supported versions

Only `main` is maintained.

## Dependency advisories

Dependabot alerts and security updates are enabled, and version updates are proposed weekly for npm and the workflows (see [`.github/dependabot.yml`](.github/dependabot.yml)). In CI, the suites run inside the official Playwright container image, at the version the lockfile resolves.
