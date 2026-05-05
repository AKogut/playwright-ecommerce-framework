import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@po/base.page';
import { cartSelectors } from '@selectors/cart.selectors';
import { toProductSlug } from '@utils/product-name.util';

export class CartPage extends BasePage {
  readonly root: Locator;
  readonly title: Locator;
  readonly itemNames: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.locator(cartSelectors.root);
    this.title = page.locator(cartSelectors.title);
    this.itemNames = page.locator(cartSelectors.itemNames);
    this.checkoutButton = page.locator(cartSelectors.checkoutButton);
  }

  async waitUntilLoaded(): Promise<void> {
    await this.page.waitForURL(/cart\.html/);
    await this.waitForVisible(this.title);
  }

  private cartItemByName(productName: string): Locator {
    return this.itemNames.filter({ hasText: productName });
  }

  private removeButton(productName: string): Locator {
    return this.page.locator(cartSelectors.removeButton(toProductSlug(productName)));
  }

  productNameItem(productName: string): Locator {
    return this.cartItemByName(productName);
  }

  async removeProduct(productName: string): Promise<void> {
    await this.click(this.removeButton(productName));
  }

  async getItemNames(): Promise<string[]> {
    const names = await this.itemNames.allInnerTexts();
    return names.map((name) => name.trim());
  }

  async proceedToCheckout(): Promise<void> {
    await this.click(this.checkoutButton);
  }
}
