# The three prompts, and what each step is meant to show

The demo behind the talk "Nobody Writes Playwright Tests Any More. Generate Them Right.". One journey, the cart,
chosen because it is visual, uses page objects that already exist, and finishes in a few minutes rather
than ten.

The prompts are short on purpose. The notes under each say what is deliberately absent.

## The arc: the Playwright agents first, then the fork

Demo the agents Playwright ships, and let the forks be a consequence. Two of the three agents in this
repository are forked, and each fork adds project knowledge the agent could not have discovered:

| agent | shipped or forked | what the fork adds |
| --- | --- | --- |
| planner | forked as `forked-planner` | read the existing specs and page objects first, and do not plan coverage the suite already has |
| generator | forked as `forked-generator` | read `tests/pages/`, reuse the methods, create a page object if none fits |
| healer | `forked-healer`, **not used in the demo** | may answer "the app is wrong"; same tool list, all of it in the brief |

That is the "where human judgment is still essential" argument in one table. Playwright's planner
cannot know what this suite already covers, so it plans coverage that exists. Its instructions never
mention page objects, and neither does its generator's. Its healer needs no project knowledge and gets
none: `forked-healer` has the same tool list, character for character, and differs only in what the
brief allows it to conclude.

**Say "its instructions never mention page objects", not "it never writes one".** In the measurement
behind the talk, the same shipped agents did create a page object, in all five runs of that setup,
because that repository carries its conventions in `tests/playwright/AGENTS.md` and a skill, and the
brief said to work the rest out from the repository's own conventions. This repository is deliberately
bare: no `AGENTS.md`, no skill, nothing that tells anybody anything. That is why it falls over here, and
that is the real lesson. Project knowledge has to live somewhere the agent reads. **The demo runs the shipped healer**, because watching
"do the most reasonable thing possible to pass the test" write a defect into a page object is the point
of that step; the fork is what to copy afterwards.

**On timing:** only Playwright's own agents need to go on video. Record the shipped planner and the
shipped generator, play those, and show what the fork produced from the repository instead of recording
it: the forked plan beside the shipped one, and the committed `tests/cart.spec.ts` beside the flat
`page.click(...)` spec from the recording. Show the diff between the two generator files: 60 lines
added, 31 removed, almost all of it four bullets telling the agent to read `tests/pages/index.ts` and
the classes it exports, which is the point.

## Preflight, before typing anything

```bash
rm -f seed.spec.ts                                    # the stub; see below, deleting is not a permanent fix
npx playwright test --list                            # one project, chromium, and the cart spec
npx playwright test                                   # green, about 3 s
```

**Which application the suite runs against.** `SAUCE_DEMO_BASE_URL` in `.env` is deliberately empty, so
`baseURL` falls back to the public `https://www.saucedemo.com/`. Takes 1 and 2 need nothing running
locally. Only the healer needs the local clone, because its drift is a branch of the application, so set
the variable to `http://localhost:3000/` for that take and empty it again afterwards.

The fallback is `||` rather than `??` for exactly this reason: `??` lets an empty string through and
`baseURL` becomes `""`, which fails every relative `goto` with a timeout that looks like a broken test.

Leave the stub in once, before you delete it, and run the suite. It is listed as
`[chromium] › seed.spec.ts:4:7 › Test group › seed` and reported as `1 passed`: a test that opens
nothing and asserts nothing, green. That is the shortest way to make the point on stage.

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

**No project is collected here, because there is only one, and it has no seed.** `chromium` is the
first and only top-level project and no file in it has "seed" in its name, so the stub is written every
time, by the scaffold and by every `setup_page` call after it. Deleting it is housekeeping, not a fix.

**The trap this hides is worth telling even though this repository can no longer show it.** The
`--project` flag and the tools' `project` parameter are documented as *"if no project is provided uses
the first project in the config"*. The code does `findTopLevelProjects(config)[0]` instead. In a suite
where the seed lives in a `setup` project that a `logged user` project depends on, `setup` is not
top-level, the first top-level project hides the real seed behind its own `testIgnore`, and the agents
drive a blank page while a perfectly good seed sits in the repository. That is what this repository
looked like until the demo was simplified, and it is the version most real suites have.

`init-agents` also overwrites `.mcp.json` wholesale rather than merging it. Any other server you had
configured is gone.

## 1. Planner

The prompt you type on camera names Playwright's own planner. The fork runs the identical brief with
one word changed.

```
Use the playwright-test-planner subagent. Plan Playwright E2E coverage for the shopping cart in this
app. Cover exactly one scenario and no more: a signed-in user adds two products to the cart, the cart
badge shows the count, the cart page lists both products, and removing one leaves the other. Login,
checkout, sorting and the burger menu are out of scope. Save the plan to spec/cart.md.
```

**Why each part is there.**

*One scenario, and "no more".* Without a ceiling the planner plans six and the generator implements two.
In one throwaway run that cost ten minutes and 47,000 output tokens for work nobody used.

*The out-of-scope list.* Cheaper than trusting "one scenario" alone, and it keeps the demo inside its
slot.

*"A signed-in user", and nothing about how.* This is the sentence to watch. The suite has no stored
session, so somebody has to plan the sign-in. The brief does not say so, and neither does Playwright's
planner know it.

**What is deliberately not said:** which page objects exist, that `tests/pages/` is the convention, which
selectors to prefer, or what the products are called. All of it is on the page or in the repository, and
watching it find them is the demo.

**What the fork adds, and why it is not recorded.** `forked-planner` reads what the repository already
has before it plans, and it knows the suite starts signed out, so the sign-in is step one of its plan.
Run it in preparation with the same brief, keep its plan, and put the two side by side on stage rather
than spending a second take on it.

## 2. Generator

```
Use the playwright-test-generator subagent. Generate the coverage from the plan at spec/cart.md.
```

That is the whole prompt, and the fork's is the same sentence with `forked-generator` in it. Everything
else is in the agent definition, and pointing that out on stage is worth more than a longer prompt:
**the instructions live in a file you own and can edit**.

**Move `tests/cart.spec.ts` out of the way before this take, and put it back afterwards.** This is not
tidiness, it decides the outcome. With the fork's spec sitting there, the shipped generator globs for
specs, finds it, reads it, then reads all five page objects and copies the style, and the contrast the
beat exists for disappears. With `tests/` holding only `pages/`, the same agent writes a flat spec with
no imports, the URL hardcoded, and drops it at the repository root because no `testDir` is set.

```bash
mv tests/cart.spec.ts /tmp/cart-fork.spec.ts     # and back again when the take is done
```

Only Playwright's generator goes on camera. Its output, that flat spec, belongs beside the committed
`tests/cart.spec.ts`, which the fork produced.

Three things to say while it runs:

*It performs every step in the browser before writing it.* The agent's own instructions say "use
Playwright tool to manually execute it in real-time", then `generator_read_log`, then
`generator_write_test`. The spec is a transcript of actions that actually worked, not a guess.

*Which is why the starting state matters more than it looks.* `generator_setup_page` hands the agent a
blank page, so whatever the plan's first step assumes, the agent has to perform for itself and therefore
writes down. Give it a plan that starts from "the user is signed in" and never says how, and you get a
spec that opens on `about:blank` and times out on the first click. That is the planner's omission
arriving one step later, as a test failure with no obvious cause.

*The unforked generator does not mention page objects at all.* Its example writes flat `page.click(...)`
calls with no imports. `forked-generator` adds four bullets: read `tests/pages/index.ts` and the classes
it exports, treat those classes as the authority rather than any summary, reuse their methods, add a
class if none fits. **Show that diff between the two agent files.**

*It used to carry a catalogue of the five classes and every public method, and that is worth saying out
loud.* Seventy lines of it, and within weeks it was five methods behind the code, including the ones the
generated spec actually calls. Knowledge you add to an agent has to be a pointer into the code, not a
copy of it, or it rots while still sounding authoritative.

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

Its one escape hatch, `test.fixme()`, is conditioned on "if the error persists", and the prediction
written here was that it never fires on a trivially passable drift. **The rehearsal of 16 September
refuted that.** With the neutral prompt above, the healer parked the failing test and reported the
application as broken rather than re-keying the locator. The artifacts are still in this repo:
`playwright-report/data/907e2737….md` holds the snapshot with the "Add to carta" buttons, so it saw the
drift correctly and chose the diagnosis, and `test-results/.last-run.json` from five minutes later
reports a green run with nothing failing, which is what a parked test looks like. The conforming
outcome, run 5 in the pilot's `results/drift/README.md`, came from a brief that added "update the
values in the spec to whatever the app actually serves". Same agent, same drift, opposite endings, and
what differed was the sentence above it. Both endings are worth showing; the diagnosis is the better
engineering outcome and the talk says so.

That line, and the remediation list above it, are byte-identical in 1.56.1, in today's stable 1.63.0 and
in `playwright@1.64.0-alpha-2026-09-04`. The 1.63.0 file does differ from 1.56.1, by 34 lines: the agent
is renamed, `ls/grep/read/write` in its tool list becomes `search` plus `browser_network_request`, two
tool calls in the workflow are renamed (`playwright_test_run_test` to `test_run`,
`playwright_test_debug_test` to `test_debug`), and two example blocks are dropped from the body. None of
it touches the mandate. The seed-stub behaviour is unchanged too: 1.63.0 still picks
`findTopLevelProjects(config)[0]` when no project is named, still searches for a basename containing
"seed", and still writes the same stub. Meanwhile `playwright-cli install --skills` ships
`references/test-generation.md`, covering the same plan, generate, heal pipeline, whose heal section says
to **stop and ask the user** when it cannot tell a stale spec from a regression. Two official paths,
opposite mandates. The `cli` branch of this repository is that second path, set up the same way.

## 4. The other path: one skill instead of three subagents

Recorded, and in the repository that carries `@playwright/cli`, because it pulls a different
`playwright-core` and would replace the MCP server the other beats depend on.

```bash
npx playwright-cli install --skills
```

Then one prompt, which is the whole point of the beat: the two subagent prompts above, merged, because
the skill covers plan, generate and heal in one file.

```
Plan and generate Playwright E2E coverage for the shopping cart in this app, using the playwright-cli
skill. Cover exactly one scenario and no more: a signed-in user adds two products to the cart, the cart
badge shows the count, the cart page lists both products, and removing one leaves the other. Login,
checkout, sorting and the burger menu are out of scope. Save the plan to spec/cart.md and the spec under
tests/.
```

What to say while it runs, and nothing more: it is the same pipeline, plan then generate then heal,
driven by one installable skill instead of three subagents. Its mechanic is different, `npx playwright
test --debug=cli` in the background and `playwright-cli attach` to drive the paused page, and every
action it takes prints the Playwright line that would perform it. The difference in mandate is a later
slide; do not spend this beat on it.

Recorded rather than live on purpose: the package is at `0.1.19`, twenty-eight releases in eight months.

## Fallbacks

- Have a recording of the healer run. If the live one has not finished in two minutes, switch.
- If the planner produces a plan you dislike on stage, that is not a failure to hide: read the bad part
  out loud. It is the "read the plan" argument, delivered by the demo instead of by a slide.
