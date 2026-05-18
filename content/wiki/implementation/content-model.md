---
title: Wiki Content Model
description: How to author a page for each multi-agent pattern.
---

# Wiki Content Model

Every pattern page should follow a uniform structure. That way the wiki is not just a collection of articles — it becomes a knowledge base that can be searched, compared, and have its navigation auto-generated.

## Page frontmatter

```yaml
title: Supervisor / Manager
description: A primary agent plans, routes, and synthesizes; specialists execute subtasks.
category: Control
difficulty: medium
production_readiness: high
related_patterns:
  - agents-as-tools
  - graph-workflow
  - generator-critic
```

## Page sections

1. Definition
2. Structure (Mermaid)
3. When to use
4. When not to use
5. How to implement
6. Minimal pseudocode
7. Recommended trace events
8. Common failure modes
9. Implementation checklist
10. References

## Pattern metadata

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

## Suggested site layout

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
