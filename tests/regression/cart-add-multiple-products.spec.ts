import { test, expect } from '@fx/ui';

test('add multiple products to cart and validate names @regression', async ({
  auth,
  productsPage,
  cartPage,
  products,
}) => {
  await auth.loginAsStandardUser();
  await productsPage.addProductsToCart([products.backpack, products.bikeLight]);
  await productsPage.openCart();
  const names = await cartPage.getItemNames();
  expect(names).toEqual(expect.arrayContaining([products.backpack, products.bikeLight]));
});
