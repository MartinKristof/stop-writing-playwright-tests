# Shopping Cart Test Plan

## Application Overview

Swag Labs (SauceDemo) is a storefront. Its products page lists each product with an "Add to cart"
button; pressing it swaps the button for "Remove" and increments a badge on the cart icon in the
header. The cart page at `/cart.html` lists the added products with quantity and price and offers a
"Remove" button per row. This plan covers one cart journey: adding two products, reading the badge,
seeing both rows in the cart, and removing one of them. Login, checkout, sorting and the burger menu
are out of scope, so signing in appears only as the precondition every scenario starts from.

## Test Scenarios

### 1. Shopping cart

**Seed:** `tests/seed.spec.ts`

#### 1.1. should-list-both-added-products-and-keep-the-other-after-removal

**File:** `tests/cart.spec.ts`

**Steps:**
  1. Sign in as `standard_user` and land on the products page
    - expect: the products page is loaded and titled "Products"
  2. Add "Sauce Labs Backpack" to the cart
    - expect: that product's button turns into "Remove"
  3. Add "Sauce Labs Bike Light" to the cart
    - expect: that product's button turns into "Remove"
    - expect: the cart badge shows "2"
  4. Open the cart from the header
    - expect: the cart page is loaded and titled "Your Cart"
    - expect: the cart lists exactly two rows, "Sauce Labs Backpack" then "Sauce Labs Bike Light"
    - expect: the "Sauce Labs Backpack" row shows price "$29.99" and quantity "1"
    - expect: the "Sauce Labs Bike Light" row shows price "$9.99" and quantity "1"
  5. Remove "Sauce Labs Backpack" from the cart
    - expect: the cart lists exactly one row, "Sauce Labs Bike Light"
    - expect: the cart badge shows "1"

## Notes

Observed against `https://www.saucedemo.com/` on 2026-09-16, signed in as `standard_user`.

- The products page and the cart page share one cart badge, `[data-test="shopping-cart-badge"]`. It is
  absent from the DOM while the cart is empty, so an empty cart is asserted by absence, not by "0".
- The cart control carries a live `aria-label` ("Cart, empty", "Cart, 2 items"). The badge text is the
  narrower assertion and is what this plan uses.
- Row locators key off the product name slug (`remove-sauce-labs-backpack`), which the page objects in
  `tests/pages/` already derive.
- `playwright.config.ts` maps `testIdAttribute` to `data-test`, so `getByTestId('title')` resolves.
  A standalone `playwright-cli` session does not read that config and needs `[data-test="..."]`.
