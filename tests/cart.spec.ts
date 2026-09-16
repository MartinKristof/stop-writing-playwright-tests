// spec: spec/cart.md
// section: 1. Shopping Cart
// pom: tests/pages/LoginPage.ts, tests/pages/InventoryPage.ts, tests/pages/CartPage.ts

import { test } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { InventoryPage } from './pages/InventoryPage';
import { CartPage } from './pages/CartPage';

test.describe('Shopping Cart', () => {
  test('Add Two Products, Verify Badge and Listing, Remove One, Keep the Other', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    // 1. Sign in as standard_user (password secret_sauce) and land on the Products page.
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.expectPageLoaded();

    // 2. Add "Sauce Labs Backpack" to the cart from the Products page.
    await inventoryPage.addProductToCartByName('Sauce Labs Backpack');

    // 3. Verify the cart badge in the header shows 1.
    await inventoryPage.expectCartBadgeCount(1);

    // 4. Add "Sauce Labs Bike Light" to the cart from the Products page.
    await inventoryPage.addProductToCartByName('Sauce Labs Bike Light');

    // 5. Verify the cart badge in the header shows 2.
    await inventoryPage.expectCartBadgeCount(2);

    // 6. Open the cart page via the cart icon.
    await inventoryPage.clickShoppingCart();

    // 7. Verify the cart page URL is /cart.html and its header reads "Your Cart".
    await cartPage.expectPageLoaded();

    // 8. Verify the cart lists exactly 2 items.
    await cartPage.expectItemCount(2);

    // 9. Verify "Sauce Labs Backpack" appears in the cart with its price ($29.99) and quantity (1).
    await cartPage.expectItemDetails('Sauce Labs Backpack', '$29.99', '1');

    // 10. Verify "Sauce Labs Bike Light" appears in the cart with its price ($9.99) and quantity (1).
    await cartPage.expectItemDetails('Sauce Labs Bike Light', '$9.99', '1');

    // 11. Remove "Sauce Labs Backpack" from the cart page.
    await cartPage.removeItemByName('Sauce Labs Backpack');

    // 12. Verify the cart lists exactly 1 item.
    await cartPage.expectItemCount(1);

    // 13. Verify "Sauce Labs Backpack" is no longer present in the cart.
    await cartPage.expectItemNotInCart('Sauce Labs Backpack');

    // 14. Verify "Sauce Labs Bike Light" is still present in the cart, with its price and quantity unchanged.
    await cartPage.expectItemInCart('Sauce Labs Bike Light');
    await cartPage.expectItemDetails('Sauce Labs Bike Light', '$9.99', '1');

    // 15. Verify the cart badge now shows 1.
    await cartPage.expectCartBadgeCount(1);
  });
});
