import type { Pattern, PatternNode, PatternEdge, TimelineStep, PatternVariant } from '@/types/pattern';

export function localizePattern(pattern: Pattern, locale: string): Pattern {
  if (locale !== 'zh') return pattern;

  return {
    ...pattern,
    title: pattern.titleZh ?? pattern.title,
    mechanism: pattern.mechanismZh ?? pattern.mechanism,
    fit: pattern.fitZh ?? pattern.fit,
    risks: pattern.risksZh ?? pattern.risks,
    grpLabel: pattern.grpLabelZh ?? pattern.grpLabel,
    nodes: pattern.nodes.map(localizeNode),
    edges: localizeEdges(pattern.edges),
    timeline: pattern.timeline.map(localizeStep),
    example: pattern.exampleZh ?? pattern.example,
    variants: pattern.variants?.map(localizeVariant),
  };
}

function localizeNode(node: PatternNode): PatternNode {
  return {
    ...node,
    label: node.labelZh ?? node.label,
    sub: node.subZh ?? node.sub,
  };
}

function localizeEdges(edges: Record<string, PatternEdge>): Record<string, PatternEdge> {
  const out: Record<string, PatternEdge> = {};
  for (const [k, v] of Object.entries(edges)) {
    out[k] = { ...v, label: v.labelZh ?? v.label };
  }
  return out;
}

function localizeStep(step: TimelineStep): TimelineStep {
  return {
    ...step,
    caption: step.captionZh ?? step.caption,
  };
}

function localizeVariant(v: PatternVariant): PatternVariant {
  return {
    ...v,
    label: v.labelZh ?? v.label,
    sub: v.subZh ?? v.sub,
    timeline: v.timeline?.map(localizeStep) ?? v.timeline,
  };
}
