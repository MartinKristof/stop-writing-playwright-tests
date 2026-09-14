# Stop Writing Playwright Tests: Let AI Generate Them

The repository used on stage in the talk. A small Playwright suite for SauceDemo, driven by Playwright's
own agents through the test MCP server.

`RUNBOOK.md` has the three prompts, what each step is meant to show, and the traps worth knowing about.
The `cli` branch is the same demo driven by the `playwright-cli` skill instead of three subagents:
`git diff main cli` is the whole difference.

## Layout

```
tests/
  auth.seed.spec.ts   the seed: signs in and saves .auth/user.json
  cart.spec.ts        the generated cart coverage
  pages/              page objects, what the forked generator reuses
spec/                 generated test plans (gitignored)
.claude/agents/       Playwright's three agents plus two forks
.claude/settings.json tool permissions
.mcp.json             the playwright-test MCP server
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

## Agents

| agent | shipped or forked | what the fork adds |
| --- | --- | --- |
| `playwright-test-planner` | shipped | |
| `playwright-test-generator` | shipped | |
| `playwright-test-healer` | shipped | |
| `test-planner-seed` | forked planner | when the seed applies, and when it must not |
| `test-generator-pom` | forked generator | read `tests/pages/`, reuse the methods, add one if none fits |

Both forks pass `project: "setup"` and `seedFile: "tests/auth.seed.spec.ts"` to their setup tool. The
unforked agents pass neither, which is why they write a `seed.spec.ts` stub at the repository root and
then drive a blank page. That failure is part of the demo, so they stay as they are.

`npx playwright init-agents --loop claude` rewrites `.mcp.json` wholesale and writes that stub. Run
`rm -f seed.spec.ts` after it, and after any run of an unforked agent.

## Test accounts

All use the password `secret_sauce`: `standard_user` (the demo), `problem_user`,
`performance_glitch_user`, `visual_user`.
