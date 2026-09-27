// spec: spec/cart.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';
import { CartPage, InventoryPage, LoginPage } from './pages';

const USER_NAME = process.env.USER_NAME || 'standard_user';
const PASSWORD = process.env.PASSWORD || 'secret_sauce';

const BACKPACK = 'Sauce Labs Backpack';
const BIKE_LIGHT = 'Sauce Labs Bike Light';

test.describe('Shopping cart', () => {
  test('should list both added products and keep the other after removal', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    // 1. Sign in as standard_user and land on the products page
    await loginPage.goto();
    await loginPage.login(USER_NAME, PASSWORD);
    await inventoryPage.expectPageLoaded();

    // 2. Add "Sauce Labs Backpack" to the cart
    await inventoryPage.addProductToCartByName(BACKPACK);
    await inventoryPage.expectProductInCart(BACKPACK);

    // 3. Add "Sauce Labs Bike Light" to the cart
    await inventoryPage.addProductToCartByName(BIKE_LIGHT);
    await inventoryPage.expectProductInCart(BIKE_LIGHT);
    await inventoryPage.expectCartBadgeCount(2);

    // 4. Open the cart from the header
    await inventoryPage.clickShoppingCart();
    await cartPage.expectPageLoaded();
    await expect(cartPage.cartItemNames).toHaveText([BACKPACK, BIKE_LIGHT]);
    await cartPage.expectItemDetails(BACKPACK, '$29.99', '1');
    await cartPage.expectItemDetails(BIKE_LIGHT, '$9.99', '1');

    // 5. Remove "Sauce Labs Backpack" from the cart
    await cartPage.removeItemByName(BACKPACK);
    await expect(cartPage.cartItemNames).toHaveText([BIKE_LIGHT]);
    await cartPage.expectCartBadgeCount(1);
  });
});
