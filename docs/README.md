# Documentation Hub

Central index for the Playwright Ecommerce Framework. Each guide has a single responsibility; together they describe **what** we test, **how** the code is organized, and **how** to run and debug it reliably.

## Reading paths

| Persona | Start here | Then |
| ------- | ---------- | ---- |
| **New contributor** | [Setup guide](setup-guide.md) | [Folder structure](folder-structure.md) → [Contributing guide](../CONTRIBUTING.md) |
| **Reviewer / hiring manager** | [**Quality overview**](quality-overview.md) | [Test strategy](test-strategy.md) → [Live Allure report](https://akogut.github.io/playwright-ecommerce-framework/) |
| **Test author** | [Tag strategy](tag-strategy.md) | [UI audit](ui-audit-saucedemo.md) → [Architecture](architecture.md) |
| **On-call / triage** | [Troubleshooting appendix](troubleshooting.md) | [CI pipeline](ci-pipeline.md) → workflow artifacts |

## Guides by topic

### Strategy and quality

| Document | Description |
| -------- | ----------- |
| [**Quality overview**](quality-overview.md) | One-page executive summary — pyramid, journeys, CI loop, 60s eval path |
| [Test strategy](test-strategy.md) | Scope, pyramid, suites, coverage matrix, risk model, quality gates |
| [Tag strategy](tag-strategy.md) | `@smoke`, `@regression`, `@critical`, Playwright projects |
| [UI audit — SauceDemo](ui-audit-saucedemo.md) | User journeys, selector policy, scenario backlog |

### Engineering

| Document | Description |
| -------- | ----------- |
| [Architecture](architecture.md) | Layers, fixtures, runtime flow, design principles |
| [Folder structure](folder-structure.md) | Repository layout and conventions for new code |
| [CI pipeline](ci-pipeline.md) | GitHub Actions jobs, artifacts, Allure deployment |

### Operations

| Document | Description |
| -------- | ----------- |
| [Setup guide](setup-guide.md) | Prerequisites, install, verification |
| [Troubleshooting appendix](troubleshooting.md) | Symptom index, decision tree, runbooks |
| [Demo screenshots](demo-screenshots.md) | Visual journey map with spec linkage |

### Community

| Document | Description |
| -------- | ----------- |
| [Contributing guide](../CONTRIBUTING.md) | Branching, commits, PR checklist |

## Documentation principles

1. **Single source of truth** — strategy lives in `test-strategy.md`; tags in `tag-strategy.md`; do not duplicate tables across files without linking back.
2. **Executable docs** — every command block should run as-is from the repo root.
3. **Traceability** — scenarios link to spec files; CI jobs link to workflow YAML.
4. **Actionable triage** — failures map to symptom → cause → fix, not generic advice.
