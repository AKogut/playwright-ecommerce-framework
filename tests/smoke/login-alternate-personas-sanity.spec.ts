import { test, expect } from '@fx/ui';

test('alternate personas can log in and log out @smoke', async ({
  loginPage,
  productsPage,
  users,
}) => {
  const alternateUsers = [users.problem, users.performance];

  for (const user of alternateUsers) {
    await loginPage.open();
    await loginPage.loginAs(user);
    await productsPage.waitUntilLoaded();
    await expect(productsPage.page).toHaveURL(/inventory\.html/);
    await expect(productsPage.title).toHaveText('Products');
    await productsPage.logout();
    await loginPage.waitUntilLoaded();
  }
});
