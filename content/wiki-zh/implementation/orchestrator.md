---
title: 编排器实现指南 / Orchestrator Implementation Guide
description: 多智能体平台的调度器、路由器和状态机。
---

# 编排器实现指南

编排器是多智能体平台的心脏。它不是"一个能写出好提示词的智能体" —— 它是**工作流引擎 + 策略引擎 + 智能体调度器 + 追踪发射器**的组合。

## 职责

| 职责 | 描述 |
|---|---|
| 规划 | 将用户目标转化为任务树或工作流 |
| 路由 | 选择智能体、工具、下一个状态 |
| 调度 | 控制并发、超时、重试、取消 |
| 检查点 | 持久化状态以支持恢复 |
| 验证 | 调用批评者 / 测试 / 人工审批 |
| 观测 | 发射追踪事件 |
| 治理 | 强制执行权限、预算和安全策略 |

## 路由策略

### 1. 基于规则的路由

适用于确定性流程：

```ts
function routeByRule(task: Task): AgentId {
  if (task.goal.includes("test")) return "test-agent";
  if (task.goal.includes("code")) return "code-agent";
  if (task.goal.includes("search")) return "search-agent";
  return "general-agent";
}
```

### 2. LLM 路由

适用于开放任务，但输出必须是结构化的：

```ts
const decisionSchema = z.object({
  action: z.enum(["call_agent", "handoff", "ask_user", "final"]),
  target: z.string().optional(),
  reason: z.string(),
  confidence: z.number(),
});
```

### 3. 混合式

生产环境推荐：规则缩小选择范围，LLM 在允许的集合中挑选。

```ts
const allowed = policy.allowedAgents(state);
const decision = await llmRouter.pick({ state, allowed });
if (!allowed.includes(decision.target)) throw new PolicyError();
```

## 调度策略

| 策略 | 用途 |
|---|---|
| 先进先出 | 普通任务队列 |
| 优先级队列 | 阻塞性用户任务优先 |
| 预算感知 | 按令牌 / 时间 / 成本预算裁剪 |
| 推测执行 | 并行运行智能体；保留最优结果 |
| 带退避的重试 | 工具或网络故障 |
| 熔断器 | 智能体反复失败时触发 |

## 检查点结构

每个检查点至少应携带：

```ts
export type Checkpoint = {
  sessionId: string;
  runId: string;
  workflowNode: string;
  taskTree: Task[];
  activeAgent?: string;
  blackboardVersion: string;
  messageCursor: string;
  toolCallCursor: string;
  budget: BudgetState;
  createdAt: string;
};
```

## 常见错误

- 编排器什么都自己做 —— 退化为单个智能体。
- 没有检查点 —— 任务无法恢复。
- LLM 路由没有策略保护 —— 智能体调用了不该调用的工具。
- 子智能体输出没有模式 —— 下游节点无法解析。
