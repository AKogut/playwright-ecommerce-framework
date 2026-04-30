import { test, expect } from '@fx/ui';

test('empty username shows required validation @regression', async ({ loginPage, users }) => {
  await loginPage.open();
  await loginPage.loginWith('', users.standard.password);
  await expect(await loginPage.getErrorMessageText()).toContain('Username is required');
});
