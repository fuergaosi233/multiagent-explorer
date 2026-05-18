/**
 * Public surface of the Multi-Agent Pattern DSL.
 *
 * Usage:
 *   import { definePattern, node, edge, step } from "@/dsl";
 */

export { definePattern, node, edge, step } from './builder';
export type {
  EdgeOpts,
  EdgeSpec,
  NodeKind,
  NodeOpts,
  NodeRefs,
  NodeSpec,
  PatternBuilder,
  PatternBuilderWithEdges,
  PatternBuilderWithNodes,
  StepOpts,
  TimelineRefs,
} from './builder';

// Re-export the underlying Pattern types so DSL consumers have one import path.
export type {
  CodeBlock,
  Decoration,
  ExampleBlock,
  Pattern,
  PatternEdge,
  PatternGroup,
  PatternNode,
  PatternVariant,
  TimelineStep,
} from '@/types/pattern';
