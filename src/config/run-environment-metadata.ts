import { createRequire } from 'node:module';
import { platform, release } from 'node:os';
import { join } from 'node:path';

const readPlaywrightTestVersion = (): string => {
  const require = createRequire(join(process.cwd(), 'playwright.config.ts'));
  const { version } = require('./node_modules/@playwright/test/package.json') as {
    version: string;
  };
  return version;
};

const pickDefined = (
  target: Record<string, string>,
  key: string,
  value: string | undefined,
): void => {
  if (value !== undefined && value !== '') {
    target[key] = value;
  }
};

/**
 * Flat string map for Allure "Environment" and `test-results/.run-metadata.json`.
 * Values are safe to persist (no secrets).
 */
export const buildRunEnvironmentMetadata = (): Record<string, string> => {
  const env = process.env;
  const meta: Record<string, string> = {
    os_platform: platform(),
    os_release: release(),
    node_version: process.version,
    playwright_version: readPlaywrightTestVersion(),
    ci: env.CI === 'true' ? 'true' : 'false',
  };

  pickDefined(meta, 'github_repository', env.GITHUB_REPOSITORY);
  pickDefined(meta, 'github_ref_name', env.GITHUB_REF_NAME);
  pickDefined(meta, 'github_sha', env.GITHUB_SHA);
  pickDefined(meta, 'github_workflow', env.GITHUB_WORKFLOW);
  pickDefined(meta, 'github_run_id', env.GITHUB_RUN_ID);
  pickDefined(meta, 'github_run_attempt', env.GITHUB_RUN_ATTEMPT);
  pickDefined(meta, 'github_job', env.GITHUB_JOB);
  pickDefined(meta, 'github_actor', env.GITHUB_ACTOR);
  pickDefined(meta, 'github_event_name', env.GITHUB_EVENT_NAME);

  pickDefined(meta, 'gitlab_project_path', env.CI_PROJECT_PATH);
  pickDefined(meta, 'gitlab_pipeline_id', env.CI_PIPELINE_ID);
  pickDefined(meta, 'gitlab_job_name', env.CI_JOB_NAME);

  return meta;
};
