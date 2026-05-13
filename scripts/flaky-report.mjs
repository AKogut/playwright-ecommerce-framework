import { readFile, writeFile } from 'node:fs/promises';

const reportPath = process.env.PLAYWRIGHT_JSON_REPORT ?? 'test-results/json/results.json';
const failOnFlaky = process.env.FAIL_ON_FLAKY === 'true';
const githubSummaryPath = process.env.GITHUB_STEP_SUMMARY;

const asDurationMs = (result) => {
  if (typeof result.duration === 'number' && Number.isFinite(result.duration)) {
    return result.duration;
  }

  return 0;
};

const toDurationSec = (durationMs) => Number((durationMs / 1000).toFixed(2));

const collectTests = (suite, output) => {
  const nestedSuites = Array.isArray(suite.suites) ? suite.suites : [];
  const suiteSpecs = Array.isArray(suite.specs) ? suite.specs : [];

  for (const nestedSuite of nestedSuites) {
    collectTests(nestedSuite, output);
  }

  for (const spec of suiteSpecs) {
    const tests = Array.isArray(spec.tests) ? spec.tests : [];
    for (const test of tests) {
      output.push({
        title: test.title ?? spec.title ?? 'Unnamed test',
        projectName: test.projectName ?? 'unknown-project',
        location: spec.file ?? 'unknown-file',
        outcomes: Array.isArray(test.results) ? test.results.map((result) => result.status) : [],
        durationMs: Array.isArray(test.results)
          ? test.results.reduce((total, result) => total + asDurationMs(result), 0)
          : 0,
      });
    }
  }
};

const findFlakyTests = (report) => {
  const rootSuites = Array.isArray(report.suites) ? report.suites : [];
  const allTests = [];

  for (const suite of rootSuites) {
    collectTests(suite, allTests);
  }

  return allTests.filter((test) => {
    const hasFailure = test.outcomes.some((status) => status === 'failed' || status === 'timedOut');
    const hasPass = test.outcomes.some((status) => status === 'passed');
    return hasFailure && hasPass;
  });
};

const buildSummary = (flakyTests) => {
  if (flakyTests.length === 0) {
    return ['## Flaky test detection', '', 'No flaky tests detected in this run.'];
  }

  const lines = ['## Flaky test detection', '', `Detected ${flakyTests.length} flaky test(s):`, ''];

  for (const flaky of flakyTests) {
    lines.push(
      `- \`${flaky.projectName}\` | \`${flaky.location}\` | ${flaky.title} (attempts: ${flaky.outcomes.join(
        ' -> ',
      )}, duration: ${toDurationSec(flaky.durationMs)}s)`,
    );
  }

  return lines;
};

const appendGithubSummary = async (summaryLines) => {
  if (!githubSummaryPath) {
    return;
  }

  const existing = await readFile(githubSummaryPath, 'utf-8').catch(() => '');
  const next = `${existing}${existing.length > 0 ? '\n' : ''}${summaryLines.join('\n')}\n`;
  await writeFile(githubSummaryPath, next, 'utf-8');
};

const main = async () => {
  let report;
  try {
    const file = await readFile(reportPath, 'utf-8');
    report = JSON.parse(file);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const summary = [
      '## Flaky test detection',
      '',
      `Playwright JSON report is unavailable at \`${reportPath}\`.`,
      `Detection skipped: ${message}`,
    ];
    for (const line of summary) {
      console.log(line);
    }
    await appendGithubSummary(summary);
    return;
  }

  const flakyTests = findFlakyTests(report);
  const summary = buildSummary(flakyTests);

  for (const line of summary) {
    console.log(line);
  }

  await appendGithubSummary(summary);

  if (flakyTests.length > 0 && failOnFlaky) {
    console.error('Flaky tests were detected and FAIL_ON_FLAKY=true, failing the run.');
    process.exit(2);
  }
};

await main();
