import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { request, type FullConfig } from '@playwright/test';
import { FrameworkError, formatErrorMessage } from '@utils/error-handler';
import { logger } from '@utils/logger';

const RUN_METADATA_PATH = path.join(process.cwd(), 'test-results', '.run-metadata.json');
const BASE_URL_CHECK_TIMEOUT_MS = 15_000;
const DEFAULT_HEALTHCHECK_RETRIES = 3;
const DEFAULT_HEALTHCHECK_BACKOFF_MS = 2_000;

const toPositiveNumber = (value: string | undefined, fallback: number): number => {
  const numericValue = Number(value);

  if (Number.isFinite(numericValue) && numericValue > 0) {
    return numericValue;
  }

  return fallback;
};

const sleep = async (durationMs: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, durationMs));

const resolveBaseUrl = (config: FullConfig): string => {
  const projectBaseUrl = config.projects[0]?.use.baseURL;

  if (typeof projectBaseUrl === 'string' && projectBaseUrl.trim().length > 0) {
    return projectBaseUrl;
  }

  throw new FrameworkError(
    'Playwright baseURL is missing. Set BASE_URL in your .env file.',
    'BASE_URL_MISSING',
  );
};

const globalSetup = async (config: FullConfig): Promise<void> => {
  const baseUrl = resolveBaseUrl(config);
  const startedAt = new Date().toISOString();
  const shouldSkipHealthCheck = process.env.SKIP_BASE_URL_HEALTHCHECK === 'true';
  const healthCheckRetries = toPositiveNumber(
    process.env.BASE_URL_HEALTHCHECK_RETRIES,
    DEFAULT_HEALTHCHECK_RETRIES,
  );
  const healthCheckBackoffMs = toPositiveNumber(
    process.env.BASE_URL_HEALTHCHECK_BACKOFF_MS,
    DEFAULT_HEALTHCHECK_BACKOFF_MS,
  );

  try {
    new URL(baseUrl);
  } catch {
    throw new FrameworkError(`Invalid BASE_URL value: "${baseUrl}".`, 'BASE_URL_INVALID');
  }

  if (shouldSkipHealthCheck) {
    logger.warn('BASE_URL health check is skipped by SKIP_BASE_URL_HEALTHCHECK=true');
  } else {
    const requestContext = await request.newContext();

    try {
      for (let attempt = 1; attempt <= healthCheckRetries; attempt += 1) {
        try {
          const healthResponse = await requestContext.get(baseUrl, {
            timeout: BASE_URL_CHECK_TIMEOUT_MS,
          });

          if (!healthResponse.ok()) {
            throw new Error(`status ${healthResponse.status()}`);
          }

          break;
        } catch (error) {
          const latestErrorMessage = error instanceof Error ? error.message : String(error);

          if (attempt === healthCheckRetries) {
            throw new FrameworkError(
              `BASE_URL health check failed after ${healthCheckRetries} attempts: ${latestErrorMessage}`,
              'BASE_URL_HEALTHCHECK_FAILED',
              { cause: error },
            );
          }

          await sleep(healthCheckBackoffMs);
        }
      }
    } finally {
      await requestContext.dispose();
    }
  }

  await mkdir(path.dirname(RUN_METADATA_PATH), { recursive: true });
  await writeFile(
    RUN_METADATA_PATH,
    JSON.stringify(
      {
        startedAt,
        baseUrl,
      },
      null,
      2,
    ),
    'utf-8',
  );

  logger.info('Run started', { startedAt, baseUrl });
};

export const runGlobalSetup = async (config: FullConfig): Promise<void> => {
  try {
    await globalSetup(config);
  } catch (error) {
    logger.error('Global setup failed', { error: formatErrorMessage(error) });
    throw error;
  }
};

export default runGlobalSetup;
