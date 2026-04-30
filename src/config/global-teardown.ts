import { readFile } from 'node:fs/promises';
import path from 'node:path';

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
  } catch {
    console.log('[global-teardown] Run metadata not found. Teardown completed.');
    return;
  }

  const finishedAt = new Date();
  const startedAtDate = new Date(runMetadata.startedAt);
  const durationMs = Math.max(0, finishedAt.getTime() - startedAtDate.getTime());

  console.log(
    `[global-teardown] Run finished at ${finishedAt.toISOString()}; duration: ${(durationMs / 1000).toFixed(2)}s; baseURL: ${runMetadata.baseUrl}`,
  );
};

export default globalTeardown;
