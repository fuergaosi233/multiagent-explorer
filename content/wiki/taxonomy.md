---
title: Taxonomy
description: A five-dimensional taxonomy of multi-agent patterns
---

# Taxonomy: a five-dimensional view

Don't classify multi-agent patterns by framework name. Classify them by engineering dimension. Any real system usually composes several patterns at once — for example: `Supervisor + Parallel Fan-out + Blackboard + Verifier + Human Approval + MCP`.

## 1. Control structure

| Type | Where control lives | Representative patterns | When it fits |
|---|---|---|---|
| Centralized | One coordinator / manager owns the flow | Supervisor, Agents-as-tools, Router | Stable production flows, support triage, enterprise tasks |
| Transfer | The active agent can hand off control | Handoff | Multi-domain expert switching, long conversations |
| Hierarchical | Managers manage workers; workers may decompose further | Hierarchical | Large projects, cross-team, multi-phase work |
| Decentralized | No fixed center; agents talk or relay on their own | Peer-to-peer, Swarm | Open exploration, autonomous networks |

## 2. Information flow

| Type | How information moves | Representative patterns |
|---|---|---|
| Linear | A's output feeds B, B's output feeds C | Sequential Pipeline |
| Parallel | Many agents run concurrently; results merged | Parallel Fan-out / Gather |
| Shared thread | Several agents speak in one thread | Group Chat |
| Inner session | An agent triggers an internal sub-conversation | Nested Chat |
| Shared state | Agents don't chat directly; they read/write a workspace | Blackboard |
| Event stream | Communication via topic / queue / event bus | Event Bus / Pub-Sub |

## 3. Decision making

| Type | How a decision is reached | Representative patterns |
|---|---|---|
| Manager picks | Coordinator chooses the next step | Supervisor, Router |
| Reviewer judges | Critic / verifier scores quality | Generator-Critic |
| Iterative | Loop until a condition is met | Refinement Loop |
| Adversarial | Pro/con sides argue; a judge concludes | Debate / Judge |
| Group | Multiple agents vote or ensemble | Voting / MoA |
| Market | Agents bid, price, or negotiate | Market / Contract Net |

## 4. Execution environment

| Type | Emphasis | Representative patterns |
|---|---|---|
| Role-driven | Agents have professional roles and SOPs | Role-playing / Virtual Company |
| Environment isolation | Agents run in distinct workspaces / sandboxes | Workspace Isolation |
| Human-coupled | A human is a special agent — approves, corrects | Human-in-the-loop |
| Environment-mediated | Agents collaborate by modifying shared environment | Stigmergy |
| Simulated learning | Agents interact or train in a simulated environment | Social Simulation / MARL |

## 5. Protocol interconnect

| Protocol | Who connects to whom | Use |
|---|---|---|
| MCP | Agent ↔ Tool / Resource / Prompt | Standardized exposure of tools, data, prompts |
| A2A | Agent ↔ Agent | Cross-framework, cross-vendor agent collaboration |
| ACP / ANP | Agent ↔ Agent / Network | Agent communication, identity, network discovery |
| Agent Client Protocol | IDE / Client ↔ Coding agent | Standardized link between editors and coding agents |

## In closing

Don't ask "which multi-agent pattern is strongest" — ask:

- Does the task need decomposition?
- Can the subtasks run in parallel?
- Does a specialist need to own the conversation?
- Is review and rollback required?
- Is cross-system interop required?
- Is long-lived state and observability required?

If the answers are mostly "no," don't reach for multi-agent yet. A single agent with the right tools and the right context is often more reliable.
