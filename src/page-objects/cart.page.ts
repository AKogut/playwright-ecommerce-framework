import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@po/base.page';
import { toProductSlug } from '@utils/product-name.util';

export class CartPage extends BasePage {
  readonly root: Locator;
  readonly title: Locator;
  readonly itemNames: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.locator('#cart_contents_container');
    this.title = page.locator('.title');
    this.itemNames = page.locator('.inventory_item_name');
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  async waitUntilLoaded(): Promise<void> {
    await this.page.waitForURL(/cart\.html/);
    await this.waitForVisible(this.title);
  }

  private cartItemByName(productName: string): Locator {
    return this.itemNames.filter({ hasText: productName });
  }

  private removeButton(productName: string): Locator {
    return this.page.locator(`[data-test="remove-${toProductSlug(productName)}"]`);
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
