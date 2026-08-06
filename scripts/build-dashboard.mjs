// Builds the "living" status landing page published to GitHub Pages.
//
// Aggregates every per-job Playwright JSON report (one results.json per
// suite×browser) into a single self-contained HTML page plus two sidecar files:
//   - badge.json  : shields.io endpoint (pass rate) for the README badge
//   - trend.json  : rolling history of runs, seeded from the previous deploy, that
//                   powers the inline sparkline so the page shows movement over time
//
// Env:
//   DASHBOARD_INPUT_DIR   dir scanned recursively for results.json  (default: downloaded)
//   DASHBOARD_OUT_DIR     output dir                                (default: dashboard)
//   DASHBOARD_PREV_TREND  previous trend.json to extend             (optional)
//   ALLURE_HREF           link to the Allure report                 (default: ./allure/)
//   GITHUB_* / COMMIT_SHA are read for run metadata when present

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { parseReport, passRate, formatDuration } from './lib/playwright-results.mjs';

const INPUT_DIR = process.env.DASHBOARD_INPUT_DIR ?? 'downloaded';
const OUT_DIR = process.env.DASHBOARD_OUT_DIR ?? 'dashboard';
const PREV_TREND = process.env.DASHBOARD_PREV_TREND ?? '';
const ALLURE_HREF = process.env.ALLURE_HREF ?? './allure/';
const TREND_MAX = 30;
const BUILT_AT = process.env.DASHBOARD_BUILT_AT ?? new Date().toISOString();

const repo = process.env.GITHUB_REPOSITORY ?? 'AKogut/playwright-ecommerce-framework';
const sha = (process.env.GITHUB_SHA ?? process.env.COMMIT_SHA ?? '').slice(0, 7);
const runUrl =
  process.env.GITHUB_SERVER_URL && process.env.GITHUB_RUN_ID
    ? `${process.env.GITHUB_SERVER_URL}/${repo}/actions/runs/${process.env.GITHUB_RUN_ID}`
    : `https://github.com/${repo}/actions`;

const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch],
  );

// Artifacts are downloaded as run-json-<job>-<browser>/results.json, where <job> is
// the CI suite (critical/smoke/api) and <browser> is the matrix leg. That directory
// name is the authoritative suite×browser label — more reliable than the project name
// inside results.json (e.g. the api job reuses the regression-* project).
const dirMeta = (file) => {
  const match = file.match(/run-json-([a-z0-9]+)-([a-z0-9]+)[\\/]/i);
  return match ? { suite: match[1].toLowerCase(), browser: match[2].toLowerCase() } : null;
};

/** Recursively collect results.json files under a directory. */
const findReports = async (dir) => {
  const found = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await findReports(full)));
    else if (entry.name === 'results.json') found.push(full);
  }
  return found;
};

const emptyGroup = () => ({ passed: 0, failed: 0, flaky: 0, skipped: 0, durationMs: 0, total: 0 });

const aggregate = async () => {
  const files = await findReports(INPUT_DIR);
  const totals = emptyGroup();
  const bySuiteBrowser = new Map();
  const bySuite = new Map();
  const browsers = new Set();
  let allTests = [];

  for (const file of files) {
    let report;
    try {
      report = parseReport(JSON.parse(await readFile(file, 'utf-8')));
    } catch {
      continue;
    }
    const meta = dirMeta(file);
    const tests = meta
      ? report.tests.map((t) => ({ ...t, suite: meta.suite, browser: meta.browser }))
      : report.tests;
    allTests = allTests.concat(tests);
    for (const test of tests) {
      browsers.add(test.browser);
      for (const map of [
        [bySuiteBrowser, `${test.suite}||${test.browser}`],
        [bySuite, test.suite],
      ]) {
        const [target, key] = map;
        const group = target.get(key) ?? emptyGroup();
        group[test.outcome] += 1;
        group.total += 1;
        group.durationMs += test.durationMs;
        target.set(key, group);
      }
      totals[test.outcome] += 1;
      totals.total += 1;
      totals.durationMs += test.durationMs;
    }
  }

  return {
    files: files.length,
    totals,
    bySuiteBrowser,
    bySuite,
    browsers: [...browsers].sort(),
    allTests,
  };
};

const loadPrevTrend = async () => {
  if (!PREV_TREND) return [];
  try {
    const data = JSON.parse(await readFile(PREV_TREND, 'utf-8'));
    return Array.isArray(data) ? data : Array.isArray(data.points) ? data.points : [];
  } catch {
    return [];
  }
};

const sparkline = (points) => {
  if (points.length < 2) return '';
  const width = 220;
  const height = 44;
  const values = points.map((p) => p.passRate);
  const min = Math.min(...values, 100);
  const max = Math.max(...values, 100);
  const span = max - min || 1;
  const step = width / (values.length - 1);
  const coords = values.map((v, i) => [i * step, height - ((v - min) / span) * (height - 8) - 4]);
  const line = coords
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ');
  const [lastX, lastY] = coords[coords.length - 1];
  const area = `${line} L${width},${height} L0,${height} Z`;
  return `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Pass rate trend over the last ${values.length} runs" preserveAspectRatio="none">
    <path d="${area}" fill="var(--spark-fill)" stroke="none"/>
    <path d="${line}" fill="none" stroke="var(--spark)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${lastX.toFixed(1)}" cy="${lastY.toFixed(1)}" r="3" fill="var(--spark)"/>
  </svg>`;
};

const statusOf = (g) =>
  g.failed > 0 ? 'fail' : g.flaky > 0 ? 'flaky' : g.total === 0 ? 'skip' : 'pass';
const STATUS_LABEL = { pass: 'Passing', fail: 'Failing', flaky: 'Flaky', skip: 'No data' };
const DOT = { pass: '🟢', fail: '🔴', flaky: '🟡', skip: '⚪' };

const matrixTable = (data) => {
  const suites = [...data.bySuite.keys()].sort();
  const head = `<tr><th>Suite</th>${data.browsers.map((b) => `<th>${esc(b)}</th>`).join('')}</tr>`;
  const rows = suites.map((suite) => {
    const cells = data.browsers
      .map((browser) => {
        const g = data.bySuiteBrowser.get(`${suite}||${browser}`);
        if (!g) return '<td class="cell empty">—</td>';
        const s = statusOf(g);
        return `<td class="cell ${s}"><span class="dot">${DOT[s]}</span> ${g.passed}/${g.total}</td>`;
      })
      .join('');
    return `<tr><th scope="row">${esc(suite)}</th>${cells}</tr>`;
  });
  return `<table class="matrix"><thead>${head}</thead><tbody>${rows.join('')}</tbody></table>`;
};

const render = (data, trend) => {
  const rate = passRate(data.totals);
  const overall = statusOf(data.totals);
  const slowest = [...data.allTests].sort((a, b) => b.durationMs - a.durationMs).slice(0, 8);
  const trendRows = trend
    .slice(-12)
    .reverse()
    .map(
      (p) =>
        `<tr><td>${esc((p.builtAt ?? '').slice(0, 16).replace('T', ' '))}</td><td>${p.passRate}%</td><td>${p.passed}/${p.total}</td><td class="mono">${esc((p.sha ?? '').slice(0, 7))}</td></tr>`,
    )
    .join('');

  const stat = (label, value, cls = '') =>
    `<div class="stat ${cls}"><div class="stat-v">${value}</div><div class="stat-l">${label}</div></div>`;

  return `<!doctype html>
<html lang="en" data-status="${overall}">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Test Health · ${esc(repo.split('/')[1] ?? repo)}</title>
<style>
  :root{
    --bg:#f6f8fa; --card:#ffffff; --ink:#1f2328; --muted:#59636e; --line:#d1d9e0;
    --pass:#1a7f37; --fail:#cf222e; --flaky:#9a6700; --skip:#59636e;
    --accent:#0969da; --spark:#0969da; --spark-fill:rgba(9,105,218,.12);
    --hero:linear-gradient(135deg,#1a7f37,#218bff);
  }
  @media (prefers-color-scheme:dark){
    :root{ --bg:#0d1117; --card:#161b22; --ink:#e6edf3; --muted:#9198a1; --line:#30363d;
      --pass:#3fb950; --fail:#f85149; --flaky:#d29922; --skip:#8b949e; --accent:#4493f8;
      --spark:#4493f8; --spark-fill:rgba(68,147,248,.16); }
  }
  :root[data-theme="dark"]{ --bg:#0d1117; --card:#161b22; --ink:#e6edf3; --muted:#9198a1; --line:#30363d;
    --pass:#3fb950; --fail:#f85149; --flaky:#d29922; --skip:#8b949e; --accent:#4493f8; --spark:#4493f8; --spark-fill:rgba(68,147,248,.16); }
  :root[data-theme="light"]{ --bg:#f6f8fa; --card:#ffffff; --ink:#1f2328; --muted:#59636e; --line:#d1d9e0;
    --pass:#1a7f37; --fail:#cf222e; --flaky:#9a6700; --skip:#59636e; --accent:#0969da; --spark:#0969da; --spark-fill:rgba(9,105,218,.12); }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;padding:24px}
  .wrap{max-width:920px;margin:0 auto}
  h1{font-size:20px;margin:0 0 2px}
  a{color:var(--accent);text-decoration:none}
  a:hover{text-decoration:underline}
  .sub{color:var(--muted);font-size:13px;margin-bottom:20px}
  .hero{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:22px;display:flex;gap:22px;align-items:center;flex-wrap:wrap;margin-bottom:16px}
  .badge{font-weight:700;font-size:13px;padding:5px 12px;border-radius:999px;color:#fff;white-space:nowrap}
  .badge.pass{background:var(--pass)} .badge.fail{background:var(--fail)} .badge.flaky{background:var(--flaky)} .badge.skip{background:var(--skip)}
  .rate{font-size:44px;font-weight:800;line-height:1}
  .rate small{font-size:16px;color:var(--muted);font-weight:600}
  .hero .spark{margin-left:auto;text-align:right}
  .hero .spark .cap{color:var(--muted);font-size:12px}
  .stats{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:16px}
  .stat{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px;text-align:center}
  .stat-v{font-size:24px;font-weight:800}
  .stat-l{color:var(--muted);font-size:12px;margin-top:2px}
  .stat.p .stat-v{color:var(--pass)} .stat.f .stat-v{color:var(--fail)} .stat.k .stat-v{color:var(--flaky)} .stat.s .stat-v{color:var(--skip)}
  .card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px;margin-bottom:16px}
  .card h2{font-size:14px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);margin:0 0 12px}
  table{width:100%;border-collapse:collapse;font-size:14px}
  .matrix th,.matrix td{padding:8px 10px;text-align:center;border-bottom:1px solid var(--line)}
  .matrix th[scope=row]{text-align:left;text-transform:capitalize;font-weight:600}
  .matrix thead th{text-transform:capitalize;color:var(--muted);font-weight:600}
  .cell.pass{color:var(--pass)} .cell.fail{color:var(--fail);font-weight:700} .cell.flaky{color:var(--flaky)} .cell.empty,.cell.skip{color:var(--muted)}
  .slow li{display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-bottom:1px solid var(--line);list-style:none}
  .slow ul{margin:0;padding:0}
  .slow .d{color:var(--muted);font-variant-numeric:tabular-nums;white-space:nowrap}
  .links{display:flex;gap:10px;flex-wrap:wrap}
  .links a{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 14px;font-weight:600}
  .trend td,.trend th{padding:6px 10px;text-align:left;border-bottom:1px solid var(--line);font-size:13px}
  .mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--muted)}
  .foot{color:var(--muted);font-size:12px;text-align:center;margin-top:24px}
  @media (max-width:640px){ .stats{grid-template-columns:repeat(2,1fr)} .hero .spark{margin-left:0;width:100%;text-align:left} }
</style>
</head>
<body>
<div class="wrap">
  <h1>Test Health <span aria-hidden="true">·</span> ${esc(repo.split('/')[1] ?? repo)}</h1>
  <div class="sub">Live status of the Playwright suite across Chromium, Firefox & WebKit. Rebuilt on every merge to <code>main</code>.</div>

  <section class="hero">
    <div>
      <span class="badge ${overall}">${STATUS_LABEL[overall]}</span>
      <div class="rate" style="margin-top:10px">${rate}<small>% pass</small></div>
    </div>
    <div>
      <div class="stat-l">Tests</div><div style="font-size:20px;font-weight:700">${data.totals.total}</div>
      <div class="stat-l" style="margin-top:6px">Browsers</div><div style="font-size:20px;font-weight:700">${data.browsers.length || '—'}</div>
    </div>
    <div class="spark">
      ${sparkline(trend)}
      <div class="cap">${trend.length >= 2 ? `pass rate · last ${Math.min(trend.length, 30)} runs` : 'trend builds over the next runs'}</div>
    </div>
  </section>

  <div class="stats">
    ${stat('Total', data.totals.total)}
    ${stat('Passed', data.totals.passed, 'p')}
    ${stat('Failed', data.totals.failed, 'f')}
    ${stat('Flaky', data.totals.flaky, 'k')}
    ${stat('Skipped', data.totals.skipped, 's')}
  </div>

  <section class="card">
    <h2>Suite × Browser</h2>
    ${data.browsers.length ? matrixTable(data) : '<p class="mono">No results found for this run.</p>'}
  </section>

  <section class="card slow">
    <h2>Slowest tests</h2>
    <ul>
      ${slowest.map((t) => `<li><span>${DOT[t.outcome === 'passed' ? 'pass' : t.outcome === 'failed' ? 'fail' : t.outcome === 'flaky' ? 'flaky' : 'skip']} ${esc(t.title)} <span class="mono">${esc(t.browser)}</span></span><span class="d">${formatDuration(t.durationMs)}</span></li>`).join('') || '<li>—</li>'}
    </ul>
  </section>

  ${trend.length >= 2 ? `<section class="card"><h2>Recent runs</h2><table class="trend"><thead><tr><th>When (UTC)</th><th>Pass rate</th><th>Passed</th><th>Commit</th></tr></thead><tbody>${trendRows}</tbody></table></section>` : ''}

  <section class="card">
    <h2>Dive deeper</h2>
    <div class="links">
      <a href="${esc(ALLURE_HREF)}">📊 Allure report</a>
      <a href="${esc(runUrl)}">⚙️ CI run</a>
      <a href="https://github.com/${esc(repo)}">📦 Repository</a>
      <a href="https://github.com/AKogut/flakemetry">🔬 Flakemetry</a>
    </div>
  </section>

  <div class="foot">
    Built ${esc(BUILT_AT.slice(0, 16).replace('T', ' '))} UTC${sha ? ` · <span class="mono">${esc(sha)}</span>` : ''}
    · from ${data.files} suite report${data.files === 1 ? '' : 's'}
  </div>
</div>
<script>
  // Honor a ?theme= override or the platform theme toggle if the host stamps one.
  const t = new URLSearchParams(location.search).get('theme');
  if (t === 'dark' || t === 'light') document.documentElement.setAttribute('data-theme', t);
</script>
</body>
</html>`;
};

const main = async () => {
  const data = await aggregate();
  const rate = passRate(data.totals);
  const overall = statusOf(data.totals);

  const prev = await loadPrevTrend();
  const point = {
    builtAt: BUILT_AT,
    passRate: rate,
    passed: data.totals.passed,
    failed: data.totals.failed,
    flaky: data.totals.flaky,
    total: data.totals.total,
    sha,
  };
  // Only extend history when this run actually had results (avoid empty spikes).
  const trend = (data.totals.total > 0 ? [...prev, point] : prev).slice(-TREND_MAX);

  const badge = {
    schemaVersion: 1,
    label: 'tests',
    message:
      data.totals.total > 0 ? `${rate}% · ${data.totals.passed}/${data.totals.total}` : 'no data',
    color:
      overall === 'pass'
        ? 'brightgreen'
        : overall === 'flaky'
          ? 'yellow'
          : overall === 'fail'
            ? 'red'
            : 'lightgrey',
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, 'index.html'), render(data, trend), 'utf-8');
  await writeFile(path.join(OUT_DIR, 'badge.json'), JSON.stringify(badge), 'utf-8');
  await writeFile(path.join(OUT_DIR, 'trend.json'), JSON.stringify(trend, null, 2), 'utf-8');

  console.log(
    `Dashboard: ${data.files} report(s), ${data.totals.total} tests, ${rate}% pass (${overall}). Trend points: ${trend.length}.`,
  );
};

await main();
