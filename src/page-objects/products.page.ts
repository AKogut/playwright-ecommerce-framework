import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@po/base.page';
import { toProductSlug } from '@utils/product-name.util';

export class ProductsPage extends BasePage {
  readonly root: Locator;
  readonly title: Locator;
  readonly inventoryList: Locator;
  readonly inventoryItems: Locator;
  readonly cartLink: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.locator('#inventory_container');
    this.title = page.locator('.title');
    this.inventoryList = page.locator('.inventory_list');
    this.inventoryItems = page.locator('.inventory_item');
    this.cartLink = page.locator('.shopping_cart_link');
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
  }

  async waitUntilLoaded(): Promise<void> {
    await this.page.waitForURL(/inventory\.html/);
    await this.waitForVisible(this.title);
    await this.waitForVisible(this.inventoryList);
  }

  async getProductItemsCount(): Promise<number> {
    return this.inventoryItems.count();
  }

  private addToCartButton(productName: string): Locator {
    return this.page.locator(`[data-test="add-to-cart-${toProductSlug(productName)}"]`);
  }

  private removeFromCartButton(productName: string): Locator {
    return this.page.locator(`[data-test="remove-${toProductSlug(productName)}"]`);
  }

  async addProductToCart(productName: string): Promise<void> {
    await this.click(this.addToCartButton(productName));
  }

  async addProductsToCart(productNames: string[]): Promise<void> {
    for (const productName of productNames) {
      await this.addProductToCart(productName);
    }
  }

  async removeProductFromCart(productName: string): Promise<void> {
    await this.click(this.removeFromCartButton(productName));
  }

  async openCart(): Promise<void> {
    await this.click(this.cartLink);
  }

  async openMenu(): Promise<void> {
    await this.click(this.menuButton);
    await this.waitForVisible(this.logoutLink);
  }

  async logout(): Promise<void> {
    await this.openMenu();
    await this.click(this.logoutLink);
  }
}
