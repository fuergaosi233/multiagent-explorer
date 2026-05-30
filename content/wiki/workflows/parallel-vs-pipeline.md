---
title: Parallel vs Pipeline
description: Barrier semantics vs stream semantics — the concurrency model difference that determines which primitive to choose.
---

`parallel` and `pipeline` are not just different names for the same thing. They have fundamentally different concurrency models, and choosing the wrong one creates either unnecessary latency or unnecessary complexity.

## Comparison

| Dimension | Parallel barrier | Pipeline stream |
|---|---|---|
| Scheduling | all tasks in a batch start together | each item flows through stages independently |
| Blocking | next stage waits for all items | next stage starts per item, not per batch |
| Best for | global comparison, dedupe, voting | large item streams, uneven per-item latency |
| Risk | slowest worker blocks the entire batch | harder partial-state handling |
| Trace granularity | batch-level events | item + stage-level events |
| Partial results | not available until barrier resolves | available progressively |
| Checkpoint timing | after barrier resolves | per item, per stage |

## Parallel Barrier

All tasks in a batch start simultaneously. The barrier waits for every task to finish before continuing.

```ts
// parallel barrier
const results = await ctx.parallel(
  files.map(file => ctx.agent("audit", { file }))
)
// results contains every file's audit — available only after the last file finishes
const report = await ctx.agent("synthesize", { results })
```

**Choose parallel when:**
- The next phase needs the complete set of results to do its job (ranking, deduplication, cross-file comparison).
- Items are roughly uniform in latency (so the barrier cost is acceptable).
- You want simple checkpoint semantics: checkpoint after the barrier, before synthesis.

**Failure mode**: one slow or retried file delays the entire batch. Set per-agent timeouts and handle failures explicitly.

## Pipeline Stream

Each item flows through a sequence of stages. A completed item moves to the next stage immediately, without waiting for other items to finish the current stage.

```ts
// pipeline stream
for await (const verified of ctx.pipeline(files, [discover, audit, verify])) {
  ctx.checkpoint(verified)
  partial.add(verified)
}
// partial results accumulate as each file completes the full pipeline
```

**Choose pipeline when:**
- Items are independent of each other across stages.
- Per-item latency is uneven and you don't want fast items waiting for slow items.
- You want to start reporting or checkpointing partial results before all items complete.
- The task has a large number of items and you want to observe progress incrementally.

**Failure mode**: partial state is harder to reason about. A failed item mid-pipeline may leave partial results in `partial`. Design your checkpoint and result accumulation to be idempotent.

## Choosing in Practice

```
Does the next phase need ALL results before it can start?
  YES → parallel barrier
  NO  → pipeline stream

Are items approximately uniform in latency?
  YES → either; prefer parallel for simpler state
  NO  → pipeline (fast items should not wait for slow items)

Do you need incremental progress visibility?
  YES → pipeline
  NO  → either

Is deduplication or global ranking required?
  YES → parallel barrier (you need the complete set)
  NO  → either
```

## Mixing Parallel and Pipeline

Complex workflows often combine both. A typical pattern:

1. `pipeline` across files to generate per-file findings quickly.
2. `parallel` across the accumulated findings to run global deduplication and cross-file verification.
3. Final synthesis on the verified, deduplicated set.

```ts
// Phase 1: pipeline for per-file audit
const allFindings: Finding[] = []
for await (const f of ctx.pipeline(files, [discover, audit])) {
  allFindings.push(f)
  await ctx.checkpoint({ phase: 'audit', allFindings })
}

// Phase 2: parallel barrier for global cross-check
const verified = await ctx.parallel(
  allFindings.map(f => ctx.agent("cross-check", { finding: f, allFindings }))
)

// Phase 3: synthesize
return ctx.agent("synthesize", { verified: verified.filter(v => v.supported) })
```
