import { test, expect } from '@fx/ui';

test('invalid credentials show error @regression', async ({ loginPage, users }) => {
  await loginPage.open();
  await loginPage.loginWith(users.standard.username, 'wrong_password');
  expect(await loginPage.getErrorMessageText()).toContain('Username and password do not match');
});
