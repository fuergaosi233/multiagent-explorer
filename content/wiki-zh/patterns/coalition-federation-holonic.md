---
title: 联盟、联邦与 Holonic 组织
description: 智能体围绕任务临时组成联盟、团队、联邦或全息体。
---

# 联盟、联邦与 Holonic 组织

## 定义

多个智能体围绕任务临时组成联盟、团队、联邦或全息体。重点是治理、成员资格和自主权边界——而非单一的调用流程。

**类别**：组织

## 结构

```mermaid
flowchart TD
  Org[智能体组织] --> C1[联盟 A]
  Org --> C2[联邦 B]
  Org --> H[全息体]
  C1 --> A1[智能体 1]
  C1 --> A2[智能体 2]
  C2 --> A3[智能体 3]
  C2 --> A4[智能体 4]
  H --> Sub[子全息体 / 团队]
```

## 适用场景

跨团队协作、开放智能体网络、跨组织任务、互联的内部智能体平台。

## 不适用场景

小型固定流程；无动态团队组建；简单权限边界。

## 实现方法

1. 定义组织注册表：组织、成员、能力、信任等级。
2. 定义加入、退出、授权和撤销规则。
3. 对于联盟任务，建立共享契约：目标、资源、收益、问责。
4. 联邦系统必须清晰区分本地自主权和全局协调。

## 最小伪代码

```ts
type Organization = {
  id: string;
  type: "coalition" | "federation" | "holon" | "team";
  members: AgentId[];
  policy: AccessPolicy;
  sharedGoal?: string;
};

function formCoalition(task, candidates) {
  return candidates.filter(a => matches(task.requiredSkills, a.skills));
}
```

## 推荐的追踪事件

- `organization.created`
- `organization.member.joined`
- `organization.member.left`
- `organization.policy.updated`

## 常见失败模式

- 成员权限不明确。
- 联盟目标与个体目标冲突。
- 组织状态从未被清理。

## 实现检查清单

- [ ] 触发和退出条件已定义。
- [ ] 输入/输出模式已定义。
- [ ] 权限、预算、超时和重试策略已定义。
- [ ] 追踪事件已定义。
- [ ] 降级或人工接管策略已定义。

## 参考

- [Organisational paradigms in multi-agent systems](https://dl.acm.org/doi/abs/10.1017/s0269888905000317)
