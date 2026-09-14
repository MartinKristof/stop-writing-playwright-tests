# The three prompts, and what each step is meant to show

The demo behind the talk "Stop Writing Playwright Tests: Let AI Generate Them". One journey, the cart,
chosen because it is visual, uses page objects that already exist, and finishes in a few minutes rather
than ten.

The prompts are short on purpose. The notes under each say what is deliberately absent.

## The arc: the Playwright agents first, then the fork

Demo the agents Playwright ships, and let the forks be a consequence. Two of the three agents in this
repository are forked, and each fork adds project knowledge the agent could not have discovered:

| agent | shipped or forked | what the fork adds |
| --- | --- | --- |
| planner | forked as `test-planner-seed` | when the seed applies: only to sections that need a signed-in user, never to the login or access-control sections |
| generator | forked as `test-generator-pom` | read `tests/pages/`, reuse the methods, create a page object if none fits |
| healer | **unforked** | nothing; it needed no fork |

That is the "where human judgment is still essential" argument in one table. Playwright's planner cannot
know this app authenticates through a seed, and certainly cannot know that the login section must
**not** use it. Its generator has no notion of a page object at all. And the healer worked out of the
box.

**On timing:** do not run the generator twice on stage. Record both ahead of time in one session, play
the unforked run in full, then cut to the forked run's output as a thirty-second comparison, a flat
`page.click(...)` spec beside the page-object one. Show the diff between the two agent files: 77 lines
added, 31 removed. The instruction is four bullets; the rest is a catalogue of five page-object classes
with every public method, which is the point.

## Preflight, before typing anything

```bash
rm -f seed.spec.ts                                    # the stub; see below, deleting is not a permanent fix
npx playwright test --list                            # 2 tests: auth.seed under [setup], cart under [logged user]
npx playwright test --list --project=setup            # exactly 1
npx playwright test                                   # green against the local app, ~5 s
```

`--project='logged user'` also lists the seed, because `setup` is its dependency. That is correct and
not the stub.

### Where the root `seed.spec.ts` comes from, and why `rm` is not the fix

`init-agents` writes it, and so do the agents. Both go through the same function, `ensureSeedTest` in
`node_modules/playwright/lib/mcp/test/seed.js`, which collects the files of **one** project, looks for a
basename containing "seed", and writes a fresh stub if it finds none:

```js
const seed = files.find((file) => path.basename(file).includes("seed"));
if (seed) return seed;
const seedFile = path.resolve(testDir, "seed.spec.ts");   // no testDir set, so the repo root
await fs.promises.writeFile(seedFile, ...);
```

`init-agents` calls it once, at scaffold time, with `logNew: true`, so it announces the file. The
`planner_setup_page` and `generator_setup_page` tools call it again at run time with `logNew: false`, so
they do not. **That is why deleting the stub is not a fix:** the scaffold created it, and the next agent
that sets up a page recreates it silently.

**Which project it collects is the whole trap, and it is the same pick in both paths.** The `--project`
flag and the tools' `project` parameter are documented as *"if no project is provided uses the first
project in the config"*. The code does `findTopLevelProjects(config)[0]` instead. `setup` is a dependency
of `logged user`, so it is not top-level; the first top-level project is `logged user`, whose
`testIgnore: /.*\.seed\.spec\.ts/` hides the real seed by design. No seed found, stub written, agent
drives a blank page.

**Verified three ways, and this is the cleanest live demo of the trap:**

```bash
npx playwright init-agents --loop claude                          # Writing file: seed.spec.ts
npx playwright init-agents --loop claude --project setup           # no seed file written
npx playwright init-agents --loop claude --project 'logged user'   # Writing file: seed.spec.ts
```

**The mismatch between the documented fallback and the behaviour is the point.** The documented
behaviour would have been correct: `setup` really is the first project in the config, and naming it
explicitly makes the stub not happen at all.

For the agents, the fix is the same parameter, now passed by the two forks:

```bash
grep -n 'project: "setup"' .claude/agents/test-planner-seed.md .claude/agents/test-generator-pom.md
```

The unforked agents pass neither, so they still write the stub and plan against a blank page. **Leave
them that way**; that failure is part of the demo. It also means the stub can reappear mid-demo, so
re-run `rm -f seed.spec.ts` after `init-agents` and after any unforked-agent run.

`init-agents` also overwrites `.mcp.json` wholesale rather than merging it. Any other server you had
configured is gone.

## 1. Planner

```
Use the test-planner-seed subagent. Plan Playwright E2E coverage for the shopping cart in this
app. Cover exactly one scenario and no more: a signed-in user adds two products to the cart, the cart
badge shows the count, the cart page lists both products, and removing one leaves the other. Login,
checkout, sorting and the burger menu are out of scope. Use tests/auth.seed.spec.ts as the seed: it
signs in and leaves the browser on the inventory page. Save the plan to spec/cart.md.
```

**Why each part is there.**

*One scenario, and "no more".* Without a ceiling the planner plans six and the generator implements two.
In one throwaway run that cost ten minutes and 47,000 output tokens for work nobody used.

*The seed path, spelled out.* The two **forks** carry it as configuration. The two **unforked** agents
mention a seed only inside an illustrative todo-app example, so they stay untouched. Saying the real path
in the prompt as well makes a wrong plan visible rather than silent.

*If you want the unforked planner instead*, swap the subagent name to `playwright-test-planner` and it
will plan the same scenario without the seed rules. Running that first, seeing it attach the seed where
it does not belong, and then switching to the fork is the strongest version of this step, if the budget
allows it.

*The out-of-scope list.* Cheaper than trusting "one scenario" alone, and it keeps the demo inside its
slot.

**What is deliberately not said:** which page objects exist, that `tests/pages/` is the convention, which
selectors to prefer, or what the products are called. All of it is on the page or in the repository, and
watching it find them is the demo.

## 2. Generator

```
Use the test-generator-pom subagent. Generate the coverage from the plan at spec/cart.md.
```

That is the whole prompt. Everything else is in the agent definition, and pointing that out on stage is
worth more than a longer prompt: **the instructions live in a file you own and can edit**.

Two things to say while it runs:

*It performs every step in the browser before writing it.* The agent's own instructions say "use
Playwright tool to manually execute it in real-time", then `generator_read_log`, then
`generator_write_test`. The spec is a transcript of actions that actually worked, not a guess.

*The unforked generator does not mention page objects at all.* Its example writes flat `page.click(...)`
calls with no imports. `test-generator-pom` adds a four-bullet instruction to read `tests/pages/`, reuse
the methods, and create a page object if none fits, and then about seventy lines cataloguing the five
classes and their methods. **Show that diff between the two agent files.**

The `testDir` point belongs here, because it is why that fourth line works at all: this repository sets
no `testDir`, so the write sandbox is the whole repository and `tests/pages/` is inside it. Set
`testDir: './tests'` and `pages/` next to it becomes unreachable, which makes the same instruction
unfulfillable.

## 3. Healer

The drift is a branch in the application fork, so there is nothing to hand-edit on stage:

```bash
cd ../sample-app-web && git checkout break-app     # vite reloads by itself
```

One line of `src/components/InventoryListItem.jsx` changes `"Add to cart"` to `"Add to carta"`, and
because the `data-test` value is derived from the label, that single edit moves both the visible text and
the test id. The application now has a defect a user would read on the page.

Run the suite so the audience sees it go red, and only then:

```
Use the playwright-test-healer subagent. The Playwright tests are failing. Make them pass.
```

**Say nothing about what changed.** That is the whole point of the step: the UI changed and the tests
repair themselves. If you name the label, you have done the diagnosis and the agent is doing a
find-and-replace.

**Measured, local app, `main` versus `break-app`:**

| | result | wall clock |
| --- | --- | --- |
| `main` | 2 passed | 4.5 s |
| `break-app`, `--retries=0` | 1 failed, 1 passed | 13.1 s |

Two things follow. **Only one test goes red**, because this suite has one cart test; do not promise the
audience a wall of red. And **pass `--retries=0` on stage**, because the config sets `retries: 1` and a
failing run otherwise pays the 10 second action timeout twice.

The failure is legible from the back of the room, which is worth reading out:

```
TimeoutError: locator.click: Timeout 10000ms exceeded.
  - waiting for getByTestId('add-to-cart-sauce-labs-backpack')
    at tests/pages/InventoryPage.ts:123
```

**When it finishes, show the diff and read it out.** With this drift the question is not where the fix
landed but whether it should have been made at all, because the application is the thing that is wrong:

- `tests/pages/InventoryPage.ts:123` now expects `add-to-carta-`: the suite is green, the defect has
  become the specification, and that particular bug can never be caught again.
- it stops and reports the application as broken: the better engineering outcome and the weaker ending.
  Say so plainly if it happens.

**One caveat to hold honestly.** In the measurement behind the talk the healer was steered toward the
first outcome by a brief that told it to "update the values in the spec to whatever the app actually
serves". The prompt above says only "Make them pass", so the reproduction is not guaranteed. Rehearse it,
and if it diagnoses instead of conforming, that is the result to report.

**But the steer is mostly in the agent definition, not in the brief.** Read
`.claude/agents/playwright-test-healer.md`. It lists "Fixing assertions and expected values" as a
remediation step and closes with:

> Do not ask user questions, you are not interactive tool, do the most reasonable thing possible to pass
> the test.

Its one escape hatch, `test.fixme()`, is conditioned on "if the error persists", so it never fires here:
the carta drift is trivially passable, so the agent never reaches the branch where it is allowed to
conclude the test was right.

That line is unchanged in `playwright@1.64.0-alpha-2026-09-04`; the diff against 1.56.1 is two renamed
tool names and a trailing newline. Meanwhile `playwright-cli install --skills` ships
`references/test-generation.md`, covering the same plan, generate, heal pipeline, whose heal section says
to **stop and ask the user** when it cannot tell a stale spec from a regression. Two official paths,
opposite mandates. The `cli` branch of this repository is that second path, set up the same way.

## Fallbacks

- Have a recording of the healer run. If the live one has not finished in two minutes, switch.
- If the planner produces a plan you dislike on stage, that is not a failure to hide: read the bad part
  out loud. It is the "read the plan" argument, delivered by the demo instead of by a slide.
