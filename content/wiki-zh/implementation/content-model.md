---
title: Wiki 内容模型 / Wiki Content Model
description: 如何为每个多智能体模式撰写页面。
---

# Wiki 内容模型

每个模式页面应遵循统一的结构。这样 wiki 就不只是一系列文章 —— 它成为一个可搜索、可比较、导航可自动生成的知识库。

## 页面 frontmatter

```yaml
title: 监管者 / 管理者
description: 主智能体负责规划、路由和综合；专家智能体执行子任务。
category: Control
difficulty: medium
production_readiness: high
related_patterns:
  - agents-as-tools
  - graph-workflow
  - generator-critic
```

## 页面章节

1. 定义
2. 结构（Mermaid）
3. 适用场景
4. 不适用场景
5. 实现方法
6. 最小伪代码
7. 推荐追踪事件
8. 常见失败模式
9. 实现检查清单
10. 参考资料

## 模式元数据

```ts
export type PatternMeta = {
  slug: string;
  title: string;
  category: "control" | "information" | "decision" | "environment" | "protocol";
  difficulty: "easy" | "medium" | "hard";
  productionReadiness: "low" | "medium" | "high";
  latencyCost: "low" | "medium" | "high";
  tokenCost: "low" | "medium" | "high";
  bestFor: string[];
  avoidWhen: string[];
  related: string[];
};
```

## 建议的网站布局

```text
docs/
├─ index.md
├─ taxonomy.md
├─ decision-matrix.md
├─ patterns/
│  ├─ index.md
│  ├─ supervisor-manager.md
│  ├─ handoff-router.md
│  └─ ...
├─ implementation/
│  ├─ production-runtime.md
│  ├─ orchestrator.md
│  ├─ observability.md
│  └─ safety-guardrails.md
└─ reference/
   ├─ glossary.md
   └─ references.md
```
