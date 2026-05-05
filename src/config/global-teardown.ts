import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { formatErrorMessage } from '@utils/error-handler';
import { logger } from '@utils/logger';

const RUN_METADATA_PATH = path.join(process.cwd(), 'test-results', '.run-metadata.json');

type RunMetadata = {
  startedAt: string;
  baseUrl: string;
};

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

  logger.info('Run finished', {
    finishedAt: finishedAt.toISOString(),
    durationSec: Number((durationMs / 1000).toFixed(2)),
    baseUrl: runMetadata.baseUrl,
  });
};

export default globalTeardown;
