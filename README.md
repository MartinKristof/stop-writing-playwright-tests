# Stop Writing Playwright Tests: Let AI Generate Them

The repository used on stage in the talk. A small Playwright suite for SauceDemo, driven by Playwright's
own agents through the test MCP server.

`RUNBOOK.md` has the three prompts, what each step is meant to show, and the traps worth knowing about.
The `cli` branch is the same demo driven by the `playwright-cli` skill instead of three subagents:
`git diff main cli` is the whole difference.

## Layout

```
tests/
  cart.spec.ts        the generated cart coverage
  pages/              page objects, what the forked generator reuses
spec/                 generated test plans (gitignored)
.claude/agents/       Playwright's three agents plus a fork of each
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
npm test                 # green against the local app
```

## One project, and no seed

The config has a single project, `chromium`, and the repository holds no seed test. That is
deliberate. Every spec signs in for itself, and nothing hands an agent a starting state it did not
create.

It also means `init-agents`, and every `planner_setup_page` or `generator_setup_page` call after it,
finds no file with "seed" in its name and writes a stub at the repository root:

```ts
test.describe('Test group', () => {
  test('seed', async ({ page }) => {
    // generate code here.
  });
});
```

That stub is what the agents actually drive, and it is worth running once:

```
[chromium] › seed.spec.ts:4:7 › Test group › seed
1 passed
```

A test that opens nothing and asserts nothing, reported as a pass. Delete it after any run that wrote
it.

There is no `testDir`, so the whole repository is the agents' write sandbox, which is what lets the
forked generator reach `tests/pages/`.

## Agents

Three agents as Playwright ships them, and a fork of each.

| agent | shipped or forked | what the fork adds |
| --- | --- | --- |
| `playwright-test-planner` | shipped | |
| `playwright-test-generator` | shipped | |
| `playwright-test-healer` | shipped | |
| `forked-planner` | forked planner | read the existing specs and page objects first, and do not plan coverage the suite already has |
| `forked-generator` | forked generator | read `tests/pages/`, reuse the methods, add one if none fits |
| `forked-healer` | forked healer | diagnose the cause, and report an application bug rather than write it into the test |

The first two forks add project knowledge the agent could not have discovered. The third adds none: its
tool list is character for character the shipped healer's, and every difference is in the brief. It may
answer "the application is wrong", which the shipped healer's brief never allows, and like the shipped
one it is forbidden to ask you questions. That difference is what the talk is about.

**The demo runs the shipped healer, not the fork.** Watching a brief that says "do the most reasonable
thing possible to pass the test" write a defect into a page object is the point of that step. The fork
is here as the thing to copy afterwards.

Every agent here, forked or not, starts from the stub and therefore from a blank page. The difference
is what each one knows about this repository afterwards.

`npx playwright init-agents --loop claude` rewrites the three shipped agents and `.mcp.json` wholesale,
leaves the three forks alone, and writes that stub. Run `rm -f seed.spec.ts` after it, and after any run
of an unforked agent.

## Test accounts

All use the password `secret_sauce`: `standard_user` (the demo), `problem_user`,
`performance_glitch_user`, `visual_user`.
