import { test, expect } from '@fx/ui';

test('user can add a product to cart @smoke', async ({
  auth,
  productsPage,
  cartPage,
  products,
}) => {
  await auth.loginAsStandardUser();
  await productsPage.addProductToCart(products.backpack);
  await productsPage.openCart();
  await expect(cartPage.productNameItem(products.backpack)).toBeVisible();
});
