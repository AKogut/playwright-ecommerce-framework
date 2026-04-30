import { test as base } from '@playwright/test';
import { LoginPage } from '@po/login.page';
import { ProductsPage } from '@po/products.page';
import { CartPage } from '@po/cart.page';
import { CheckoutPage } from '@po/checkout.page';

type PagesFixtures = {
  loginPage: LoginPage;
  productsPage: ProductsPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
};

export const test = base.extend<PagesFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
});
