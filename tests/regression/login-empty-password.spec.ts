import { test, expect } from '@fx/ui';

test('empty password shows required validation @regression', async ({ loginPage, users }) => {
  await loginPage.open();
  await loginPage.loginWith(users.standard.username, '');
  await expect(await loginPage.getErrorMessageText()).toContain('Password is required');
});
