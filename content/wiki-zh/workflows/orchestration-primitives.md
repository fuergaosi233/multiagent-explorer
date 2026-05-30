---
title: 编排原语 / Orchestration Primitives
description: 动态工作流脚本的概念构件 —— agent、parallel、pipeline、checkpoint、budget。
---

> 以下原语为概念性描述，不是稳定的公开 SDK。除非与最新的 Claude Code 文档对齐，否则视作伪代码。

## `agent(task, input)` — Worker 会话
为单个任务派生子智能体会话，继承父会话的工具 allowlist，返回结构化结果。

```ts
const result = await ctx.agent("audit-file", { file: "src/auth.ts" })
```

每次 `agent()` 是独立的 Claude 会话与上下文；可执行 allowlist 允许的读写、命令、Web、MCP；并发数受平台限制。

## `parallel(promises)` — Barrier 扇出
派生一批 agent 调用，并在 barrier 处等待全部完成。

```ts
const findings = await ctx.parallel(
  files.map(file => ctx.agent("audit-file", { file }))
)
```

适合需要全集才能进行的下一阶段（去重、排序、跨文件比较）。慢 worker 决定批次延迟，需要超时和失败处理。

## `pipeline(items, stages)` — 流式扇出
每个 item 独立穿过阶段序列，不在阶段边界等待其他 item。

```ts
for await (const verified of ctx.pipeline(files, [discover, audit, verify])) {
  ctx.checkpoint(verified)
}
```

适合 item 互相独立、延迟不均、需要渐进式结果可见性的任务。部分状态更复杂，需要 idempotent 设计。

## `checkpoint(state)` — 中间持久化
保存中间状态以便中断后恢复。同一会话内可可靠恢复；跨会话恢复不保证。每个有显著成本的阶段后都应 checkpoint。

## `budget` 与停止条件 — 防失控
脚本应表达显式停止条件：

```ts
while (!converged && ctx.budget.remaining > 0.2) { /* iterate */ }
```

任何循环都必须有逻辑收敛检查 + 预算守卫。

## Verifier / 对抗审查
一种模式：派生专门尝试反驳 worker findings 的 agent。worker 与 verifier 不应共享上下文；过滤应在编排层完成，而非交给综合 agent。

完整工程细节参见英文版页面。
