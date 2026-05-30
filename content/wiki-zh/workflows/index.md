---
title: 动态工作流概览 / Dynamic Workflows Overview
description: 代码编排的子智能体如何改变大规模工程任务的设计空间。
---

动态工作流（Dynamic Workflows）是 Claude Code 的一项能力（目前处于研究预览阶段）：Claude 为大任务生成一段 JavaScript 编排脚本，runtime 在后台执行该脚本并扇出子智能体完成实际工作。

## 编排能力光谱

```
单智能体 → 子智能体 → Agent View / 后台会话 → Agent Teams → 动态工作流
```

### 单智能体
单轮可完成的任务首选。成本最低、最可靠、最易调试。

### 子智能体
主智能体生成子会话隔离副任务上下文，由主智能体逐轮协调。

### Agent View / 后台会话
人工分派多个独立 Claude Code 会话，没有共享任务列表或互发消息。

### Agent Teams
多个会话共享任务列表、可互发消息，并有 lead agent 负责协调、委派、综合。

### 动态工作流
脚本承载计划、并行结构、中间变量、质量检查与收敛逻辑；子智能体执行读写、命令、Web、MCP 工作；runtime 在后台执行脚本。

**何时选动态工作流而非 Agent Teams：**

| 维度 | Agent Teams | 动态工作流 |
|---|---|---|
| 计划表示 | lead agent 的隐式推理 | 显式脚本产物 |
| 中间状态 | 各 agent 上下文 | 脚本变量 / runtime |
| 并行 | lead 分派 | 脚本控制扇出形状 |
| 恢复 | 无 | 会话内 checkpoint |
| 复用 | 仅对话 | 保存到 `.claude/workflows/` |
| 规模 | 数十 | 数十到数百 |

## 触发工作流

- 在提示中显式提到 `workflow`；
- 使用 `/effort ultracode` 提供最大资源；
- 运行 `.claude/workflows/` 或 `~/.claude/workflows/` 中保存的工作流命令。

## 监控

`/workflows` 命令查看运行中的工作流及历史，含阶段、活动 agent 数、token 总量、耗时与阶段状态。

## 延伸阅读

- [编排原语](/workflows/orchestration-primitives)
- [Parallel vs Pipeline](/workflows/parallel-vs-pipeline)
- [治理、权限与成本](/workflows/governance-permission-cost)
- [Bun Zig→Rust 迁移案例](/workflows/bun-zig-to-rust-case)

完整工程细节参见英文版页面。
