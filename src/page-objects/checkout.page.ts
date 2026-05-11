import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@po/base.page';
import { checkoutSelectors } from '@selectors/checkout.selectors';

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
  readonly itemTotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly completeHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.locator(checkoutSelectors.title);
    this.firstNameInput = page.locator(checkoutSelectors.firstNameInput);
    this.lastNameInput = page.locator(checkoutSelectors.lastNameInput);
    this.postalCodeInput = page.locator(checkoutSelectors.postalCodeInput);
    this.continueButton = page.locator(checkoutSelectors.continueButton);
    this.finishButton = page.locator(checkoutSelectors.finishButton);
    this.errorMessage = page.locator(checkoutSelectors.errorMessage);
    this.itemTotalLabel = page.locator(checkoutSelectors.itemTotalLabel);
    this.taxLabel = page.locator(checkoutSelectors.taxLabel);
    this.totalLabel = page.locator(checkoutSelectors.totalLabel);
    this.completeHeader = page.locator(checkoutSelectors.completeHeader);
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

  async getItemTotalAmount(): Promise<number> {
    return this.extractAmount(await this.getText(this.itemTotalLabel));
  }

  async getSubtotalAmount(): Promise<number> {
    return this.getItemTotalAmount();
  }

  async getTaxAmount(): Promise<number> {
    return this.extractAmount(await this.getText(this.taxLabel));
  }

  async getTotalAmount(): Promise<number> {
    return this.extractAmount(await this.getText(this.totalLabel));
  }

  async waitUntilOverviewLoaded(): Promise<void> {
    await this.page.waitForURL(/checkout-step-two\.html/);
    await this.waitForVisible(this.totalLabel);
  }

  async waitUntilCompleteLoaded(): Promise<void> {
    await this.page.waitForURL(/checkout-complete\.html/);
    await this.waitForVisible(this.completeHeader);
  }

  private extractAmount(label: string): number {
    const match = label.match(/\$([0-9]+(?:\.[0-9]{2})?)/);
    if (!match) {
      throw new Error(`Unable to parse money amount from checkout label: "${label}"`);
    }
    return Number.parseFloat(match[1]);
  }
}
