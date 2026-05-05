import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@po/base.page';
import { loginSelectors } from '@selectors/login.selectors';

export type LoginCredentials = {
  username: string;
  password: string;
};

export class LoginPage extends BasePage {
  readonly root: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.locator(loginSelectors.root);
    this.usernameInput = page.locator(loginSelectors.usernameInput);
    this.passwordInput = page.locator(loginSelectors.passwordInput);
    this.loginButton = page.locator(loginSelectors.loginButton);
    this.errorMessage = page.locator(loginSelectors.errorMessage);
  }

  async open(): Promise<void> {
    await this.goto('/');
    await this.waitUntilLoaded();
  }

  async waitUntilLoaded(): Promise<void> {
    await this.waitForVisible(this.loginButton);
  }

  async loginAs(credentials: LoginCredentials): Promise<void> {
    await this.fill(this.usernameInput, credentials.username);
    await this.fill(this.passwordInput, credentials.password);
    await this.click(this.loginButton);
  }

  async loginWith(username: string, password: string): Promise<void> {
    await this.loginAs({ username, password });
  }

  async getErrorMessageText(): Promise<string> {
    return this.getText(this.errorMessage);
  }
}
