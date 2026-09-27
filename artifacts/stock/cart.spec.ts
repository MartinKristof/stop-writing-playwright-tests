// spec: spec/cart.md

import { test, expect } from '@playwright/test';

test.describe('SauceDemo Shopping Cart', () => {
  test('Add two products to the cart, verify the cart badge and cart page, then remove one product', async ({ page }) => {
    // Setup: sign in and land on the inventory page.
    await page.goto('https://www.saucedemo.com/');
    await page.getByTestId('username').fill('standard_user');
    await page.getByTestId('password').fill('secret_sauce');
    await page.getByTestId('login-button').click();
    await expect(page).toHaveURL(/\/inventory\.html$/);

    const cartBadge = page.getByTestId('shopping-cart-badge');

    // 1. On the inventory page, confirm the header cart icon has no badge, i.e. the cart starts empty.
    await expect(cartBadge).toHaveCount(0);

    // 2. Click [data-test="add-to-cart-sauce-labs-backpack"] to add "Sauce Labs Backpack" to the cart.
    await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
    await expect(page.getByTestId('remove-sauce-labs-backpack')).toBeVisible();
    await expect(cartBadge).toHaveText('1');

    // 3. Click [data-test="add-to-cart-sauce-labs-bike-light"] to add "Sauce Labs Bike Light" to the cart.
    await page.getByTestId('add-to-cart-sauce-labs-bike-light').click();
    await expect(page.getByTestId('remove-sauce-labs-bike-light')).toBeVisible();
    await expect(cartBadge).toHaveText('2');

    // 4. Click the cart icon [data-test="shopping-cart-link"] to navigate to the cart page.
    await page.getByTestId('shopping-cart-link').click();
    await expect(page).toHaveURL(/\/cart\.html$/);
    await expect(page.getByTestId('title')).toHaveText('Your Cart');
    await expect(cartBadge).toHaveText('2');

    // 5. On the cart page, verify there are exactly two item rows.
    const cartItems = page.getByTestId('inventory-item');
    await expect(cartItems).toHaveCount(2);

    const backpackRow = cartItems.filter({ hasText: 'Sauce Labs Backpack' });
    await expect(backpackRow.getByTestId('inventory-item-name')).toHaveText('Sauce Labs Backpack');
    await expect(backpackRow.getByTestId('item-quantity')).toHaveText('1');
    await expect(backpackRow.getByTestId('remove-sauce-labs-backpack')).toBeVisible();

    const bikeLightRow = cartItems.filter({ hasText: 'Sauce Labs Bike Light' });
    await expect(bikeLightRow.getByTestId('inventory-item-name')).toHaveText('Sauce Labs Bike Light');
    await expect(bikeLightRow.getByTestId('item-quantity')).toHaveText('1');
    await expect(bikeLightRow.getByTestId('remove-sauce-labs-bike-light')).toBeVisible();

    // 6. Click [data-test="remove-sauce-labs-backpack"] on the cart page to remove the backpack.
    await page.getByTestId('remove-sauce-labs-backpack').click();
    await expect(cartItems).toHaveCount(1);
    await expect(cartItems.getByTestId('inventory-item-name')).toHaveText('Sauce Labs Bike Light');
    await expect(page.getByTestId('remove-sauce-labs-bike-light')).toBeVisible();
    await expect(cartBadge).toHaveText('1');
    await expect(page.getByText('Sauce Labs Backpack')).toHaveCount(0);
  });
});
