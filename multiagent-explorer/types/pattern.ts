export interface PatternNode {
  id: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  label: string;
  sub?: string;
  kind?: 'plain' | 'accent' | 'dark' | 'user' | 'store' | 'bus';
}

export interface PatternEdge {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
  curve?: number;
  anim?: 'bubble' | 'sparse';
}

export interface TimelineStep {
  caption: string;
  fire?: string[];
  activate?: string[];
  dim?: string[];
  duration?: number;
}

export interface PatternVariant {
  label: string;
  sub?: string;
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

export interface Pattern {
  id: string;
  group: PatternGroup;
  num: string;
  grpLabel: string;
  title: string;
  titleEn?: string;
  aliases: string;
  mechanism: string;
  nodes: PatternNode[];
  edges: Record<string, PatternEdge>;
  timeline: TimelineStep[];
  fit: string;
  risks: string;
  example: ExampleBlock;
  code?: CodeBlock;
  variants?: PatternVariant[];
  decorations?: Decoration[];
}
