import { test, expect } from '@fx/ui';

test('checkout overview total equals item total plus tax @regression', async ({
  auth,
  productsPage,
  cartPage,
  checkoutPage,
  products,
  validCheckoutData,
}) => {
  await auth.loginAsStandardUser();
  await productsPage.addProductsToCart([products.backpack, products.bikeLight]);
  await productsPage.openCart();
  await cartPage.proceedToCheckout();
  await checkoutPage.fillAndContinue(validCheckoutData);
  await checkoutPage.waitUntilOverviewLoaded();

  const subtotal = await checkoutPage.getSubtotalAmount();
  const tax = await checkoutPage.getTaxAmount();
  const total = await checkoutPage.getTotalAmount();
  const expectedTotal = Number((subtotal + tax).toFixed(2));

  expect(total).toBe(expectedTotal);
});
