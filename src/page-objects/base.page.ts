import type { Locator, Page } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
  }

  async click(target: Locator): Promise<void> {
    await target.click();
  }

  async fill(target: Locator, value: string): Promise<void> {
    await target.fill(value);
  }

  async getText(target: Locator): Promise<string> {
    return (await target.innerText()).trim();
  }

  async waitForVisible(target: Locator): Promise<void> {
    await target.waitFor({ state: 'visible' });
  }
}
