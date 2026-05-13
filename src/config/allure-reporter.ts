import { createRequire } from 'node:module';
import { join } from 'node:path';

import { buildRunEnvironmentMetadata } from './run-environment-metadata';

const require = createRequire(join(process.cwd(), 'playwright.config.ts'));

type PackageJson = {
  repository?: { url?: string };
};

const { repository } = require('./package.json') as PackageJson;

const resolveGitHubWebBase = (repositoryUrl: string | undefined): string | undefined => {
  if (!repositoryUrl?.trim()) {
    return undefined;
  }

  const match = /github\.com[/:](?<owner>[\w.-]+)\/(?<repo>[\w.-]+?)(?:\.git)?$/iu.exec(
    repositoryUrl,
  );

  if (!match?.groups?.owner || !match.groups.repo) {
    return undefined;
  }

  return `https://github.com/${match.groups.owner}/${match.groups.repo}`;
};

const githubRepoBase = resolveGitHubWebBase(repository?.url);

/**
 * Second element of Playwright's `['allure-playwright', options]` reporter tuple.
 * Kept in a dedicated module so `playwright.config.ts` stays declarative.
 */
export const allurePlaywrightReporterOptions = {
  resultsDir: 'allure-results',
  detail: true,
  suiteTitle: true,
  environmentInfo: buildRunEnvironmentMetadata(),
  ...(githubRepoBase
    ? {
        links: {
          issue: {
            nameTemplate: 'Issue #%s',
            urlTemplate: `${githubRepoBase}/issues/%s`,
          },
        },
      }
    : {}),
} as const;

export const allurePlaywrightReporter = [
  'allure-playwright',
  allurePlaywrightReporterOptions,
] as const;
