# Measure it on your own repository

Do not take the numbers from the talk. They came from one product, one page and one team's
conventions, and the part that transfers is the method, not the result. This is the small version:
one afternoon, six runs, twenty minutes of scoring.

It answers two questions, and they need different amounts of work:

- **What kind of code does each path write here?** One run per path is enough. You read it from the
  diff, not from a number.
- **Can I trust a single run enough to merge it?** That needs the same setup three times. This is the
  question that changes how you work.

If you only have the budget for one of those, run **three runs of one setup**, not one run of three
setups.

## 1. Write the feature list before you run anything

Ten to fifteen lines: what should be asserted about the page you picked, and for each, one sentence
saying what counts as asserted. Write it before you look at any generated spec, or you will score
what the agent happened to do.

Three rules keep the scoring honest, and they hold in any repository:

- **A locator is not an assertion.** `page.getByText('Never')` with no `expect` around it asserts
  nothing. A locator used to scope another assertion does not assert its own text.
- **An assertion inside a page object counts**, but read the method before you tick the box:
  `expectRowVisible` asserts whatever it actually checks, which is sometimes less than its name says.
- **Only the spec and the page objects it calls count.** Not the seed, not changes to the application.

## 2. One brief, two rounds

Same brief, same model, same starting commit, every time. Put the brief in a file so it cannot drift
between runs, and say in it what you are *not* telling the agent (column names, naming conventions, a
locator strategy), because that is what you are actually testing.

**Round one, each candidate path once.** Read the diffs side by side. Did it reach for your page
objects or write flat locators? Did it take credentials from the environment or type them into the
spec? Did it write a plan you can read before the code existed? One run shows you this.

**Round two, the path you liked, twice more.** Same brief, same starting commit, nothing changed. Now
compare the three runs against each other.

## 3. Score the diffs by hand

Fifteen features across three to six runs is twenty minutes with the list beside you. A judge model
is worth it only at a larger sample, and then only if you calibrate it first against columns you
scored by hand, or you have replaced a measurement with a second opinion.

## 4. Record three numbers per run

Features asserted, what it cost, how long it took. Then two warnings, both paid for in this pilot:

- **Do not trust the agent's own duration and token counts when it delegates.** In the measurement
  behind the talk, `duration_ms` under-reported delegated phases by about 50x and
  `usage.output_tokens` by about 70x, because the result event only covers the session that emitted
  it. Take wall clock from your own runner's timestamps and sum the token usage across every phase.
- **A check that cannot fail reads as evidence.** One of the checks in that pilot reported `pass` five
  times out of five having examined zero selectors, and survived a week of scrutiny. Before you
  believe any check, break something on purpose and watch it go red.

## What you will and will not learn

**Three runs will not rank the setups against each other.** In the pilot, three runs per setup could
not separate three of the five on anything; ranking two of them would have needed about five runs
each.

What three runs of one setup do tell you is how much it disagrees with itself. On one brief and one
page, one setup asserted 6, 5 and 10 of the same fourteen features across three runs, and another 9,
6 and 9. That spread is the number that decides whether you can merge a single run without reading
it, and it is worth more than any comparison table.
