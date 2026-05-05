import type { LoginCredentials } from '@po/login.page';
import { FrameworkError } from '@utils/error-handler';

const requiredEnv = (name: string): string => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new FrameworkError(`[users] Missing required env variable: ${name}`, 'ENV_REQUIRED');
  }

  return value;
};

export const USERS = {
  standard: {
    username: requiredEnv('STANDARD_USER_USERNAME'),
    password: requiredEnv('STANDARD_USER_PASSWORD'),
  },
  locked: {
    username: requiredEnv('LOCKED_USER_USERNAME'),
    password: requiredEnv('LOCKED_USER_PASSWORD'),
  },
  problem: {
    username: requiredEnv('PROBLEM_USER_USERNAME'),
    password: requiredEnv('PROBLEM_USER_PASSWORD'),
  },
  performance: {
    username: requiredEnv('PERFORMANCE_USER_USERNAME'),
    password: requiredEnv('PERFORMANCE_USER_PASSWORD'),
  },
} as const satisfies Record<string, LoginCredentials>;

export type UserKey = keyof typeof USERS;
