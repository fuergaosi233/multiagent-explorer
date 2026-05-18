# Multi-Agent Pattern DSL

A small, zero-dependency TypeScript builder for declaring the patterns rendered
by this app. Output of `.build()` satisfies the existing `Pattern` interface in
`types/pattern.ts`, so DSL-produced objects drop straight into `PATTERNS`.

## Why a DSL (instead of raw object literals)

The raw form in `data/patterns.ts` works, but every cross-reference is a stringly-typed
guess: edges write `from: 'manger'` (typo) and we only learn at render time;
timeline `fire: ['m-x']` happily references an edge that no longer exists; node ids
appear as bare strings throughout. The DSL trades a few extra characters for:

- **Type-safe references.** `edge($.user, $.manager)` autocompletes node ids,
  and only declared edge ids satisfy `$.fwd(…)` / `$.rev(…)`.
- **Build-time validation.** `.build()` throws if any edge points at an unknown
  node, any `fire` mentions an unknown edge, any `activate`/`dim` mentions an
  unknown node, or any required field is missing.
- **Less repetition.** Each node id is written once (as the object key);
  `node.user(label, opts)` selects the `kind`; `at: [x, y]` replaces the
  `x:…, y:…` pair; reverse edges are `$.rev('m-r')` instead of the magic
  `'!m-r'` prefix string.
- **Autocomplete + go-to-definition.** Editor tooling finds usage sites of
  every node and edge id, which is hard with bare string literals.

## Type-inference mechanics

The builder is staged: `definePattern → PatternBuilder → PatternBuilderWithNodes<NodeId>
→ PatternBuilderWithEdges<NodeId, EdgeId>`. `.nodes(obj)` captures
`keyof obj` into the generic parameter `NodeId`; `.edges(fn)` runs the callback
with a proxy `$ : { [K in NodeId]: K }` (so `$.user` has literal type `"user"`),
and captures the returned object's keys into `EdgeId`. `.timeline(fn)` then
exposes the same `$` plus `fwd<E extends EdgeId>(id: E): E` and
`rev<E extends EdgeId>(id: E): \`!${E}\`` — restricting the `fire` array to
declared edge ids at compile time. Variants get the same `$`, so variant
timelines are equally checked.

## Validation contract

`.build()` enforces, in order:

1. Required fields present: `title`, `mechanism`, `group`/`num`/`grpLabel`,
   `example`, `nodes`, `timeline`.
2. Each edge's `from` / `to` refers to a declared node id.
3. Each timeline step's `fire` entry (with leading `!` stripped) refers to a
   declared edge id; `activate` / `dim` refer to declared node ids.
4. Same checks for every variant timeline (skipped when `timeline` is `null`,
   which means "use the main timeline").

Violations throw `Error("[pattern \"<id>\"] …")` with the offending field.

## Tradeoffs

- **More abstraction.** Reading a pattern now requires knowing the DSL shape;
  the raw literal form is denser and is what most JS readers expect.
- **Grep is harder.** Searching for `id:'manager'` in raw literals finds the
  node definition instantly; with the DSL the id is the object key, so
  searches need patterns like `^\s*manager:`.
- **Learning curve.** New contributors must learn `node.*` factories,
  `edge(from, to, label, opts)` argument order, `$.fwd` / `$.rev`, and the
  staged builder progression — about 10 minutes if they read this file.
- **Validation moves to runtime.** Cross-reference checks happen on `.build()`
  rather than at TS compile time for the string-ref cases the type system
  can't reach (`activate` / `dim` typing intentionally narrows to `NodeId`
  for autocomplete, but TS can't catch a hand-typed literal that bypasses
  `$`). The build-time throw catches it on first import.
