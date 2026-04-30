import { test, expect } from '@fx/ui';

test('products list is visible for authorized user @smoke', async ({ auth, productsPage }) => {
  await auth.loginAsStandardUser();
  await expect(await productsPage.getProductItemsCount()).toBe(6);
});
