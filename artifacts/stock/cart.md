# SauceDemo Shopping Cart - Test Plan

## Application Overview

SauceDemo (https://www.saucedemo.com/) is a demo e-commerce site used for test-automation
practice. After signing in, a user lands on the inventory page (`/inventory.html`), which lists
six products, each with an "Add to cart" / "Remove" toggle button. The header shows a cart icon
(`[data-test="shopping-cart-link"]`) with a badge (`[data-test="shopping-cart-badge"]`) that
reflects the number of items currently in the cart. Clicking the cart icon navigates to the cart
page (`/cart.html`), which lists the added items with their quantity, description, price, and a
"Remove" button per line item.

This plan covers a single scenario: adding two products to the cart, verifying the header badge
and the cart page contents, and verifying that removing one item leaves the other in the cart.

Login, checkout, the product sort dropdown, and the burger menu are explicitly out of scope.

## Key selectors observed

- Login: `[data-test="username"]`, `[data-test="password"]`, `[data-test="login-button"]`
- Inventory page add-to-cart buttons: `[data-test="add-to-cart-sauce-labs-backpack"]`,
  `[data-test="add-to-cart-sauce-labs-bike-light"]` (each becomes a "Remove" button with
  `[data-test="remove-sauce-labs-backpack"]` / `[data-test="remove-sauce-labs-bike-light"]` once
  the item is in the cart)
- Header cart link: `[data-test="shopping-cart-link"]`
- Header cart badge: `[data-test="shopping-cart-badge"]` (text content is the item count; the
  element is absent from the DOM when the cart is empty)
- Cart page item rows: `[data-test="inventory-item"]` (one per product), each containing
  `[data-test="inventory-item-name"]` for the product name and a `[data-test="item-quantity"]`
  for quantity
- Cart page remove buttons: `[data-test="remove-sauce-labs-backpack"]`,
  `[data-test="remove-sauce-labs-bike-light"]`
- Cart page action buttons: `[data-test="continue-shopping"]`, `[data-test="checkout"]`

## Test Scenario

### 1. Add two products to the cart, verify the cart badge and cart page, then remove one product

**Assumptions:** Fresh browser session, not signed in, starting at `https://www.saucedemo.com/`.

**Setup (precondition, not part of the scenario itself):**

1. Navigate to `https://www.saucedemo.com/`.
2. Fill `[data-test="username"]` with `standard_user`.
3. Fill `[data-test="password"]` with `secret_sauce`.
4. Click `[data-test="login-button"]`.
5. Confirm the browser is on `/inventory.html` (Products page) before proceeding.

**Steps:**

1. On the inventory page, confirm the header cart icon (`[data-test="shopping-cart-link"]`) has
   no badge (`[data-test="shopping-cart-badge"]` is not present), i.e. the cart starts empty.
2. Click `[data-test="add-to-cart-sauce-labs-backpack"]` to add "Sauce Labs Backpack" to the cart.
   - **Expected:** The button's label/state changes to "Remove"
     (`[data-test="remove-sauce-labs-backpack"]` becomes visible in its place). The header badge
     `[data-test="shopping-cart-badge"]` appears and shows `1`.
3. Click `[data-test="add-to-cart-sauce-labs-bike-light"]` to add "Sauce Labs Bike Light" to the
   cart.
   - **Expected:** The button's label/state changes to "Remove"
     (`[data-test="remove-sauce-labs-bike-light"]` becomes visible in its place). The header badge
     `[data-test="shopping-cart-badge"]` updates to show `2`.
4. Click the cart icon `[data-test="shopping-cart-link"]` to navigate to the cart page.
   - **Expected:** The browser navigates to `/cart.html`. The page heading reads "Your Cart". The
     header badge still shows `2`.
5. On the cart page, verify there are exactly two item rows (`[data-test="inventory-item"]`).
   - **Expected:** One row's `[data-test="inventory-item-name"]` reads "Sauce Labs Backpack" and
     the other reads "Sauce Labs Bike Light". Each row shows quantity `1`
     (`[data-test="item-quantity"]`) and a "Remove" button
     (`[data-test="remove-sauce-labs-backpack"]` and `[data-test="remove-sauce-labs-bike-light"]`
     respectively).
6. Click `[data-test="remove-sauce-labs-backpack"]` on the cart page to remove the backpack.
   - **Expected:** The "Sauce Labs Backpack" row disappears from the cart list. Exactly one
     `[data-test="inventory-item"]` row remains, and its
     `[data-test="inventory-item-name"]` reads "Sauce Labs Bike Light". The
     `[data-test="remove-sauce-labs-bike-light"]` button for that row is still present. The header
     badge `[data-test="shopping-cart-badge"]` updates to show `1`.

**Success criteria:** After step 6, the cart contains exactly one item ("Sauce Labs Bike Light"),
the header badge reads `1`, and no trace of "Sauce Labs Backpack" remains in the cart list.

**Failure conditions:** The badge fails to appear or shows an incorrect count at any step; the
cart page lists the wrong products, a wrong quantity, or a wrong number of rows; removing the
backpack also removes or affects the bike light entry; the removed product's row remains visible
in the cart list.
