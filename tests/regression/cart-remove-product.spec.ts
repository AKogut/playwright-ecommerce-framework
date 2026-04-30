import { test, expect } from '@fx/ui';

test('remove product from cart @regression', async ({ auth, productsPage, cartPage, products }) => {
  await auth.loginAsStandardUser();
  await productsPage.addProductToCart(products.backpack);
  await productsPage.openCart();
  await cartPage.removeProduct(products.backpack);
  const names = await cartPage.getItemNames();
  expect(names).not.toContain(products.backpack);
});
