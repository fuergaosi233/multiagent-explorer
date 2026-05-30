---
title: Bun Zig→Rust Migration Case
description: Engineering breakdown of the Bun JavaScript runtime migration from Zig to Rust, as described in Anthropic's Dynamic Workflows announcement.
---

> **Source note**: The details below are drawn from Anthropic's official Dynamic Workflows announcement and the Claude Opus 4.8 release materials. This describes what was publicly stated about the migration. The case demonstrates how Dynamic Workflows structured a large engineering task — treat the numbers and phases as illustrative rather than independently verified.

## Summary

Bun, the JavaScript runtime, undertook a migration of its Zig codebase to Rust. According to Anthropic's announcement:

- Approximately **750,000 lines of Rust** generated.
- **99.8% of the existing test suite** passing after the migration.
- **11 days** from first commit to merge-ready state.

This was not achieved by asking a single agent to rewrite all files. It was structured as a multi-phase workflow where each phase had a clear input, a clear output, and an independent verification step.

## Phase Breakdown

### Phase 1: Lifetime Mapping Workflow

Before writing a line of Rust, a workflow mapped Zig ownership and lifetime semantics across the codebase. This phase:

- Identified which Zig constructs have direct Rust equivalents and which require manual intervention.
- Produced a per-file mapping of the expected translation complexity.
- Generated the fan-out shape for Phase 2: which files can be ported in parallel, which have dependencies.

**Why this matters**: jumping straight to translation without a lifetime map would produce Rust code that compiles locally but fails in integration. The mapping phase makes the failure surface visible before any code is written.

### Phase 2: File-by-File Behavior-Equivalent Port

Worker agents translated files in parallel, targeting behavior equivalence rather than idiomatic Rust. Each agent:

- Took one Zig file as input.
- Produced a Rust file that passes the existing tests for that module.
- Did not attempt to make the Rust idiomatic — correctness first.

**Fan-out**: hundreds of worker agents running in parallel, each isolated to one file. The workflow script enforced the parallelism boundary — workers did not share context.

### Phase 3: Reviewer Agents Per File

After each file was ported, a reviewer agent inspected the translation:

- Checked for semantic differences between the Zig and Rust implementations.
- Flagged constructs where the translation might be behavior-correct but brittle.
- Produced a per-file review report.

**Adversarial framing**: reviewer agents were prompted to find problems, not to approve. Files that passed review moved forward; files that failed were flagged for human review or re-translation.

### Phase 4: Build / Test Fix Loop

A loop phase ran the build and test suite against the ported files and fed failures back into the workflow:

- Build failures were routed to targeted fix agents.
- Test failures were routed to agents that could inspect the failing test and the ported code.
- The loop ran until the test pass rate reached a threshold or the budget was exhausted.

**Why loop instead of one-shot**: no large translation is correct on the first pass. The loop phase makes iteration a first-class part of the workflow rather than a manual follow-up.

### Phase 5: Post-Merge Copy-Cleanup PR Workflow

After the main migration was merged, a separate workflow cleaned up:

- Removed Zig copies of files that had been fully ported.
- Updated build configuration references.
- Opened a PR for human review before final cleanup was applied.

**PR as output**: the workflow did not apply cleanup directly to main. It created a PR, preserving a human review gate for the final state change.

## Engineering Lessons

### Large migrations are phases, not one prompt

The Bun migration worked because each phase had a clearly scoped input, a verifiable output, and an independent review step. A single prompt asking an agent to "migrate the Bun codebase from Zig to Rust" would not produce a reviewable result.

### Verification is structural, not optional

Reviewer agents and the build/test loop are not quality assurance add-ons. They are structural parts of the workflow. Without them, the 99.8% test pass rate is not achievable — the first translation pass will have errors.

### The output is a PR, not a conversation

The workflow's final artifact was code on a branch, reviewable by humans before merge. The conversational interface was the trigger; the engineering artifact was the deliverable.

### Human gates remain essential

Even with automated review at scale, a human reviewed the final PR before merge. The workflow automated what could be automated; it did not remove human judgment from the critical path.

## Risks and Open Questions

| Risk | Note |
|---|---|
| Language semantic differences | Zig and Rust have different memory and error models. Behavior equivalence at the test level does not guarantee semantic equivalence under all conditions. |
| Test coverage gaps | A 99.8% pass rate on the existing test suite means existing tests; new failure modes introduced by the translation may not be covered. |
| Reviewer agent correlation | If reviewer agents were prompted similarly, they may share systematic blind spots. Independent reviewer prompts reduce this risk. |
| Generated code maintainability | Behavior-equivalent Rust translated from Zig may not be idiomatic. Long-term maintainability depends on subsequent human refactoring. |
| Final human review scope | At 750,000 lines, human review of the final PR cannot be line-by-line. The workflow's verification phases are doing most of the quality work. |
