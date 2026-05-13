import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { formatErrorMessage } from '@utils/error-handler';
import { logger } from '@utils/logger';

const RUN_METADATA_PATH = path.join(process.cwd(), 'test-results', '.run-metadata.json');

type RunMetadata = {
  startedAt: string;
  baseUrl: string;
} & Record<string, string | undefined>;

const globalTeardown = async (): Promise<void> => {
  let runMetadata: RunMetadata;
  try {
    const metadataFileContent = await readFile(RUN_METADATA_PATH, 'utf-8');
    runMetadata = JSON.parse(metadataFileContent) as RunMetadata;
  } catch (error) {
    logger.warn('Run metadata not found. Teardown completed.', {
      error: formatErrorMessage(error),
    });
    return;
  }

  const finishedAt = new Date();
  const startedAtDate = new Date(runMetadata.startedAt);
  const durationMs = Math.max(0, finishedAt.getTime() - startedAtDate.getTime());

  const workflowRun =
    runMetadata.github_repository && runMetadata.github_run_id
      ? `${runMetadata.github_repository}#${runMetadata.github_run_id}`
      : undefined;

  logger.info('Run finished', {
    finishedAt: finishedAt.toISOString(),
    durationSec: Number((durationMs / 1000).toFixed(2)),
    baseUrl: runMetadata.baseUrl,
    ...(workflowRun ? { workflowRun } : {}),
    ...(runMetadata.github_sha ? { commit: runMetadata.github_sha.slice(0, 7) } : {}),
  });
};

export default globalTeardown;
