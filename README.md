# Stop Writing Playwright Tests: the CLI variant

The CLI half of the stage demo. Same suite, same app, same seed as `main`, but the browser is reached
through the `playwright-cli` skill instead of three subagents over the test MCP server.

Branched from `main`, and `git diff main cli` is the whole difference: Playwright moves to the 1.64
alpha, `@playwright/cli` is installed, `.claude/skills/playwright-cli/` holds the skill, and there is
no `.mcp.json` and no `.claude/agents/`.

    npx playwright-cli install --skills   # reinstalls the skill in place

`RUNBOOK.md` has the prompts and what each step is meant to show.

## Layout

```
tests/
  auth.seed.spec.ts   the seed: signs in and saves .auth/user.json
  cart.spec.ts        the generated cart coverage
  pages/              page objects
spec/                 generated test plans (gitignored)
.claude/skills/       the playwright-cli skill and its references
.claude/settings.json tool permissions
```

## The app under test

A local clone of `saucelabs/sample-app-web` on `http://localhost:3000`, so the UI can be edited live:

```bash
git clone https://github.com/MartinKristof/sample-app-web ../sample-app-web
cd ../sample-app-web && npm install && npm start
```

That fork carries one extra branch, `break-app`, which renames a button label from "Add to cart" to
"Add to carta". Because the `data-test` attribute is derived from the label, one edit moves both the
visible text and the test id. That is the drift the healer is asked to repair.

`baseURL` follows `SAUCE_DEMO_BASE_URL`, so the suite can also run against the public
`https://www.saucedemo.com/`.

## Setup

```bash
npm install
npm run playwright:install
cp .env.example .env     # USER_NAME, PASSWORD, SAUCE_DEMO_BASE_URL
npm test                 # 2 tests, green in about 5 s
```

## Projects

`setup` runs `tests/auth.seed.spec.ts` and writes the storage state. `logged user` depends on it and
ignores the seed file. There is no `testDir`, so the whole repo is the agents' write sandbox, which is
what lets the forked generator reach `tests/pages/`.

## The skill

`.claude/skills/playwright-cli/SKILL.md` plus ten reference files. `references/test-generation.md`
covers the same plan, generate, heal pipeline as the three subagents, and its heal step tells the
agent to stop and ask the user when it cannot tell a stale spec from a regression. It drives a page by
running `npx playwright test --debug=cli` in the background and attaching to the paused test.

## Test accounts

All use the password `secret_sauce`: `standard_user` (the demo), `problem_user`,
`performance_glitch_user`, `visual_user`.
