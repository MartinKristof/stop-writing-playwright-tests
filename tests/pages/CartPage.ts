import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object Model for the Sauce Demo shopping cart page.
 *
 * This class encapsulates all interactions and assertions related to the cart page.
 */
export class CartPage extends BasePage {
  // Locators
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;
  readonly cartItems: Locator;
  readonly cartItemNames: Locator;
  readonly pageTitle: Locator;
  readonly shoppingCartBadge: Locator;

  constructor(page: Page) {
    super(page);
    this.checkoutButton = page.getByTestId('checkout');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
    this.cartItems = page.locator('.cart_item');
    this.cartItemNames = page.locator('.inventory_item_name');
    this.pageTitle = page.getByTestId('title');
    this.shoppingCartBadge = page.getByTestId('shopping-cart-badge');
  }

  /**
   * Convert a product name to the kebab-case slug used in its data-test attributes,
   * e.g. "Sauce Labs Backpack" -> "sauce-labs-backpack"
   */
  private productSlug(productName: string): string {
    return productName.toLowerCase().replace(/\s+/g, '-');
  }

  /**
   * Navigate to the cart page
   */
  async goto(): Promise<void> {
    await this.page.goto('/cart.html');
  }

  /**
   * Assert that the cart page is loaded, i.e. the URL and the page title match
   */
  async expectPageLoaded(): Promise<void> {
    await this.page.waitForURL('**/cart.html');
    await expect(this.pageTitle).toHaveText('Your Cart');
  }

  /**
   * Assert that the shopping cart badge shows a specific count
   */
  async expectCartBadgeCount(expectedCount: number): Promise<void> {
    await expect(this.shoppingCartBadge).toHaveText(expectedCount.toString());
  }

  /**
   * Click the checkout button
   */
  async clickCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }

  /**
   * Click the continue shopping button
   */
  async clickContinueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  /**
   * Get the number of items in the cart
   */
  async getItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  /**
   * Get the names of all items in the cart
   */
  async getItemNames(): Promise<string[]> {
    const names: string[] = [];
    const count = await this.cartItemNames.count();
    for (let i = 0; i < count; i++) {
      const name = await this.cartItemNames.nth(i).textContent();
      if (name) {
        names.push(name);
      }
    }
    return names;
  }

  /**
   * Remove an item from cart by index
   */
  async removeItem(index: number): Promise<void> {
    const item = this.cartItems.nth(index);
    const removeButton = item.getByRole('button', { name: 'Remove' });
    await removeButton.click();
  }

  /**
   * Remove an item from the cart by its name, e.g. "Sauce Labs Backpack"
   */
  async removeItemByName(productName: string): Promise<void> {
    await this.page.getByTestId(`remove-${this.productSlug(productName)}`).click();
  }

  /**
   * Assert that the cart contains a specific number of items
   */
  async expectItemCount(expectedCount: number): Promise<void> {
    const actualCount = await this.getItemCount();
    expect(actualCount).toBe(expectedCount);
  }

  /**
   * Assert that the cart contains a specific item by name
   */
  async expectItemInCart(itemName: string): Promise<void> {
    const itemNames = await this.getItemNames();
    expect(itemNames).toContain(itemName);
  }

  /**
   * Assert that the cart does NOT contain a specific item by name
   */
  async expectItemNotInCart(itemName: string): Promise<void> {
    const itemNames = await this.getItemNames();
    expect(itemNames).not.toContain(itemName);
  }

  /**
   * Assert that a cart item row shows the expected price and quantity
   */
  async expectItemDetails(productName: string, price: string, quantity: string): Promise<void> {
    const row = this.cartItems.filter({ hasText: productName });
    await expect(row.getByTestId('inventory-item-price')).toHaveText(price);
    await expect(row.getByTestId('item-quantity')).toHaveText(quantity);
    await expect(row.getByTestId(`remove-${this.productSlug(productName)}`)).toBeVisible();
  }
}
