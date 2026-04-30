import { test as base } from '@playwright/test';
import { USERS } from '@data/users';
import { PRODUCTS } from '@data/products';
import {
  INVALID_CHECKOUT_DATA,
  VALID_CHECKOUT_DATA,
  createRandomCheckoutData,
} from '@data/checkout.data';
import type { CheckoutData } from '@po/checkout.page';

type DataFixtures = {
  users: typeof USERS;
  products: typeof PRODUCTS;
  validCheckoutData: CheckoutData;
  invalidCheckoutData: typeof INVALID_CHECKOUT_DATA;
  checkoutDataFactory: (overrides?: Partial<CheckoutData>) => Promise<CheckoutData>;
};

export const test = base.extend<DataFixtures>({
  users: async ({ browserName }, use) => {
    void browserName;
    await use(USERS);
  },
  products: async ({ browserName }, use) => {
    void browserName;
    await use(PRODUCTS);
  },
  validCheckoutData: async ({ browserName }, use) => {
    void browserName;
    await use(VALID_CHECKOUT_DATA);
  },
  invalidCheckoutData: async ({ browserName }, use) => {
    void browserName;
    await use(INVALID_CHECKOUT_DATA);
  },
  checkoutDataFactory: async ({ browserName }, use) => {
    void browserName;
    await use(createRandomCheckoutData);
  },
});
