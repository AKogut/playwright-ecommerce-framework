import { test, expect } from '@fx/ui';

test('problem user can log in and open products page @regression', async ({
  loginPage,
  productsPage,
  users,
}) => {
  await loginPage.open();
  await loginPage.loginAs(users.problem);
  await productsPage.waitUntilLoaded();
  await expect(productsPage.page).toHaveURL(/inventory\.html/);
  await expect(productsPage.title).toHaveText('Products');
});
