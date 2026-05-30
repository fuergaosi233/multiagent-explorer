---
title: Orchestration Primitives
description: The conceptual building blocks of a Dynamic Workflow script — agent, parallel, pipeline, checkpoint, and budget.
---

> **Note**: The primitives described here are conceptual. They explain the engineering patterns, not a stable public SDK. Treat all code as pseudo-code unless you verify it against current Claude Code documentation.

A Dynamic Workflow script uses a small set of primitives to express orchestration logic. Each primitive maps to a distinct concurrency or quality-control concern.

## `agent(task, input)` — Worker Session

Spawns a subagent session to perform a specific task. The subagent has access to the tool allowlist inherited from the parent session. The call returns a structured result.

```ts
const result = await ctx.agent("audit-file", { file: "src/auth.ts" })
```

**Engineering semantics:**
- Each `agent()` call is a separate Claude session with its own context.
- The agent can read files, run shell commands, call web, invoke MCP — whatever the allowlist permits.
- The agent result is a structured value in the script, not a conversational message.
- Agent count is bounded by the platform concurrency limit.

**When to use:** Any unit of work that requires tool access, consumes significant context, or should be isolated from sibling workers.

## `parallel(promises)` — Barrier Fan-out

Spawns a batch of agent calls and waits for all of them to complete before proceeding. This is barrier semantics.

```ts
const findings = await ctx.parallel(
  files.map(file => ctx.agent("audit-file", { file }))
)
// findings is available only after every file agent has finished
```

**Engineering semantics:**
- All tasks in the batch start together.
- The next stage does not begin until every task in the batch has returned.
- Useful for global comparison, deduplication, voting, sorting across the full result set.
- The slowest worker determines the batch latency.

**When to use:** When the next phase requires the complete set of results — e.g., ranking across all findings, deduplication across all audited files.

**Risk:** One slow or failing worker blocks the entire batch. Design workers to be independent and bounded.

## `pipeline(items, stages)` — Stream Fan-out

Sends each item through a sequence of stages independently. Items do not wait for each other at stage boundaries.

```ts
for await (const verified of ctx.pipeline(files, [discover, audit, verify])) {
  ctx.checkpoint(verified)
  partial.add(verified)
}
```

**Engineering semantics:**
- Each item flows through stages as soon as the previous stage completes for that item.
- A slow item does not block fast items from proceeding through later stages.
- Partial results can be checkpointed and synthesized progressively.
- Requires more careful partial-state handling than a single barrier.

**When to use:** When items are independent and the task benefits from early partial results — e.g., large file streams, uneven per-file latency, progressive report building.

## `checkpoint(state)` — Intermediate Persistence

Saves intermediate state to disk so the workflow can resume after an interruption.

```ts
await ctx.checkpoint({ phase: 'audit', completed: auditedFiles, findings })
```

**Engineering semantics:**
- Checkpoint data is persisted by the runtime, not by the script's JavaScript process.
- On resume (within the same Claude Code session), the script can reload checkpoint state and skip already-completed phases.
- Recovery across sessions is not guaranteed — the checkpoint may exist but the runtime context needed to continue may not.

**When to use:** Before and after any phase that has significant compute cost. Design phases so that rerunning them from a checkpoint is safe (idempotent).

## `budget` and stop conditions — Runaway Prevention

The script should express explicit stop conditions to prevent unbounded runs.

```ts
while (!converged && ctx.budget.remaining > 0.2) {
  // iterate
}
```

**Engineering semantics:**
- Token budget, agent count, and elapsed time are all observable from the script.
- A stop condition should be a logical convergence check, not just a budget threshold.
- The platform may also enforce external limits.

**When to use:** Always. Every workflow that loops should have an explicit convergence condition and a budget guard.

## Verifier / Adversarial Review

Not a primitive call but a pattern: spawn a separate agent whose goal is to disprove or stress-test a finding from a worker agent.

```ts
const checked = await ctx.parallel(
  findings.map(f => ctx.agent("adversarial-review", f))
)
const verified = checked.filter(x => x.verdict === 'supported')
```

**Engineering semantics:**
- Workers and verifiers should not share context — correlation between them defeats the purpose of cross-checking.
- Verifier prompts should be adversarial: "find evidence that contradicts this claim."
- Filter at the orchestration layer, not at the synthesis layer.

**When to use:** Any workflow where the quality of findings matters enough to justify the extra token cost of independent review.
