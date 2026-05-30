---
title: Safety, Permissions, and Guardrails
description: Security boundary design for multi-agent platforms.
---

# Safety, Permissions, and Guardrails

The biggest risk in a multi-agent platform isn't "wrong answer" — it's the uncontrolled chain of actions that emerges when multiple agents touch tools, the filesystem, shells, networks, and external systems.

## Permission tiers

| Level | Action | Default policy |
|---|---|---|
| L0 | Read-only context, read-only docs | Allow |
| L1 | File reads, search, static analysis | Allow, but logged |
| L2 | File writes, config changes | Requires policy check |
| L3 | Shell, dependency install, network calls | Requires approval or sandbox |
| L4 | git commit, deploy, database writes | Human approval required |
| L5 | Production, finance, permission changes | Denied by default or strict approval |

## Guardrail types

| Type | Examples |
|---|---|
| Input guardrail | Detect prompt injection, out-of-scope requests |
| Tool guardrail | Restrict shell commands, network domains, file paths |
| Output guardrail | Detect leaks, dangerous advice, policy violations |
| Budget guardrail | Cap tokens, time, concurrency |
| State guardrail | Prevent blackboard pollution |
| Handoff guardrail | Prevent loops and unauthorized takeover |

## Example shell policy

```ts
const shellPolicy = {
  allow: ["ls", "cat", "grep", "rg", "sed", "python -m pytest"],
  deny: ["rm -rf", "sudo", "curl | sh", "chmod 777", "docker system prune"],
  requireApproval: ["git push", "npm publish", "kubectl", "terraform apply"],
};
```

## Approval card must include

- `action` — what will run
- `reason` — why it's running
- `scope` — what it affects
- `diff` — what will change
- `rollback` — how to undo
- `risk` — severity tier
- `timeout` — what happens if approval times out

## Workflow permissions, approval, and rollback

A Dynamic Workflow can spawn dozens or hundreds of subagents with the same tool allowlist as its parent session. The guardrails for a single agent do not scale linearly — they multiply with the fan-out.

### Allowlist inheritance

Subagents spawned by a workflow script inherit the parent session's tool allowlist. A workflow with `edit` and `bash` allowed gives every subagent the same write and shell access. Before running a wide-fan-out workflow:

1. Audit the current allowlist — is every entry intentional?
2. Consider running the workflow in a session with a narrower allowlist.
3. Pre-approve expected tool categories so mid-run prompts don't block the workflow.

### Approval gate

The workflow script itself is a first-class artifact. The approval card for a workflow should include:

- The phase list and per-phase fan-out estimate.
- The token budget estimate.
- The raw script source.
- The set of tool categories the script's subagents may invoke.
- The set of file paths the script may write to.

Treat workflow approval the same way you would treat a production migration script approval.

### Rollback design

Workflows that write files at scale need rollback designed before the run. Minimum bar:

- Run inside a git worktree, never directly on main. See [Workspace Isolation](/patterns/workspace-isolation).
- Have agents output to a branch; require a human merge gate.
- Split workflows into discovery + approval + execution phases for high-risk operations.
- Support a dry-run mode where write tools are disabled and the script's intended actions are emitted as plan output.

### Admin disable

For managed Claude Code deployments, admins can disable Dynamic Workflows or restrict them by user / project. This is the right control for environments where the cost or permission risk of workflows exceeds the operational benefit.

## Common failures

1. Sub-agents call tools the host agent doesn't know about.
2. Permissions expand after a handoff.
3. MCP server exposes too many tools.
4. Approval cards show one line of prose without diff or impact.
5. Trace records sensitive info without redaction.
