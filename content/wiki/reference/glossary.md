---
title: Glossary
description: Multi-Agent common terms
---

# Glossary

| Term | Meaning |
|---|---|
| Agent | An execution unit with goals, context, tools, and a policy |
| Orchestrator | Schedules agents, maintains state, drives flow |
| Supervisor | Centralized primary agent — plans, routes, synthesizes |
| Handoff | One agent transfers conversation control to another |
| Subagent | An agent invoked by a host agent, typically specialized |
| Blackboard | A shared space for state, evidence, or artifacts |
| Trace | Structured record of an agent's execution |
| MCP | Model Context Protocol — connects tools, resources, prompts |
| A2A | Agent2Agent Protocol — agent-to-agent interop |
| Agent Client Protocol | IDE/client to coding-agent protocol |
| HITL | Human-in-the-loop — humans approve, correct, decide |
| Verifier | Agent or tool that validates, reviews, or scores |
| Refinement Loop | Iterative generate → evaluate → revise loop |
| MoA | Mixture-of-Agents — layered ensemble |
| Stigmergy | Indirect agent collaboration through environment traces |
| Dynamic Workflow | A Claude Code capability where the model writes an orchestration script that a runtime executes in the background |
| Workflow Script | The JavaScript artifact Claude writes to encode phases, fan-out shape, and stop conditions for a dynamic workflow |
| Script-held Plan | Orchestration where the plan is a persistent code artifact, not implicit in each turn's reasoning |
| Parallel Barrier | Concurrency primitive that starts a batch of tasks together and waits for every task to finish before continuing |
| Pipeline Stream | Concurrency primitive that flows each item through a sequence of stages independently |
| Checkpoint | Intermediate workflow state persisted to disk so the script can resume after an interruption |
| Adversarial Verifier | A subagent prompted to disprove a finding from a worker agent before it reaches synthesis |
| Agent Team | Multiple Claude Code sessions with a shared task list, inter-agent messaging, and a designated lead agent |
| Worktree Isolation | Running parallel write agents inside separate git worktrees to avoid file-write conflicts |
| Ultracode | Claude Code mode (`/effort ultracode`) that allocates maximum agent resources, typically used with workflows |
