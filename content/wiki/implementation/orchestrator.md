---
title: Orchestrator Implementation Guide
description: Scheduler, router, and state machine for a multi-agent platform.
---

# Orchestrator Implementation Guide

The orchestrator is the heart of a multi-agent platform. It is *not* "an agent that writes good prompts" — it is the combination of **workflow engine + policy engine + agent scheduler + trace emitter**.

## Responsibilities

| Responsibility | Description |
|---|---|
| Plan | Turn a user goal into a task tree or workflow |
| Route | Choose the agent, the tool, the next state |
| Schedule | Control concurrency, timeouts, retry, cancel |
| Checkpoint | Persist state to support resume |
| Verify | Call critic / test / human approval |
| Observe | Emit trace events |
| Govern | Enforce permission, budget, and safety policy |

## Routing strategies

### 1. Rule-based routing

Good for deterministic flows:

```ts
function routeByRule(task: Task): AgentId {
  if (task.goal.includes("test")) return "test-agent";
  if (task.goal.includes("code")) return "code-agent";
  if (task.goal.includes("search")) return "search-agent";
  return "general-agent";
}
```

### 2. LLM routing

Suitable for open tasks, but the output must be structured:

```ts
const decisionSchema = z.object({
  action: z.enum(["call_agent", "handoff", "ask_user", "final"]),
  target: z.string().optional(),
  reason: z.string(),
  confidence: z.number(),
});
```

### 3. Hybrid

Production recommendation: rules narrow the choice, the LLM picks within the allowed set.

```ts
const allowed = policy.allowedAgents(state);
const decision = await llmRouter.pick({ state, allowed });
if (!allowed.includes(decision.target)) throw new PolicyError();
```

## Scheduling strategies

| Strategy | Use |
|---|---|
| FIFO | Ordinary task queue |
| Priority queue | Blocking user tasks first |
| Budget-aware | Trim by token / time / cost budget |
| Speculative | Run agents in parallel; keep the best |
| Retry with backoff | Tool or network failures |
| Circuit breaker | Trip when an agent fails repeatedly |

## Checkpoint shape

Each checkpoint should carry at least:

```ts
export type Checkpoint = {
  sessionId: string;
  runId: string;
  workflowNode: string;
  taskTree: Task[];
  activeAgent?: string;
  blackboardVersion: string;
  messageCursor: string;
  toolCallCursor: string;
  budget: BudgetState;
  createdAt: string;
};
```

## From prompt orchestration to script-held orchestration

A prompt-orchestrated supervisor and a script-held workflow are both orchestrators, but they make different engineering tradeoffs.

| Aspect | Prompt orchestrator | Script-held orchestrator (Dynamic Workflow) |
|---|---|---|
| Plan representation | Implicit in each turn of the supervisor agent | Explicit JavaScript artifact |
| Iteration source | Model re-derives next step each turn | Loop / branch baked into the script |
| Intermediate state | Lives in the supervisor's context window | Lives in script variables and runtime |
| Recoverability | Bounded by context retention | Checkpoint primitive enables resume |
| Reuse | Conversation-only | Save and rerun (`.claude/workflows/`) |
| Observability granularity | Turn-level traces | Phase + per-agent + per-claim traces |
| Failure mode | Plan drift as context fills | Script bugs, but the bug is inspectable |

When the orchestrator must hold a plan across many fan-out calls and survive an interruption, a script-held design pays for itself. When the task is short and interactive, a prompt orchestrator stays simpler. See the [Dynamic Workflow](/patterns/dynamic-workflow-code-orchestration) pattern page for the full topology.

## Common mistakes

- The orchestrator does everything itself — devolves into a single agent.
- No checkpointing — tasks cannot resume.
- LLM routing without policy guard — agents call tools they shouldn't.
- Sub-agent outputs without schemas — downstream nodes can't parse them.
