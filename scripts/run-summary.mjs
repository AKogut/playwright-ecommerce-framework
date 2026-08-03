// Rich per-run summary for GitHub Actions. Reads the Playwright JSON report and
// writes a status header, a per-suite/browser breakdown, and the slowest tests to
// $GITHUB_STEP_SUMMARY (and stdout). Complements flaky-report.mjs, which owns the
// flaky-detection section and the FAIL_ON_FLAKY gate.

import { readFile, writeFile } from 'node:fs/promises';
import { readReport, passRate, formatDuration } from './lib/playwright-results.mjs';

const reportPath = process.env.PLAYWRIGHT_JSON_REPORT ?? 'test-results/json/results.json';
const summaryPath = process.env.GITHUB_STEP_SUMMARY;
const label = process.env.RUN_SUMMARY_LABEL ?? '';
const SLOWEST_LIMIT = 5;

const statusIcon = { passed: '✅', failed: '❌', flaky: '⚠️', skipped: '⏭️' };

const buildLines = (report) => {
  const { tests, stats } = report;
  const overall =
    stats.failed > 0 ? '❌ Failed' : stats.flaky > 0 ? '⚠️ Passed with flakes' : '✅ Passed';
  const heading = label ? `## Test summary — ${label}` : '## Test summary';

  const lines = [
    heading,
    '',
    `**${overall}** · ${passRate(stats)}% pass rate · ${formatDuration(stats.durationMs)}`,
    '',
    '| Total | ✅ Passed | ❌ Failed | ⚠️ Flaky | ⏭️ Skipped |',
    '| ----: | -------: | -------: | ------: | --------: |',
    `| ${stats.total} | ${stats.passed} | ${stats.failed} | ${stats.flaky} | ${stats.skipped} |`,
    '',
  ];

  // Per suite×browser breakdown, only when the run spans more than one group.
  const groups = new Map();
  for (const test of tests) {
    const key = `${test.suite} · ${test.browser}`;
    const group = groups.get(key) ?? { passed: 0, failed: 0, flaky: 0, skipped: 0, durationMs: 0 };
    group[test.outcome] += 1;
    group.durationMs += test.durationMs;
    groups.set(key, group);
  }
  if (groups.size > 1) {
    lines.push(
      '| Suite · Browser | ✅ | ❌ | ⚠️ | ⏭️ | Duration |',
      '| --- | --: | --: | --: | --: | --: |',
    );
    for (const [key, g] of [...groups].sort((a, b) => a[0].localeCompare(b[0]))) {
      lines.push(
        `| ${key} | ${g.passed} | ${g.failed} | ${g.flaky} | ${g.skipped} | ${formatDuration(g.durationMs)} |`,
      );
    }
    lines.push('');
  }

  // Failures called out explicitly so a red run is readable at a glance.
  const failures = tests.filter((test) => test.outcome === 'failed');
  if (failures.length > 0) {
    lines.push('<details><summary>❌ Failed tests</summary>', '');
    for (const test of failures) {
      lines.push(`- \`${test.browser}\` ${test.title} — \`${test.file}\``);
    }
    lines.push('', '</details>', '');
  }

  const slowest = [...tests].sort((a, b) => b.durationMs - a.durationMs).slice(0, SLOWEST_LIMIT);
  if (slowest.length > 0) {
    lines.push(`<details><summary>🐢 Slowest ${slowest.length} tests</summary>`, '');
    for (const test of slowest) {
      lines.push(
        `- ${statusIcon[test.outcome]} ${formatDuration(test.durationMs)} — ${test.title} (\`${test.browser}\`)`,
      );
    }
    lines.push('', '</details>', '');
  }

  return lines;
};

const main = async () => {
  const report = await readReport(reportPath);
  const lines = report
    ? buildLines(report)
    : [
        '## Test summary',
        '',
        `Playwright JSON report unavailable at \`${reportPath}\`; summary skipped.`,
      ];

  for (const line of lines) console.log(line);

  if (summaryPath) {
    const existing = await readFile(summaryPath, 'utf-8').catch(() => '');
    await writeFile(
      summaryPath,
      `${existing}${existing ? '\n' : ''}${lines.join('\n')}\n`,
      'utf-8',
    );
  }
};

await main();
