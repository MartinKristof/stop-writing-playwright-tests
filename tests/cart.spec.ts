// spec: spec/cart.md
// section: 1. Add Two Products, Verify Badge, Verify Cart Contents, Remove One Item
// pom: tests/pages/InventoryPage.ts, tests/pages/CartPage.ts

import { test } from '@playwright/test';
import { InventoryPage } from './pages/InventoryPage';
import { CartPage } from './pages/CartPage';

test.describe('Shopping Cart', () => {
  test('Add Two Products, Verify Badge, Verify Cart Contents, Remove One Item', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    await inventoryPage.goto();
    await inventoryPage.waitForLoad();

    // 1. On the inventory page, locate the "Sauce Labs Backpack" product tile and click its "Add to cart" button.
    await inventoryPage.addProductToCartByName('Sauce Labs Backpack');
    await inventoryPage.expectProductInCart('Sauce Labs Backpack');
    await inventoryPage.expectCartBadgeCount(1);

    // 2. Locate the "Sauce Labs Bike Light" product tile and click its "Add to cart" button.
    await inventoryPage.addProductToCartByName('Sauce Labs Bike Light');
    await inventoryPage.expectProductInCart('Sauce Labs Bike Light');

    // 3. Observe the shopping cart badge in the header.
    await inventoryPage.expectCartBadgeCount(2);

    // 4. Click the shopping cart link to navigate to the cart page.
    await inventoryPage.clickShoppingCart();
    await cartPage.expectPageLoaded();

    // 5. On the cart page, inspect the list of cart items.
    await cartPage.expectItemCount(2);
    await cartPage.expectItemInCart('Sauce Labs Backpack');
    await cartPage.expectItemDetails('Sauce Labs Backpack', '$29.99', '1');
    await cartPage.expectItemInCart('Sauce Labs Bike Light');
    await cartPage.expectItemDetails('Sauce Labs Bike Light', '$9.99', '1');

    // 6. Click the "Remove" button for "Sauce Labs Backpack".
    await cartPage.removeItemByName('Sauce Labs Backpack');
    await cartPage.expectItemNotInCart('Sauce Labs Backpack');

    // 7. Re-inspect the cart page contents and the shopping cart badge.
    await cartPage.expectItemCount(1);
    await cartPage.expectItemInCart('Sauce Labs Bike Light');
    await cartPage.expectItemDetails('Sauce Labs Bike Light', '$9.99', '1');
    await cartPage.expectCartBadgeCount(1);
  });
});
