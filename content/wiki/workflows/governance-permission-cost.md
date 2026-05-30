---
title: Governance, Permission, and Cost
description: Workflows are engineering systems, not chat features. Approval, permissions, cost controls, recovery, observability, and rollback must be designed before a long run.
---

A workflow that spawns dozens of agents with write access, runs for hours, and accumulates thousands of tokens is not a chat interaction. It is a production engineering operation. Treat it accordingly.

## Approval Before Run

Before a workflow starts, the user sees:

- **Phase list**: the named phases the script will execute.
- **Cost estimate**: projected token usage based on fan-out shape and estimated agent sizes.
- **Script review**: the raw workflow script Claude wrote, before execution.

Do not skip this review. The script is a first-class artifact — read it the way you would read a migration script before running it on a production database.

**What to check in the script:**
- Are the phase boundaries where you expect them?
- Does the fan-out shape match the task scope?
- Are stop conditions present?
- Does the script write to files? Which paths?

## Permission Inheritance

Subagents inherit the tool allowlist from the parent Claude Code session. This means:

- If the session has `bash` in the allowlist, every subagent can run shell commands.
- If the session has `edit` in the allowlist, every subagent can write files.
- MCP tools, web access, and other capabilities are similarly inherited.

**Before running a large workflow:**
1. Review your current tool allowlist: which tools are pre-approved?
2. Decide whether the workflow scope justifies the allowlist breadth.
3. Consider narrowing the allowlist for the workflow session if you don't need all tools.

**Mid-run prompts**: even with a broad allowlist, some shell commands, web fetches, or MCP calls may still trigger mid-run permission prompts. These can block the workflow until resolved. Pre-approve expected tool categories before starting.

## Cost Controls

Workflows multiply token usage. A 50-file audit with a verifier per file is at minimum 100 agent calls, each with its own context.

| Control | How to apply |
|---|---|
| Start scoped | Run the workflow on a subset first — 5 files, not 500 |
| Smaller models for low-risk stages | Discovery and mapping agents don't need the same model as synthesis |
| Agent cap | Set a maximum concurrent agent count |
| Token budget | Express a budget threshold in the stop condition |
| Stop condition | Convergence check, not just budget exhaustion |

**Rule of thumb**: if you haven't run a workflow on a scoped task first, don't run it on the full codebase.

## Recovery

Within the same Claude Code session, a workflow that was interrupted can be resumed using checkpoint state.

**Limits:**
- Recovery is reliable only within the same session. If you close the session, the runtime context is gone.
- Checkpoint data may persist on disk, but the ability to resume depends on session continuity.
- Design phases so that rerunning them from a checkpoint is safe — make phase starts idempotent.

**Checkpoint strategy:**
- Checkpoint after each phase completes.
- Checkpoint per item in pipeline mode.
- Store enough state to reconstruct the fan-out shape for the remaining phases.

## Observability

A workflow run should be observable at multiple granularities:

| Level | What to track |
|---|---|
| Workflow | phase name, phase status, elapsed time, total token count, agent count |
| Phase | start time, end time, input item count, output item count |
| Agent | spawn time, completion time, task name, token usage, result schema |
| Claim | source agent, verifier agent, verdict, evidence |
| Checkpoint | timestamp, phase, persisted state size |

Use `/workflows` in Claude Code to see the progress view. For deeper observability, route workflow trace events to your own logging or monitoring system.

## Rollback

Workflows that write files create risk of unintended changes at scale. Design rollback before the run:

| Technique | When to use |
|---|---|
| Worktree isolation | Run the workflow in a git worktree; review diffs before merging |
| PR-based output | Have agents write to a branch; human merge gate before main |
| Human review gate | Split the workflow into discovery + human approval + execution phases |
| Dry-run mode | Run the workflow with write tools disabled; review the plan only |

**Minimum for any file-writing workflow**: run in a worktree or on a branch. Never run a file-writing workflow directly on your main branch without review.

## Admin Controls

Platform administrators can disable Dynamic Workflows for managed Claude Code environments or restrict them to specific users or projects. This is a deployment-level control. Refer to current Claude Code managed settings documentation for specifics — these controls are subject to change as the feature moves from research preview to general availability.
