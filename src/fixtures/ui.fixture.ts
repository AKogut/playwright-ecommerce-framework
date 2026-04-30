import { expect } from '@playwright/test';
import { test as authTest } from '@fx/ui/auth.fixture';

export const test = authTest;
export { expect };
