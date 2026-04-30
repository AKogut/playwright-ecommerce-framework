import { test, expect } from '@fx/ui';

test('checkout validation for missing postal code @regression', async ({
  auth,
  productsPage,
  cartPage,
  checkoutPage,
  products,
  invalidCheckoutData,
}) => {
  await auth.loginAsStandardUser();
  await productsPage.addProductToCart(products.backpack);
  await productsPage.openCart();
  await cartPage.proceedToCheckout();
  await checkoutPage.fillAndContinue(invalidCheckoutData.missingPostalCode);
  await expect(await checkoutPage.getErrorMessage()).toContain('Postal Code is required');
});
