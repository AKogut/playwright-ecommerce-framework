// Shared parser for Playwright's JSON reporter output (test-results/json/results.json).
// Used by run-summary.mjs (per-job CI summary) and build-dashboard.mjs (aggregate page)
// so suite/browser/duration accounting lives in exactly one place.

import { readFile } from 'node:fs/promises';

/**
 * @typedef {Object} TestRecord
 * @property {string} title
 * @property {string} projectName   Playwright project, e.g. "regression-firefox"
 * @property {string} suite         Derived suite slug: smoke | regression | critical | api | visual | untagged
 * @property {string} browser       chromium | firefox | webkit | unknown
 * @property {string} file
 * @property {string[]} attempts     Per-attempt statuses, in order
 * @property {'passed'|'failed'|'flaky'|'skipped'} outcome  Final rolled-up outcome
 * @property {number} durationMs     Sum across attempts
 */

const KNOWN_SUITES = ['smoke', 'regression', 'critical', 'api', 'visual', 'untagged'];
const KNOWN_BROWSERS = ['chromium', 'firefox', 'webkit'];

const asMs = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);

const deriveSuite = (projectName, file) => {
  const haystack = `${projectName} ${file}`.toLowerCase();
  return KNOWN_SUITES.find((suite) => haystack.includes(suite)) ?? 'untagged';
};

const deriveBrowser = (projectName) => {
  const name = projectName.toLowerCase();
  return KNOWN_BROWSERS.find((browser) => name.includes(browser)) ?? 'unknown';
};

const rollUp = (attempts) => {
  const hasPass = attempts.includes('passed');
  const hasFail = attempts.some((status) => status === 'failed' || status === 'timedOut');
  if (attempts.length === 0) return 'skipped';
  if (hasFail && hasPass) return 'flaky';
  if (hasFail) return 'failed';
  if (attempts.every((status) => status === 'skipped')) return 'skipped';
  return 'passed';
};

const walk = (suite, out) => {
  for (const nested of suite.suites ?? []) walk(nested, out);
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      const attempts = (test.results ?? []).map((result) => result.status);
      out.push({
        title: test.title ?? spec.title ?? 'Unnamed test',
        projectName: test.projectName ?? 'unknown-project',
        suite: deriveSuite(test.projectName ?? '', spec.file ?? ''),
        browser: deriveBrowser(test.projectName ?? ''),
        file: spec.file ?? 'unknown-file',
        attempts,
        outcome: rollUp(attempts),
        durationMs: (test.results ?? []).reduce(
          (total, result) => total + asMs(result.duration),
          0,
        ),
      });
    }
  }
};

/** Parse a Playwright JSON report object into normalized {tests, stats}. */
export const parseReport = (report) => {
  const tests = [];
  for (const suite of report.suites ?? []) walk(suite, tests);

  const counts = { total: tests.length, passed: 0, failed: 0, flaky: 0, skipped: 0 };
  let durationMs = 0;
  for (const test of tests) {
    counts[test.outcome] += 1;
    durationMs += test.durationMs;
  }
  // Wall-clock run duration (parallel) comes from stats; fall back to summed test time.
  const wallClockMs = asMs(report.stats?.duration) || durationMs;

  return { tests, stats: { ...counts, durationMs: wallClockMs } };
};

/** Read and parse a Playwright JSON report file. Returns null if missing/unreadable. */
export const readReport = async (path) => {
  try {
    return parseReport(JSON.parse(await readFile(path, 'utf-8')));
  } catch {
    return null;
  }
};

/** Pass rate over tests that actually ran (excludes skipped). 0..100, one decimal. */
export const passRate = (stats) => {
  const ran = stats.total - stats.skipped;
  if (ran <= 0) return 100;
  return Number((((stats.passed + stats.flaky) / ran) * 100).toFixed(1));
};

export const formatDuration = (ms) => {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
};
