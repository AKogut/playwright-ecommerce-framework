import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@po/base.page';

export type CheckoutData = {
  firstName: string;
  lastName: string;
  postalCode: string;
};

export class CheckoutPage extends BasePage {
  readonly title: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly finishButton: Locator;
  readonly errorMessage: Locator;
  readonly totalLabel: Locator;
  readonly completeHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.locator('.title');
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.finishButton = page.locator('[data-test="finish"]');
    this.errorMessage = page.locator('[data-test="error"]');
    this.totalLabel = page.locator('[data-test="total-label"]');
    this.completeHeader = page.locator('[data-test="complete-header"]');
  }

  async waitUntilStepOneLoaded(): Promise<void> {
    await this.page.waitForURL(/checkout-step-one\.html/);
    await this.waitForVisible(this.title);
  }

  async fillInformation(data: CheckoutData): Promise<void> {
    await this.fill(this.firstNameInput, data.firstName);
    await this.fill(this.lastNameInput, data.lastName);
    await this.fill(this.postalCodeInput, data.postalCode);
  }

  async continue(): Promise<void> {
    await this.click(this.continueButton);
  }

  async finish(): Promise<void> {
    await this.click(this.finishButton);
  }

  async fillAndContinue(data: CheckoutData): Promise<void> {
    await this.fillInformation(data);
    await this.continue();
  }

  async getErrorMessage(): Promise<string> {
    return this.getText(this.errorMessage);
  }

  async getTotalLabel(): Promise<string> {
    return this.getText(this.totalLabel);
  }

  async waitUntilOverviewLoaded(): Promise<void> {
    await this.page.waitForURL(/checkout-step-two\.html/);
    await this.waitForVisible(this.totalLabel);
  }

  async waitUntilCompleteLoaded(): Promise<void> {
    await this.page.waitForURL(/checkout-complete\.html/);
    await this.waitForVisible(this.completeHeader);
  }
}
