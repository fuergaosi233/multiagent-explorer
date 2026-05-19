---
title: 点对点 / 群体智能 / Peer-to-peer / Swarm
description: 无固定中心；智能体通过直接消息、共享环境或动态交接实现自组织。
---

# 点对点 / 群体智能

## 定义

没有固定的协调者。智能体通过直接通信、共享环境或动态交接实现自组织。

**类别**：控制结构

## 结构

```mermaid
flowchart TD
  A[Agent A] <--> B[Agent B]
  B <--> C[Agent C]
  C <--> D[Agent D]
  D <--> A
  A <--> C
  B <--> D
```

## 适用场景

开放世界、去中心化网络、动态探索、研究系统、自主智能体社会。

## 不适用场景

企业生产流程、权限严格的环境、任何需要强审计和确定性的场景。

## 实现方式

1. 每个智能体维护本地状态和邻居列表。
2. 使用消息协议；不依赖单一协调者。
3. 设置 TTL、已访问集合和预算以防止消息洪泛。
4. 当需要全局结果时，引入临时聚合器或共识机制。

## 最小伪代码

```ts
async function receive(msg) {
  if (seen(msg.id) || msg.ttl <= 0) return;
  markSeen(msg.id);
  const local = await act(msg);
  for (const peer of pickPeers(local)) {
    send(peer, { ...msg, ttl: msg.ttl - 1, context: local.summary });
  }
}
```

## 推荐追踪事件

- `peer.message.sent`
- `peer.message.received`
- `peer.route.selected`
- `swarm.consensus.reached`

## 常见失效模式

- 难以收敛。
- 重复工作。
- 安全边界薄弱。
- 问责困难。

## 实现检查清单

- [ ] 输入/输出模式已定义。
- [ ] 每个智能体的权限边界已定义。
- [ ] 每次智能体调用都携带运行 ID / 追踪 ID。
- [ ] 失败、超时、取消和重试策略已定义。
- [ ] 传递的上下文是最小必要的，而非完整历史。
- [ ] 高风险操作由审批或验证器把关。

## 参考

- [Survey of communication](https://arxiv.org/html/2502.14321v2)
