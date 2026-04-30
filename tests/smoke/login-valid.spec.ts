import { test, expect } from '@fx/ui';

test('valid login redirects to products page @smoke @critical', async ({ auth, productsPage }) => {
  await auth.loginAsStandardUser();
  await expect(productsPage.page).toHaveURL(/inventory\.html/);
  await expect(productsPage.title).toHaveText('Products');
});
