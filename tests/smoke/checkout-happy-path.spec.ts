import { test, expect } from '@fx/ui';

test('checkout happy path completes order @smoke @critical', async ({
  auth,
  productsPage,
  cartPage,
  checkoutPage,
  products,
  checkoutDataFactory,
}) => {
  await auth.loginAsStandardUser();
  await productsPage.addProductToCart(products.backpack);
  await productsPage.openCart();
  await cartPage.proceedToCheckout();
  await checkoutPage.waitUntilStepOneLoaded();
  await expect(checkoutPage.title).toHaveText('Checkout: Your Information');
  const checkoutData = await checkoutDataFactory();
  await checkoutPage.fillAndContinue(checkoutData);
  await checkoutPage.waitUntilOverviewLoaded();
  await expect(await checkoutPage.getTotalLabel()).toContain('Total:');
  await checkoutPage.finish();
  await checkoutPage.waitUntilCompleteLoaded();
  await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
});
