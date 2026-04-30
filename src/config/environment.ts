import { config as dotenvConfig } from 'dotenv';

// Single environment setup for this framework.
dotenvConfig();

const toPositiveNumber = (value: string | undefined, fallback: number): number => {
  const numericValue = Number(value);

  if (Number.isFinite(numericValue) && numericValue > 0) {
    return numericValue;
  }

  return fallback;
};

export const frameworkConfig = {
  baseUrl: process.env.BASE_URL ?? 'https://www.saucedemo.com/',
  globalTimeoutMs: toPositiveNumber(process.env.GLOBAL_TIMEOUT_MS, 10 * 60 * 1000),
  testTimeoutMs: toPositiveNumber(process.env.TEST_TIMEOUT_MS, 30 * 1000),
  expectTimeoutMs: toPositiveNumber(process.env.EXPECT_TIMEOUT_MS, 5 * 1000),
};
