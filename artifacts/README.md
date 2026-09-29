# What each path produced from the same brief

Three runs of the cart task in this repository: the same brief, the same page objects in
`tests/pages/`, and in every case `tests/` held no spec the agent could copy from.

| directory | who wrote it |
| --- | --- |
| `stock/` | `playwright-test-planner` and `playwright-test-generator`, the subagents `init-agents` installs |
| `fork/` | `forked-planner` and `forked-generator`, the same agents with four bullets added |
| `cli/` | the `playwright-cli` skill, running in the session |
| `healer/` | `playwright-test-healer`, given a deliberately broken application |

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

## `healer/`: what the shipped healer did with a broken application

The other three directories are the same brief answered three ways. This one is a different question:
the application was broken on purpose and only a healer was run.

The drift is one line in the app under test. `"Add to cart"` became `"Add to carta"`, and because the
`data-test` value is derived from the label, the attribute moved with it. A user would read the defect
on the page. The whole prompt was:

    Use the playwright-test-healer subagent. The Playwright tests are failing. Make them pass.

Nothing about what had changed, nothing about how to repair it. `healer/cart.spec.ts` is what came
back: **the shipped agent refused to bend the test**, parked it, and wrote its own reason for doing so.

> This is uniform across all six products, so it reads as a typo introduced in the app's shared button
> label, not an intentional product change. Updating the page object's locator to match "carta" would
> turn the app's regression into the spec, so the test is parked instead of touching the selector.

Nobody told it that. Two things are worth holding at once:

- **It is the better engineering outcome**, and it is the shipped agent, not the fork, that produced
  it. Twice, on 16 and 29 September, with the neutral prompt above.
- **A parked test leaves the suite green.** `test.fixme` skips, it does not fail, so the run reports a
  pass. The check is gone and the defect is not. Read the runner's `1 skipped` line, not the colour.

Given one extra sentence, *update the values in the spec to whatever the app actually serves*, the same
agent on the same drift wrote `add-to-carta-` into the page object instead, and the suite went green
over a broken application. Same model, same drift, opposite endings. What differed was the sentence
above it.

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
