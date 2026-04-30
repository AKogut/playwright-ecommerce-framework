import { test, expect } from '@fx/ui';

test('locked out user cannot log in @regression', async ({ loginPage, users }) => {
  await loginPage.open();
  await loginPage.loginAs(users.locked);
  await expect(await loginPage.getErrorMessageText()).toContain(
    'Sorry, this user has been locked out.',
  );
});
