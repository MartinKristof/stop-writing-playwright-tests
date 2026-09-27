# SauceDemo - Test Plan: Shopping Cart

## Application Overview

SauceDemo (`https://www.saucedemo.com/`) is a demo e-commerce site used for Playwright training and
testing. A signed-in user lands on the Products (inventory) page, where each of the six product cards
has an "Add to cart" button. Adding a product swaps that button for a "Remove" button and increments a
badge on the cart icon in the header (`data-test="shopping-cart-badge"`), which is only rendered while
the cart holds at least one item. Clicking the cart icon (`data-test="shopping-cart-link"`) opens
`/cart.html`, which lists one row per product showing quantity, name, description, price, and its own
"Remove" button (`data-test="remove-<product-slug>"`). Removing a row deletes it immediately, no
confirmation, and updates the header badge to match.

## Existing Coverage

There are currently no spec files under `tests/` (only page objects). `tests/pages/CartPage.ts` and
`tests/pages/InventoryPage.ts` already expose everything this scenario needs: adding a product by name
or index, reading the cart badge count on both the inventory and cart pages, listing cart item names,
removing an item by name or index, and asserting a row's price/quantity/remove-button state. The
scenario below is written to be implementable entirely with those existing methods; no new page object
methods should be required.

Login as its own scenario, checkout, product sorting, and the burger menu are explicitly out of scope
and are not referenced beyond the minimal sign-in step needed to reach the cart.

## Test Scenarios

### 1. Shopping Cart

#### 1.1 Add Two Products, Verify Badge and Listing, Remove One, Keep the Other

**Starting State:** No active session.

**Steps:**
1. Sign in as `standard_user` (password `secret_sauce`) and land on the Products page.
2. Add "Sauce Labs Backpack" to the cart from the Products page.
3. Verify the cart badge in the header shows `1`.
4. Add "Sauce Labs Bike Light" to the cart from the Products page.
5. Verify the cart badge in the header shows `2`.
6. Open the cart page via the cart icon.
7. Verify the cart page URL is `/cart.html` and its header reads "Your Cart".
8. Verify the cart lists exactly 2 items.
9. Verify "Sauce Labs Backpack" appears in the cart with its price (`$29.99`) and quantity (`1`).
10. Verify "Sauce Labs Bike Light" appears in the cart with its price (`$9.99`) and quantity (`1`).
11. Remove "Sauce Labs Backpack" from the cart page.
12. Verify the cart lists exactly 1 item.
13. Verify "Sauce Labs Backpack" is no longer present in the cart.
14. Verify "Sauce Labs Bike Light" is still present in the cart, with its price and quantity unchanged.
15. Verify the cart badge now shows `1`.

**Expected Results:**
- After each add, the header badge count matches the number of items added so far.
- The cart page shows one row per added product with the correct name, price, and quantity.
- Removing a product deletes only that row; the remaining product's row, price, and quantity are
  unaffected.
- The header badge count reflects the removal (drops from `2` to `1`) without a page reload.

**Success Criteria:** All fifteen verifications pass in sequence within a single test run.

**Failure Conditions:** Badge count does not match the number of items in the cart at any step; a
removed product's row still appears on the cart page; the remaining product's row, price, or quantity
changes after the unrelated removal; the cart page fails to list both products before the removal step.
