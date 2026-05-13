import { defineConfig, devices } from '@playwright/test';
import { frameworkConfig } from './src/config/environment';

const isCI = Boolean(process.env.CI);
const taggedSuitesPattern = /@smoke|@regression/;
const suitePatterns = {
  smoke: /@smoke\b/,
  regression: /@regression\b/,
} as const;

const desktopBrowsers = [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
] as const;

const suiteProjects = Object.entries(suitePatterns).flatMap(([suiteName, grep]) =>
  desktopBrowsers.map((browser) => ({
    name: `${suiteName}-${browser.name}`,
    grep,
    use: browser.use,
  })),
);

export default defineConfig({
  testDir: './tests',
  globalSetup: './src/config/global-setup.ts',
  globalTeardown: './src/config/global-teardown.ts',
  timeout: frameworkConfig.testTimeoutMs,
  globalTimeout: frameworkConfig.globalTimeoutMs,
  outputDir: 'test-results/artifacts',
  expect: {
    timeout: frameworkConfig.expectTimeoutMs,
  },
  fullyParallel: !isCI,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit/results.xml' }],
    ['json', { outputFile: 'test-results/json/results.json' }],
  ],
  use: {
    baseURL: frameworkConfig.baseUrl,
    headless: true,
    viewport: { width: 1366, height: 768 },
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    ...suiteProjects,
    {
      name: 'untagged-chromium',
      grepInvert: taggedSuitesPattern,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
