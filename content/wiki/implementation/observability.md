---
title: Observability and Event Model
description: Trace, event, and metrics design for a multi-agent platform.
---

# Observability and Event Model

Without a trace, a multi-agent platform is essentially unmaintainable. You need to record more than the final answer — **every routing decision, message, tool call, handoff, state change, approval, failure, and retry**.

## Event model

```ts
export type AgentEvent = {
  id: string;
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  sessionId: string;
  runId: string;
  taskId?: string;
  actor: string;
  type: AgentEventType;
  payload: unknown;
  timestamp: string;
  schemaVersion: string;
};
```

## Recommended event types

| Type | Meaning |
|---|---|
| `session.started` | Session begins |
| `workflow.node.enter` | Entered a workflow node |
| `agent.message.created` | Agent produced a message |
| `agent.task.assigned` | Task assigned to an agent |
| `tool.call.started` | Tool call began |
| `tool.call.completed` | Tool call finished |
| `handoff.requested` | Handoff initiated |
| `handoff.accepted` | Handoff accepted |
| `blackboard.item.created` | Shared state written |
| `approval.requested` | Approval requested |
| `approval.granted` | Approval granted |
| `verifier.issue.found` | Verifier raised an issue |
| `loop.round.completed` | Refinement loop iteration finished |
| `budget.exceeded` | Budget exhausted |
| `session.completed` | Session ended |

## Metrics

| Metric | Meaning |
|---|---|
| Task success rate | Share of tasks that succeed |
| Handoff loop rate | Share of sessions with handoff loops |
| Verifier rejection rate | How often the verifier rejects |
| Average agent depth | Average call depth |
| Tool failure rate | Tool errors per call |
| Cost per successful task | Cost amortized over wins |
| Human approval latency | Approval queue delay |
| Context compression ratio | Compression effectiveness |

## Trace UI suggestion

Render each session as a tree:

```text
Session
├─ Planner
│  └─ plan.created
├─ Search Agent
│  ├─ tool.web_search
│  └─ result.summary
├─ Code Agent
│  ├─ tool.read_file
│  ├─ tool.edit_file
│  └─ patch.created
├─ Test Agent
│  └─ test.failed
├─ Code Agent retry
└─ Reviewer
   └─ approved
```

## Workflow run observability

A Dynamic Workflow run produces a richer event tree than a single agent. Events are needed at the workflow, phase, agent, claim, and checkpoint layers so that any node in the tree can be reconstructed after the run.

| Event type | When emitted | Key fields |
|---|---|---|
| `workflow.created` | Claude wrote the script | workflowId, script, phases, estimatedTokens |
| `workflow.approved` | User confirmed before run | workflowId, approvedAt, approvedBy |
| `workflow.phase.started` | Script entered a named phase | workflowId, phase, inputCount |
| `workflow.phase.completed` | Phase exited successfully | workflowId, phase, outputCount, tokens |
| `agent.spawned` | Script called `agent()` / `parallel()` | workflowId, phase, agentTask, parentSpanId |
| `agent.completed` | Subagent returned | agentId, tokens, durationMs, resultSchema |
| `claim.verified` | Verifier accepted or rejected a finding | findingId, verifierAgentId, verdict, evidence |
| `workflow.checkpoint.saved` | Runtime persisted state | workflowId, phase, stateBytes |
| `workflow.checkpoint.resumed` | Script restarted from checkpoint | workflowId, phase, resumedAt |
| `workflow.finalized` | Final synthesis returned to user session | workflowId, totalTokens, totalAgents, durationMs |

The trace tree for a workflow run typically nests as:

```
workflow.created
└─ workflow.approved
   └─ workflow.phase.started (discover)
      ├─ agent.spawned (map-codebase)
      └─ agent.completed
   └─ workflow.phase.started (audit)
      ├─ agent.spawned × N (audit-file, parallel barrier)
      └─ agent.completed × N
   └─ workflow.checkpoint.saved
   └─ workflow.phase.started (verify)
      ├─ agent.spawned × N (adversarial-review)
      ├─ claim.verified × N
   └─ workflow.finalized
```

Every workflow event should carry the `workflowId`, and every nested `agent.*` event should carry the originating `phase` so that traces can be sliced by phase or by agent.

## Minimum viable pipeline

1. Write every event to append-only JSONL first.
2. Mirror key fields into Postgres / ClickHouse.
3. Use `traceId / spanId` for tree rendering.
4. Redact sensitive fields from messages and tool calls.
5. Eventually feed OpenTelemetry or your own observability platform.
