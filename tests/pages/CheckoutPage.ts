import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object Model for the Sauce Demo checkout pages.
 *
 * This class encapsulates all interactions and assertions related to the checkout flow,
 * including checkout information entry and order confirmation.
 */
export class CheckoutPage extends BasePage {
  // Locators - Checkout Information Step
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;

  // Locators - Checkout Overview Step
  readonly finishButton: Locator;
  readonly cancelButtonOverview: Locator;

  // Locators - Checkout Complete Step
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);
    // Checkout Information
    this.firstNameInput = page.getByTestId('firstName');
    this.lastNameInput = page.getByTestId('lastName');
    this.postalCodeInput = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.cancelButton = page.getByTestId('cancel');

    // Checkout Overview
    this.finishButton = page.getByTestId('finish');
    this.cancelButtonOverview = page.getByTestId('cancel');

    // Checkout Complete
    this.completeHeader = page.locator('.complete-header');
    this.completeText = page.locator('.complete-text');
    this.backHomeButton = page.getByTestId('back-to-products');
  }

  /**
   * Fill in checkout information
   */
  async fillCheckoutInfo(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  /**
   * Click continue button to proceed to checkout overview
   */
  async clickContinue(): Promise<void> {
    await this.continueButton.click();
  }

  /**
   * Click finish button to complete the order
   */
  async clickFinish(): Promise<void> {
    await this.finishButton.click();
  }

  /**
   * Complete the full checkout flow
   */
  async completeCheckout(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.fillCheckoutInfo(firstName, lastName, postalCode);
    await this.clickContinue();
    await this.clickFinish();
  }

  /**
   * Assert that the order confirmation message is visible
   */
  async expectOrderConfirmation(): Promise<void> {
    await expect(this.completeHeader).toHaveText('Thank you for your order!');
  }

  /**
   * Assert that the complete text is visible
   */
  async expectCompleteText(): Promise<void> {
    await expect(this.completeText).toBeVisible();
  }

  /**
   * Click back home button to return to inventory
   */
  async clickBackHome(): Promise<void> {
    await this.backHomeButton.click();
  }
}

