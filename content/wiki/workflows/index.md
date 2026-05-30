---
title: Dynamic Workflows Overview
description: How code-orchestrated subagents change the design space for large-scale agentic engineering tasks.
---

Dynamic Workflows is a Claude Code capability (currently in research preview) that lets Claude write a JavaScript orchestration script for a large task and have a runtime execute that script in the background, spawning subagents to do the actual work.

This page maps the full spectrum of multi-agent orchestration in Claude Code, from single agents to full dynamic workflows.

## Orchestration Spectrum

```
Single Agent
  ↓
Subagents
  ↓
Agent View / Background Sessions
  ↓
Agent Teams
  ↓
Dynamic Workflows
```

### Single Agent

Best for tasks that fit within one conversational pass. Most reliable, lowest overhead, easiest to debug. Start here.

### Subagents

Spawn one or more subagent sessions from the main agent to isolate side-task context. The main agent coordinates subagents turn by turn through its primary reasoning. Good for delegating well-scoped subtasks with independent context needs.

### Agent View / Background Sessions

Manually dispatch multiple independent Claude Code sessions from a user interface. Useful when you want parallel work but are willing to coordinate results yourself. No shared task list or inter-agent messaging.

### Agent Teams

Multiple Claude Code sessions with a shared task list, inter-agent messaging, and a designated lead agent. The lead coordinates, delegates, and synthesizes. Good for complex tasks where different agents have different specializations and need to communicate findings.

### Dynamic Workflows

A script holds the plan, parallel structure, intermediate variables, quality checks, and convergence logic. Subagents do the actual reading, editing, shell, web, and MCP work. The runtime runs the script in the background.

**When to choose Dynamic Workflows over Agent Teams:**

| Dimension | Agent Teams | Dynamic Workflows |
|---|---|---|
| Plan representation | Implicit in lead agent reasoning | Explicit script artifact |
| Intermediate state | Lives in agent contexts | Lives in script variables / runtime |
| Parallelism | Lead dispatches tasks | Script controls fan-out shape |
| Recovery | None | Checkpoint within session |
| Reuse | Conversation only | Save to `.claude/workflows/` |
| Scale | Tens of agents | Tens to hundreds of agents |

## Dynamic Workflow Pattern

See the full engineering pattern page: [Dynamic Workflow / Code-Orchestrated Subagents](/patterns/dynamic-workflow-code-orchestration)

## Triggering a Workflow

- Mention `workflow` explicitly in your prompt: _"run a workflow to audit all authentication-related files"_.
- Use `/effort ultracode` for maximum agent resources.
- Run a saved workflow command from `.claude/workflows/` or `~/.claude/workflows/`.

## Monitoring

Use `/workflows` to see running workflows and history. The progress view shows:

- Current phase
- Active agent count
- Token total
- Elapsed time
- Phase-level status

## Saving Workflows

Workflows can be saved to `.claude/workflows/` (project-level) or `~/.claude/workflows/` (user-level) and rerun with different parameters.

## Further Reading

- [Orchestration Primitives](/workflows/orchestration-primitives) — agent(), parallel(), pipeline(), checkpoint(), budget
- [Parallel vs Pipeline](/workflows/parallel-vs-pipeline) — barrier vs stream concurrency semantics
- [Governance, Permission, and Cost](/workflows/governance-permission-cost) — approval, allowlist, cost controls, recovery, rollback
- [Bun Zig→Rust Migration Case](/workflows/bun-zig-to-rust-case) — engineering breakdown of a large-scale migration
