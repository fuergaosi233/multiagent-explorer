---
title: Decision Matrix
description: Pick a multi-agent pattern by task characteristics
---

# Decision Matrix

## By task characteristic

| Task characteristic | Recommended | Avoid | Why |
|---|---|---|---|
| Single-turn expert query | Agents-as-tools | Handoff / Group Chat | The host can simply retain control |
| Multi-turn domain takeover | Handoff | Agents-as-tools | The specialist needs to talk to the user directly |
| Fixed flow | Sequential Pipeline / Workflow | Swarm | Determinism is the point |
| Many independent subtasks | Parallel Fan-out / Gather | Sequential | Parallelism gives the most speedup |
| Long, complex tasks | Graph Workflow + Task Registry | Pure prompt orchestration | Resume, cancel, trace required |
| Quality review needed | Generator-Critic / Refinement Loop | Single agent self-grading | Self-grade often reproduces the same error |
| Comparing multiple options | Debate / Voting / MoA | Single path | Multiple candidates surface conflict |
| Async multi-party work | Blackboard / Event Bus | Group Chat | Shared state is steadier than long conversations |
| High-risk operation | Human-in-the-loop + Guardrails | Fully automated | Permission and accountability must be explicit |
| Codebase-wide audit | Dynamic Workflow + Parallel + Verifier + Worktrees | Single agent | Per-file fan-out + adversarial review at scale |
| 500-file migration | Dynamic Workflow + Worktree Isolation + Test Loop | Single agent / Group Chat | Parallel per-file porting, build/test fix loop, PR output |
| Cross-checked research | Dynamic Workflow + Deep Research style verification | Single agent | Independent claim verification before synthesis |
| Requires mid-run human sign-off | Split into multiple workflows + HITL gates | Single long workflow | Workflows do not accept mid-run user input |
| Cross-tool ecosystem | MCP | Custom tool protocol | Lowers integration cost |
| Cross-agent / cross-vendor | A2A / ACP | Private RPC | Better suited to interoperability |
| IDE to coding agent | Agent Client Protocol | Ad-hoc HTTP API | Closer to coding-agent standard onboarding |

## By engineering stage

| Stage | Goal | Recommended stack |
|---|---|---|
| Demo | Prove it can work | Single Agent + Tools + Agents-as-tools |
| MVP | Usable | Supervisor + Handoff + Trace |
| Internal platform | Stable, resumable | Graph Workflow + Task Registry + Blackboard + MCP |
| Production platform | Secure, auditable | Runtime + Guardrails + HITL + Event Bus + Workspace Isolation |
| Ecosystem | Connected to other systems | MCP + A2A/ACP + Agent Client Protocol |

## Anti-patterns

1. **Reaching for a group chat first.** Looks like multi-agent, rarely converges.
2. **Long tasks without a state machine.** Half-done tasks can't resume or be debugged.
3. **All agents sharing one context.** Heavy pollution, permission boundaries vanish.
4. **Code generation without a verifier.** Agents confidently produce wrong diffs.
5. **No event log.** When something breaks, you can't reconstruct what happened.
