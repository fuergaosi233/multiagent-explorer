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

## Common failures

1. Sub-agents call tools the host agent doesn't know about.
2. Permissions expand after a handoff.
3. MCP server exposes too many tools.
4. Approval cards show one line of prose without diff or impact.
5. Trace records sensitive info without redaction.
