---
title: Parallel vs Pipeline / 并行屏障 vs 流水线
description: Barrier 语义 vs Stream 语义 —— 并发模型差异决定原语选择。
---

`parallel` 与 `pipeline` 不是名字不同的等价物，并发模型完全不同。选错会带来不必要的延迟或不必要的复杂度。

## 对比

| 维度 | Parallel barrier | Pipeline stream |
|---|---|---|
| 调度 | 整批同时开始 | 每个 item 独立流动 |
| 阻塞 | 下一阶段等所有 item | 下一阶段按 item 触发 |
| 适合 | 全局比较、去重、投票 | 大量 item、延迟不均 |
| 风险 | 慢 worker 拖累整批 | 部分状态更复杂 |
| 部分结果 | barrier 之前无 | 渐进可用 |
| Checkpoint | barrier 后 | 每个 item / 阶段 |

## 怎么选

- 下一阶段需要全集才能开始？**Parallel**
- item 延迟差异大、要尽早出部分结果？**Pipeline**
- 需要去重 / 全局排名？**Parallel**
- 想要渐进式进度可见性？**Pipeline**

## 混用

常见组合：先 pipeline 出 per-file findings，再 parallel barrier 做全局交叉验证，最后综合。完整代码示例与失败模式说明参见英文版页面。
