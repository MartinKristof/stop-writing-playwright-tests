# What each path produced from the same brief

Three runs of the cart task in this repository: the same brief, the same page objects in
`tests/pages/`, and in every case `tests/` held no spec the agent could copy from.

| directory | who wrote it |
| --- | --- |
| `stock/` | `playwright-test-planner` and `playwright-test-generator`, the subagents `init-agents` installs |
| `fork/` | `forked-planner` and `forked-generator`, the same agents with four bullets added |
| `cli/` | the `playwright-cli` skill, running in the session |

Each directory holds the plan (`cart.md`) and the spec written from it (`cart.spec.ts`). `fork/` is
what is committed as `tests/cart.spec.ts` on `main`.

## The plans say what each one read

Open the three `cart.md` files and look at one section in each, in this order:

- **`stock/cart.md`, "Key selectors observed"** — a list of raw `[data-test="add-to-cart-…"]`
  selectors. It planned against what it saw in the browser.
- **`fork/cart.md`, "Existing Coverage"** — it names `CartPage.ts` and `InventoryPage.ts` and
  concludes that *"no new page object methods should be required"*. It planned against the repository.
- **`cli/cart.md`, scenario 1.1** — every step carries its own `expect:` bullet and the plan names the
  seed file it starts from. It planned against what it would be able to verify.

Nobody told the stock agents about page objects, and nobody told the CLI skill either. The difference
is where each one was able to look: a subagent with a fixed tool list and no shell, against a skill
running in the session with all of them.

## The specs

`stock/cart.spec.ts` is flat: no imports, the URL hardcoded, every locator inline, the password typed
into the test. It passes, which is the uncomfortable part.

`fork/cart.spec.ts` imports the page objects and reuses their methods, because four bullets in the
agent file told it to read `tests/pages/index.ts`.

`cli/cart.spec.ts` imports the page objects too, unprompted, and it is the only one of the three that
took the credentials from the environment (`process.env.USER_NAME`), which this repository's
`.env.example` has declared all along.

## The CLI run, and what it did not do

`cli/chat.txt` is that session's own report. Two things in it matter more than the code:

- It refused `CartPage.expectItemCount`, `expectItemInCart` and `expectItemNotInCart`, because all
  three call `count()` or `textContent()` outside `expect()`, read the DOM once and race the click
  that precedes them. It used `expect(cartPage.cartItemNames).toHaveText([...])` instead, which
  retries.
- It verified its own work: `npx tsc --noEmit` clean, and the suite three times with `--repeat-each=3`,
  six passes and no flakes.

**The caveat, if this is shown on stage.** The skill's advertised mechanic did not run. It wants
`npx playwright test --debug=cli` and `playwright-cli attach`, and the checkout it ran in had
Playwright 1.56.1, which has neither. The session used the standalone `npx @playwright/cli@latest`
(0.1.20) and reproduced the sign-in by hand instead of attaching to a paused test. A standalone CLI
session also does not read `testIdAttribute` from the config, so it had to address elements as
`[data-test="…"]` while exploring; inside the test the config applies and the page objects work
unchanged.
