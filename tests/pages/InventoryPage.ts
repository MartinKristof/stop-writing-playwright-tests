import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object Model for the Sauce Demo inventory/products page.
 *
 * This class encapsulates all interactions and assertions related to the inventory page
 * that appears after successful login.
 */
export class InventoryPage extends BasePage {
  // Locators
  readonly pageTitle: Locator;
  readonly burgerMenuButton: Locator;
  readonly productItems: Locator;
  readonly shoppingCartBadge: Locator;
  readonly shoppingCartLink: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByTestId('title');
    this.burgerMenuButton = page.locator('#react-burger-menu-btn');
    this.productItems = page.locator('.inventory_item');
    this.shoppingCartBadge = page.getByTestId('shopping-cart-badge');
    this.shoppingCartLink = page.getByTestId('shopping-cart-link');
  }

  /**
   * Convert a product name to the kebab-case slug used in its data-test attributes,
   * e.g. "Sauce Labs Backpack" -> "sauce-labs-backpack"
   */
  private productSlug(productName: string): string {
    return productName.toLowerCase().replace(/\s+/g, '-');
  }

  /**
   * Navigate to the inventory page
   */
  async goto(): Promise<void> {
    await this.page.goto('/inventory.html');
  }

  /**
   * Wait for the inventory page to load
   */
  async waitForLoad(): Promise<void> {
    await this.page.waitForURL('**/inventory.html');
    await expect(this.pageTitle).toBeVisible();
  }

  /**
   * Assert that the page title shows "Products"
   */
  async expectPageTitle(): Promise<void> {
    await expect(this.pageTitle).toHaveText('Products');
  }

  /**
   * Assert that the burger menu button is visible (indicates authenticated state)
   */
  async expectBurgerMenuVisible(): Promise<void> {
    await expect(this.burgerMenuButton).toBeVisible();
  }

  /**
   * Assert that the page is loaded and user is authenticated
   */
  async expectPageLoaded(): Promise<void> {
    await this.waitForLoad();
    await this.expectPageTitle();
    await this.expectBurgerMenuVisible();
  }

  /**
   * Get the number of products displayed
   */
  async getProductCount(): Promise<number> {
    return await this.productItems.count();
  }

  /**
   * Get the shopping cart badge count (number of items in cart)
   */
  async getCartBadgeCount(): Promise<number> {
    const badgeText = await this.shoppingCartBadge.textContent();
    return badgeText ? parseInt(badgeText, 10) : 0;
  }

  /**
   * Assert that the cart badge shows a specific count
   */
  async expectCartBadgeCount(expectedCount: number): Promise<void> {
    await expect(this.shoppingCartBadge).toHaveText(expectedCount.toString());
  }

  /**
   * Click on a product by index (0-based)
   */
  async clickProduct(index: number): Promise<void> {
    const product = this.productItems.nth(index);
    await product.click();
  }

  /**
   * Click on the shopping cart link
   */
  async clickShoppingCart(): Promise<void> {
    await this.shoppingCartLink.click();
  }

  /**
   * Add a product to cart by index
   */
  async addProductToCart(index: number): Promise<void> {
    const product = this.productItems.nth(index);
    const addToCartButton = product.locator('button').filter({ hasText: 'Add to cart' });
    await addToCartButton.click();
  }

  /**
   * Add a product to cart by its name, e.g. "Sauce Labs Backpack"
   */
  async addProductToCartByName(productName: string): Promise<void> {
    await this.page.getByTestId(`add-to-cart-${this.productSlug(productName)}`).click();
  }

  /**
   * Assert that a product's "Add to cart" button has turned into "Remove",
   * i.e. the product was added to the cart
   */
  async expectProductInCart(productName: string): Promise<void> {
    await expect(this.page.getByTestId(`remove-${this.productSlug(productName)}`)).toBeVisible();
  }

  /**
   * Get the name of a product by index
   */
  async getProductName(index: number): Promise<string> {
    const product = this.productItems.nth(index);
    const productName = product.getByTestId('inventory-item-name');
    const name = await productName.textContent();
    return name ? name.trim() : '';
  }
}
