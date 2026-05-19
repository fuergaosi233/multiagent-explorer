export interface PatternNode {
  id: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  label: string;
  labelZh?: string;
  sub?: string;
  subZh?: string;
  kind?: 'plain' | 'accent' | 'dark' | 'user' | 'store' | 'bus';
}

export interface PatternEdge {
  from: string;
  to: string;
  label?: string;
  labelZh?: string;
  dashed?: boolean;
  curve?: number;
  anim?: 'bubble' | 'sparse';
}

export interface TimelineStep {
  caption: string;
  captionZh?: string;
  fire?: string[];
  activate?: string[];
  dim?: string[];
  duration?: number;
}

export interface PatternVariant {
  label: string;
  labelZh?: string;
  sub?: string;
  subZh?: string;
  timeline?: TimelineStep[] | null;
}

export interface CodeBlock {
  lang: string;
  snippet: string;
}

export interface ExampleBlock {
  tag: string;
  body: string;
}

export interface Decoration {
  type: 'rect';
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
}

export type PatternGroup = 'centralized' | 'flow' | 'dialog' | 'decision' | 'decentral';

export type PatternOverlay = Partial<Omit<Pattern, 'nodes' | 'timeline'>> & {
  nodes?: Partial<PatternNode>[];
  timeline?: Partial<TimelineStep>[];
};

export interface Pattern {
  id: string;
  group: PatternGroup;
  num: string;
  grpLabel: string;
  grpLabelZh?: string;
  title: string;
  titleEn?: string;
  titleZh?: string;
  aliases: string;
  mechanism: string;
  mechanismZh?: string;
  nodes: PatternNode[];
  edges: Record<string, PatternEdge>;
  timeline: TimelineStep[];
  fit: string;
  fitZh?: string;
  risks: string;
  risksZh?: string;
  example: ExampleBlock;
  exampleZh?: ExampleBlock;
  code?: CodeBlock;
  variants?: PatternVariant[];
  decorations?: Decoration[];
}
