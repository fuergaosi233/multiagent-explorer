---
title: Patterns Overview
description: Index of core multi-agent interaction patterns
---

# Patterns Overview

The patterns below are not mutually exclusive — they compose. A production-grade coding agent might use `Supervisor + Parallel Fan-out + Blackboard + Generator-Critic + Human-in-the-loop + MCP`, all at once.

| # | Pattern | Category | One-liner |
|---:|---|---|---|
| 1 | [Supervisor / Manager](./supervisor-manager) | Control | A primary agent plans, routes, and synthesizes; specialists execute subtasks. |
| 2 | [Agents-as-tools](./agents-as-tools) | Control | Specialists are exposed as callable tools; the host keeps conversation control. |
| 3 | [Handoff / Router](./handoff-router) | Control | The current agent transfers control to another, which takes over the conversation. |
| 4 | [Sequential Pipeline](./sequential-pipeline) | Information | Tasks pass through agents in a fixed order; each step's output is the next step's input. |
| 5 | [Parallel Fan-out / Gather](./parallel-fanout-gather) | Information | Split a task across many agents in parallel; an aggregator merges results. |
| 6 | [Hierarchical Decomposition](./hierarchical-decomposition) | Control | Multi-level manager-worker tiers; upper tiers decompose, lower tiers execute, recursively if needed. |
| 7 | [Graph / State Machine / Workflow](./graph-workflow) | Control | Define the flow with an explicit graph or state machine, not by letting the LLM improvise. |
| 8 | [Group Chat / Meeting](./group-chat) | Information | Multiple agents share one thread; a moderator or selector picks the next speaker. |
| 9 | [Nested Chat / Inner Team](./nested-chat) | Information | An agent runs an internal multi-agent sub-conversation before replying outward. |
| 10 | [Debate / Judge](./debate-judge) | Decision | Multiple agents take opposing positions, then a judge or vote picks the result. |
| 11 | [Generator-Critic](./generator-critic) | Decision | One agent produces; another critiques, verifies, scores, or proposes edits. |
| 12 | [Refinement Loop](./refinement-loop) | Decision | Generate → evaluate → revise, until an exit condition or budget is met. |
| 13 | [Role-playing / SOP](./role-playing-sop) | Environment | Agents play PM, architect, dev, QA roles bound by a documented SOP. |
| 14 | [Blackboard / Shared Memory](./blackboard-shared-memory) | Information | Agents collaborate indirectly via shared state, knowledge base, task board, or workspace. |
| 15 | [Event Bus / Pub-Sub](./event-bus-pubsub) | Information | Agents communicate asynchronously through events, topics, or queues — not direct calls. |
| 16 | [Market / Auction / Contract Net](./market-auction-contract-net) | Decision | Tasks and resources are allocated via bidding, pricing, or contract-net protocol. |
| 17 | [Peer-to-peer / Swarm](./peer-swarm) | Control | No fixed center; agents self-organize via direct messaging, shared environment, or dynamic handoff. |
| 18 | [Mixture-of-Agents](./mixture-of-agents) | Decision | Layered ensemble — each layer reads multiple outputs from the previous and improves them. |
| 19 | [Human-in-the-loop](./human-in-the-loop) | Environment | A human is a special agent for approval, correction, routing, interruption, or final decision. |
| 20 | [Protocol-mediated Network](./protocol-mediated) | Protocol | Connect tools, agents, clients, and platforms via MCP, A2A, ACP, Agent Client Protocol. |
| 21 | [Clarification-at-edge](./clarification-at-edge) | Decision | Insert a clarification step at agent-agent handoff boundaries or before uncertain actions. |
| 22 | [Coordinator / Dispatcher](./coordinator-dispatcher) | Control | Dispatcher distributes requests to agents, workflows, or tools and owns task state, retry, timeout, routing. |
| 23 | [Voting / Ensemble](./voting-ensemble) | Decision | Independent candidates from multiple agents; a vote, score, or verifier picks the final answer. |
| 24 | [Composite Pattern](./composite-pattern) | Composition | Real systems combine pipeline + parallel + handoff + critic + HITL + blackboard + protocol layers. |
| 25 | [Workspace / Sandbox Isolation](./workspace-isolation) | Environment | Each agent runs in its own workspace, git worktree, container, or sandbox to avoid concurrent corruption. |
| 26 | [Stigmergy / Environment-mediated](./stigmergy-environment-mediated) | Environment | Agents leave traces in the environment (issues, todos, diffs, test results); others react to them. |
| 27 | [Coalition / Federation / Holonic](./coalition-federation-holonic) | Organization | Agents form temporary coalitions, federations, or holons — governance, membership, autonomy boundaries. |
| 28 | [Social Simulation](./social-simulation) | Simulation | Simulate a population, organization, or society with long-term memory, relationships, emergent behavior. |
| 29 | [MARL / CTDE](./marl-ctde) | Learning | Multi-Agent Reinforcement Learning; centralized training, decentralized execution. |
