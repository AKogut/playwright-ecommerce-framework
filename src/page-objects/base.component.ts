import type { Locator, Page } from '@playwright/test';

export class BaseComponent {
  readonly page: Page;
  readonly root: Locator;

  constructor(page: Page, root: Locator) {
    this.page = page;
    this.root = root;
  }

  locator(selector: string): Locator {
    return this.root.locator(selector);
  }

  dataTest(id: string): Locator {
    return this.root.locator('[data-test="' + id + '"]');
  }

  async click(target: Locator): Promise<void> {
    await target.click();
  }

  async fill(target: Locator, value: string): Promise<void> {
    await target.fill(value);
  }

  async waitForVisible(target: Locator): Promise<void> {
    await target.waitFor({ state: 'visible' });
  }
}
