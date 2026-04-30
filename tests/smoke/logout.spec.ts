import { test, expect } from '@fx/ui';

test('user can logout from products page @smoke', async ({ auth, productsPage, loginPage }) => {
  await auth.loginAsStandardUser();
  await productsPage.logout();
  await loginPage.waitUntilLoaded();
  await expect(loginPage.loginButton).toBeVisible();
});
