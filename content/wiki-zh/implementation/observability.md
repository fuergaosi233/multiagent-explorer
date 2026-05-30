---
title: 可观测性与事件模型 / Observability and Event Model
description: 多智能体平台的追踪、事件和指标设计。
---

# 可观测性与事件模型

没有追踪，多智能体平台基本上是不可维护的。你需要记录的不仅仅是最终答案 —— **每一次路由决策、消息、工具调用、交接、状态变更、审批、失败和重试**。

## 事件模型

```ts
export type AgentEvent = {
  id: string;
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  sessionId: string;
  runId: string;
  taskId?: string;
  actor: string;
  type: AgentEventType;
  payload: unknown;
  timestamp: string;
  schemaVersion: string;
};
```

## 推荐事件类型

| 类型 | 含义 |
|---|---|
| `session.started` | 会话开始 |
| `workflow.node.enter` | 进入工作流节点 |
| `agent.message.created` | 智能体产生消息 |
| `agent.task.assigned` | 任务分配给智能体 |
| `tool.call.started` | 工具调用开始 |
| `tool.call.completed` | 工具调用完成 |
| `handoff.requested` | 交接发起 |
| `handoff.accepted` | 交接接受 |
| `blackboard.item.created` | 共享状态写入 |
| `approval.requested` | 审批请求 |
| `approval.granted` | 审批通过 |
| `verifier.issue.found` | 验证器发现问题 |
| `loop.round.completed` | 精化循环迭代完成 |
| `budget.exceeded` | 预算耗尽 |
| `session.completed` | 会话结束 |

## 指标

| 指标 | 含义 |
|---|---|
| 任务成功率 | 成功任务所占比例 |
| 交接循环率 | 存在交接循环的会话比例 |
| 验证器拒绝率 | 验证器拒绝的频率 |
| 平均智能体深度 | 平均调用深度 |
| 工具失败率 | 每次调用的工具错误数 |
| 每个成功任务的成本 | 成功任务摊销的成本 |
| 人工审批延迟 | 审批队列延迟 |
| 上下文压缩比 | 压缩效果 |

## 追踪 UI 建议

将每个会话渲染为树形结构：

```text
会话
├─ 规划器
│  └─ plan.created
├─ 搜索智能体
│  ├─ tool.web_search
│  └─ result.summary
├─ 代码智能体
│  ├─ tool.read_file
│  ├─ tool.edit_file
│  └─ patch.created
├─ 测试智能体
│  └─ test.failed
├─ 代码智能体重试
└─ 审查员
   └─ approved
```

## 最小可行流水线

1. 首先将每个事件写入仅追加的 JSONL。
2. 将关键字段镜像到 Postgres / ClickHouse。
3. 使用 `traceId / spanId` 进行树形渲染。
4. 从消息和工具调用中脱敏敏感字段。
5. 最终接入 OpenTelemetry 或你自己的可观测性平台。
