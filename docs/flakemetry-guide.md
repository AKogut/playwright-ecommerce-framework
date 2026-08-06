# Flakemetry integration guide

[Flakemetry](https://github.com/AKogut/flakemetry) is an OpenTelemetry-native test-intelligence
platform: every test execution is modelled as a span, so history, flaky scoring, and AI
root-cause analysis fall out of the telemetry instead of being bolted on. This framework ships
the reporter **already wired** — this guide covers what that gives you today and how to turn on
the full platform.

## How it's wired here

The [`@flakemetry/playwright-reporter`](https://www.npmjs.com/package/@flakemetry/playwright-reporter)
is registered in [playwright.config.ts](../playwright.config.ts):

```ts
['@flakemetry/playwright-reporter', { outputFile: 'test-results/flakemetry/run.json' }],
```

The reporter is **fail-open**: it always writes a local batch to
`test-results/flakemetry/run.json`, and it additionally uploads the run over OTLP **only** when
`FLAKEMETRY_ENDPOINT` and `FLAKEMETRY_TOKEN` are set. If the endpoint is unreachable or the
variables are unset, the test run still succeeds — nothing is blocked.

CI already passes the variables through: both [pr-review-smoke.yml](../.github/workflows/pr-review-smoke.yml)
and [nightly-regression.yml](../.github/workflows/nightly-regression.yml) map
`FLAKEMETRY_ENDPOINT` / `FLAKEMETRY_TOKEN` from repo secrets into every test job and pin
`FLAKEMETRY_PROJECT`, and each job uploads the batch as a `flakemetry-<job>-<browser>` artifact.
So the moment you add the two secrets, uploads start — no workflow change needed.

## Two modes

| Mode                              | Needs                                        | You get                                                                                       |
| --------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **Local batch (default, on now)** | nothing                                      | `test-results/flakemetry/run.json` per run — the exact OTel payload, for inspection/debugging |
| **Full platform**                 | a running Flakemetry instance + ingest token | Flaky board, per-test history, explainable scoring, AI RCA, cost, quarantine, badges          |

## The data path

```
reporter ── OTLP-HTTP (JSON) + Bearer token ─▶ Ingestion API (:4000) ─▶ 202 (never blocks CI)
                                                     │  durable queue (Postgres SKIP LOCKED)
                                                     ▼
                              Workers: identity → flaky scoring → clustering → AI RCA
                                                     │
                                                     ▼
                              Postgres (+pgvector) · MinIO/S3 ─▶ Query API ─▶ dashboard (:3000)
```

The write path returns `202` immediately; scoring and RCA happen asynchronously.

---

## Step by step: stand up the platform

### 1. Run an instance

```bash
git clone https://github.com/AKogut/flakemetry.git
cd flakemetry
cp .env.example .env
echo "AUTH_SECRET=$(openssl rand -base64 32)" >> .env
# Create a GitHub OAuth App with callback http://localhost:3000/api/auth/callback/github
# and put AUTH_GITHUB_ID / AUTH_GITHUB_SECRET in .env (dashboard sign-in uses it).
docker compose up            # or: pnpm stack:up
```

Dashboard: [localhost:3000](http://localhost:3000) · Ingestion API: **localhost:4000**. The first
account to sign in adopts the seeded workspace. The demo dataset is only written to an empty
database, so restarts keep what you've ingested (`pnpm demo` for a clean slate).

For a scaled/hosted deployment, Flakemetry ships a Helm chart and runbook under its `deploy/`.

### 2. Create a project and ingest token

In the dashboard: **Projects → Add project**, then on the project **Ingest tokens → New token**.
The token has the form `fmk_…` and is **shown once** — copy it immediately.

### 3. Point this repo at the instance

The reporter reads three environment variables:

| Variable              | Value                                                          |
| --------------------- | -------------------------------------------------------------- |
| `FLAKEMETRY_ENDPOINT` | ingestion API base URL, e.g. `http://localhost:4000`           |
| `FLAKEMETRY_TOKEN`    | the `fmk_…` token from step 2                                  |
| `FLAKEMETRY_PROJECT`  | `akogut/playwright-ecommerce-framework` (already pinned in CI) |

**Locally** — uncomment the block in [.env](../.env.example):

```bash
FLAKEMETRY_ENDPOINT=http://localhost:4000
FLAKEMETRY_TOKEN=fmk_...
```

**In CI** — add two repo secrets (**Settings → Secrets and variables → Actions**):
`FLAKEMETRY_ENDPOINT` and `FLAKEMETRY_TOKEN`. That's the whole change — the workflows already
consume them. The reporter derives commit, branch, PR number, and CI run id from the GitHub
Actions environment automatically.

### 4. Run tests — data flows

```bash
FLAKEMETRY_ENDPOINT=http://localhost:4000 FLAKEMETRY_TOKEN=fmk_... npx playwright test
```

The API responds `202`; workers process the run. Verified request shape:
`POST /v1/traces` (OTLP) or `POST /v1/ingest` (JSON transport), with
`Authorization: Bearer fmk_…` and an `idempotency-key` that makes re-delivery safe.

### 5. Read the board

1. **Flaky board** — every test ranked by a transparent score, worst first.
2. **Test detail** — the score broken into reason codes (same commit → different result, pass-on-rerun, …).
3. **RCA panel** — a likely cause and suggested fix for regressions.

### 6. Seed history so the board is useful immediately

```bash
FLAKEMETRY_ENDPOINT=http://localhost:4000 FLAKEMETRY_TOKEN=fmk_... \
  npx flakemetry import ./ci-artifacts   # dated from the original reports, not import time
```

---

## Config-as-code

Analysis policy lives in [flakemetry.yml](../flakemetry.yml) at the repo root (reviewed in PRs,
synced to the project each run): flaky thresholds, quarantine, AI budget, ignore globs, retention.
The **token is never stored there** — it comes from the environment. Inspect the resolved config
with `npx flakemetry config` (the token is redacted to its prefix).

## Reporter knobs

| Variable                 | Effect                                                                             |
| ------------------------ | ---------------------------------------------------------------------------------- |
| `FLAKEMETRY_TRANSPORT`   | `otlp` (default, `/v1/traces`) or `json` (`/v1/ingest`)                            |
| `FLAKEMETRY_OUTPUT_FILE` | also write the batch to a file (already set to `test-results/flakemetry/run.json`) |
| `FLAKEMETRY_BUFFER_DIR`  | buffer runs here when delivery fails; replayed on the next run                     |
| `FLAKEMETRY_SAMPLE_RATE` | fraction (0–1) of **passing** runs to upload; failures/flakes always upload        |
| `FLAKEMETRY_COMPRESSION` | `gzip` to compress the OTLP export                                                 |

## Troubleshooting

- **Nothing appears in the dashboard.** Confirm `FLAKEMETRY_ENDPOINT` + `FLAKEMETRY_TOKEN` are set
  in the run's environment (in CI, that the two secrets exist). Without them the reporter is
  silent by design. Inspect `test-results/flakemetry/run.json` to confirm the batch was produced.
- **Uploads should never fail your build.** They can't — delivery is fail-open. If the endpoint is
  down, set `FLAKEMETRY_BUFFER_DIR` so the run is replayed next time.
- **Verify the payload without a server.** Run with `FLAKEMETRY_TRANSPORT=json` and read
  `test-results/flakemetry/run.json` — that is the exact body the API receives.
