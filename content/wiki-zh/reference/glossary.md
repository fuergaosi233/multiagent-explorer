---
title: 术语表
description: 多智能体常见术语
---

# 术语表

| 术语 | 含义 |
|---|---|
| Agent（智能体） | 一个具备目标、上下文、工具和策略的执行单元 |
| Orchestrator（编排器） | 调度智能体、维护状态、驱动流程 |
| Supervisor（监督者） | 集中式主智能体 —— 负责规划、路由、综合 |
| Handoff（交接） | 一个智能体将对话控制权转移给另一个智能体 |
| Subagent（子智能体） | 由宿主智能体调用的智能体，通常具有专门化能力 |
| Blackboard（黑板） | 用于状态、证据或产物的共享空间 |
| Trace（追踪） | 智能体执行的结构化记录 |
| MCP | Model Context Protocol（模型上下文协议）—— 连接工具、资源、提示词 |
| A2A | Agent2Agent Protocol（智能体间协议）—— 智能体之间的互操作 |
| Agent Client Protocol（智能体客户端协议） | IDE/客户端与编码智能体之间的协议 |
| HITL | Human-in-the-loop（人在回路）—— 人类进行审批、修正和决策 |
| Verifier（验证器） | 负责验证、审查或打分的智能体或工具 |
| Refinement Loop（精化循环） | 迭代式的生成 → 评估 → 修正循环 |
| MoA | Mixture-of-Agents（智能体混合）—— 分层集成 |
| Stigmergy（间接协作） | 智能体通过环境痕迹进行间接协作 |
| 动态工作流（Dynamic Workflow） | Claude Code 中模型生成编排脚本、由 runtime 在后台执行的能力 |
| 工作流脚本（Workflow Script） | Claude 写出的 JavaScript 产物，编码阶段、扇出形状和停止条件 |
| 脚本承载计划（Script-held Plan） | 计划是持久化的代码产物，而非每轮推理的隐式产物 |
| Parallel Barrier（并行屏障） | 整批任务同时开始，barrier 处等待所有任务完成 |
| Pipeline Stream（流水线） | 每个 item 独立穿过阶段序列 |
| Checkpoint（检查点） | 工作流中间状态持久化，以便中断后恢复 |
| Adversarial Verifier（对抗验证器） | 被提示去反驳 worker findings 的子智能体 |
| Agent Team | 多个共享任务列表、可互发消息并指定 lead agent 的 Claude Code 会话 |
| Worktree Isolation（工作树隔离） | 并行写智能体运行在独立 git worktree 内以避免冲突 |
| Ultracode | Claude Code 的 `/effort ultracode` 模式，分配最大 agent 资源，通常配合工作流使用 |
