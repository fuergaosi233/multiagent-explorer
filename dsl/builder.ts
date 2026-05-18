/**
 * Multi-Agent Pattern DSL — fluent builder API.
 *
 * Provides strong type inference so:
 *   - edges only reference declared node IDs,
 *   - timeline `fire` arrays only reference declared edge IDs,
 *   - timeline `activate` / `dim` arrays only reference declared node IDs,
 *   - the final `.build()` returns an object satisfying the `Pattern` interface.
 *
 * The DSL has no runtime dependencies.
 */

import type {
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

/* ──────────────────────────────────────────────────────────────────────────
 * Node specs (id-less; the id is the key of the object passed to .nodes())
 * ──────────────────────────────────────────────────────────────────────── */

export type NodeKind = NonNullable<PatternNode['kind']>;

export interface NodeOpts {
  at: [number, number];
  w?: number;
  h?: number;
  sub?: string;
}

export interface NodeSpec {
  kind?: NodeKind;
  label: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  sub?: string;
}

function makeNode(kind: NodeKind | undefined, label: string, opts: NodeOpts): NodeSpec {
  return {
    kind,
    label,
    x: opts.at[0],
    y: opts.at[1],
    w: opts.w,
    h: opts.h,
    sub: opts.sub,
  };
}

export const node = {
  /** Plain node — no `kind` attribute (renders as the default style). */
  plain: (label: string, opts: NodeOpts): NodeSpec => makeNode(undefined, label, opts),
  accent: (label: string, opts: NodeOpts): NodeSpec => makeNode('accent', label, opts),
  dark: (label: string, opts: NodeOpts): NodeSpec => makeNode('dark', label, opts),
  user: (label: string, opts: NodeOpts): NodeSpec => makeNode('user', label, opts),
  store: (label: string, opts: NodeOpts): NodeSpec => makeNode('store', label, opts),
  bus: (label: string, opts: NodeOpts): NodeSpec => makeNode('bus', label, opts),
};

/* ──────────────────────────────────────────────────────────────────────────
 * Edges
 * ──────────────────────────────────────────────────────────────────────── */

export interface EdgeOpts {
  dashed?: boolean;
  curve?: number;
  anim?: 'bubble' | 'sparse';
}

export interface EdgeSpec<NodeId extends string = string> {
  from: NodeId;
  to: NodeId;
  label?: string;
  dashed?: boolean;
  curve?: number;
  anim?: 'bubble' | 'sparse';
}

/**
 * Create an edge between two declared nodes.
 * `from` / `to` are typed as the declared node IDs by the proxy passed in `.edges($ => …)`.
 */
export function edge<NodeId extends string>(
  from: NodeId,
  to: NodeId,
  label?: string,
  opts: EdgeOpts = {}
): EdgeSpec<NodeId> {
  const e: EdgeSpec<NodeId> = { from, to };
  if (label !== undefined) e.label = label;
  if (opts.dashed !== undefined) e.dashed = opts.dashed;
  if (opts.curve !== undefined) e.curve = opts.curve;
  if (opts.anim !== undefined) e.anim = opts.anim;
  return e;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Timeline steps
 * ──────────────────────────────────────────────────────────────────────── */

export interface StepOpts<NodeId extends string, EdgeId extends string> {
  fire?: ReadonlyArray<EdgeId | `!${EdgeId}`>;
  activate?: ReadonlyArray<NodeId>;
  dim?: ReadonlyArray<NodeId>;
  duration?: number;
}

/**
 * Create a timeline step.
 * Generic params are inferred from the `$` helper provided by `.timeline()` / `.variant()`.
 */
export function step<NodeId extends string, EdgeId extends string>(
  caption: string,
  opts: StepOpts<NodeId, EdgeId> = {}
): TimelineStep {
  const s: TimelineStep = { caption };
  if (opts.fire) s.fire = [...opts.fire];
  if (opts.activate) s.activate = [...opts.activate];
  if (opts.dim) s.dim = [...opts.dim];
  if (opts.duration !== undefined) s.duration = opts.duration;
  return s;
}

/* ──────────────────────────────────────────────────────────────────────────
 * `$` helper types
 *
 * For `.edges($ => …)` we want $ to be `{ [K in NodeId]: K }` — i.e. typing
 * `$.user` yields the literal string `"user"`, so calls like
 *   edge($.user, $.manager, …)
 * preserve type-level identity of node IDs (handy if you ever want to chain
 * further generic helpers — and at minimum gives autocomplete).
 *
 * For `.timeline($ => …)` we additionally expose `fwd(id)` and `rev(id)`
 * helpers that are restricted to the declared edge IDs.
 * ──────────────────────────────────────────────────────────────────────── */

export type NodeRefs<NodeId extends string> = { [K in NodeId]: K };

/**
 * `$` for `.timeline()` / `.variant()`: node-id constants plus edge helpers.
 *
 * Encoded as an intersection (not `interface extends`) because TypeScript
 * forbids `interface X extends GenericMapped<T>` when the supertype uses a
 * mapped type over a generic parameter.
 */
export type TimelineRefs<NodeId extends string, EdgeId extends string> = NodeRefs<NodeId> & {
  /** Forward edge reference — returns the edge id unchanged. */
  fwd<E extends EdgeId>(id: E): E;
  /** Reverse edge reference — returns `"!" + id`. */
  rev<E extends EdgeId>(id: E): `!${E}`;
};

function makeNodeRefs<NodeId extends string>(ids: ReadonlyArray<NodeId>): NodeRefs<NodeId> {
  const out = {} as Record<string, string>;
  for (const id of ids) out[id] = id;
  return out as NodeRefs<NodeId>;
}

function makeTimelineRefs<NodeId extends string, EdgeId extends string>(
  nodeIds: ReadonlyArray<NodeId>
): TimelineRefs<NodeId, EdgeId> {
  const base = makeNodeRefs(nodeIds) as TimelineRefs<NodeId, EdgeId>;
  base.fwd = (<E extends EdgeId>(id: E): E => id) as TimelineRefs<NodeId, EdgeId>['fwd'];
  base.rev = (<E extends EdgeId>(id: E): `!${E}` => `!${id}` as `!${E}`) as TimelineRefs<
    NodeId,
    EdgeId
  >['rev'];
  return base;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Internal builder state
 * ──────────────────────────────────────────────────────────────────────── */

interface BuilderState {
  id: string;
  group?: PatternGroup;
  num?: string;
  grpLabel?: string;
  title?: string;
  titleEn?: string;
  aliases?: string;
  mechanism?: string;
  nodes?: Record<string, NodeSpec>;
  edges?: Record<string, EdgeSpec>;
  timeline?: TimelineStep[];
  fit?: string;
  risks?: string;
  example?: ExampleBlock;
  code?: CodeBlock;
  variants?: PatternVariant[];
  decorations?: Decoration[];
}

/* ──────────────────────────────────────────────────────────────────────────
 * Builder classes — staged generic state so `NodeId` / `EdgeId` flow forward.
 * ──────────────────────────────────────────────────────────────────────── */

export class PatternBuilder {
  protected state: BuilderState;

  constructor(state: BuilderState) {
    this.state = state;
  }

  group(group: PatternGroup, num: string, grpLabel: string): this {
    this.state.group = group;
    this.state.num = num;
    this.state.grpLabel = grpLabel;
    return this;
  }

  title(title: string, titleEn?: string): this {
    this.state.title = title;
    if (titleEn !== undefined) this.state.titleEn = titleEn;
    return this;
  }

  aliases(aliases: string): this {
    this.state.aliases = aliases;
    return this;
  }

  mechanism(mechanism: string): this {
    this.state.mechanism = mechanism;
    return this;
  }

  fit(fit: string): this {
    this.state.fit = fit;
    return this;
  }

  risks(risks: string): this {
    this.state.risks = risks;
    return this;
  }

  example(tag: string, body: string): this {
    this.state.example = { tag, body };
    return this;
  }

  code(lang: string, snippet: string): this {
    this.state.code = { lang, snippet };
    return this;
  }

  decoration(d: Decoration): this {
    if (!this.state.decorations) this.state.decorations = [];
    this.state.decorations.push(d);
    return this;
  }

  /**
   * Declare nodes. The keys of the passed object become the node IDs and
   * are captured into the generic parameter `NodeId` for downstream stages.
   */
  nodes<N extends Record<string, NodeSpec>>(
    nodes: N
  ): PatternBuilderWithNodes<Extract<keyof N, string>> {
    this.state.nodes = nodes;
    return new PatternBuilderWithNodes<Extract<keyof N, string>>(this.state);
  }
}

export class PatternBuilderWithNodes<NodeId extends string> extends PatternBuilder {
  /**
   * Declare edges. The callback receives `$` whose keys are the declared
   * node IDs (so `$.foo` is the literal string `"foo"`, with autocomplete).
   * Edge IDs are captured into `EdgeId` for the timeline stage.
   */
  edges<E extends Record<string, EdgeSpec<NodeId>>>(
    fn: ($: NodeRefs<NodeId>) => E
  ): PatternBuilderWithEdges<NodeId, Extract<keyof E, string>> {
    const refs = makeNodeRefs(Object.keys(this.state.nodes ?? {}) as NodeId[]);
    this.state.edges = fn(refs);
    return new PatternBuilderWithEdges<NodeId, Extract<keyof E, string>>(this.state);
  }
}

export class PatternBuilderWithEdges<
  NodeId extends string,
  EdgeId extends string,
> extends PatternBuilderWithNodes<NodeId> {
  /**
   * Declare the main timeline. The callback receives `$` exposing node IDs
   * as constants plus `fwd` / `rev` helpers restricted to declared edge IDs.
   */
  timeline(fn: ($: TimelineRefs<NodeId, EdgeId>) => ReadonlyArray<TimelineStep>): this {
    const refs = makeTimelineRefs<NodeId, EdgeId>(
      Object.keys(this.state.nodes ?? {}) as NodeId[]
    );
    this.state.timeline = [...fn(refs)];
    return this;
  }

  /**
   * Add a variant. Builder callback gets a `$` over node + edge IDs and
   * returns its own timeline steps. Pass `null` for "same as main timeline".
   */
  variant(
    label: string,
    sub?: string,
    timelineFn?:
      | (($: TimelineRefs<NodeId, EdgeId>) => ReadonlyArray<TimelineStep>)
      | null
  ): this {
    if (!this.state.variants) this.state.variants = [];
    const v: PatternVariant = { label };
    if (sub !== undefined) v.sub = sub;
    if (timelineFn == null) {
      v.timeline = null;
    } else {
      const refs = makeTimelineRefs<NodeId, EdgeId>(
        Object.keys(this.state.nodes ?? {}) as NodeId[]
      );
      v.timeline = [...timelineFn(refs)];
    }
    this.state.variants.push(v);
    return this;
  }

  /**
   * Validate the accumulated state and produce a `Pattern` object suitable
   * for the existing PATTERNS array.
   *
   * Throws if:
   *   - required fields are missing,
   *   - an edge references an undeclared node,
   *   - a timeline `fire` entry references an undeclared edge,
   *   - an `activate` / `dim` entry references an undeclared node.
   */
  build(): Pattern {
    return finalize(this.state);
  }
}

/* ──────────────────────────────────────────────────────────────────────────
 * Entry point
 * ──────────────────────────────────────────────────────────────────────── */

export function definePattern(id: string): PatternBuilder {
  return new PatternBuilder({ id });
}

/* ──────────────────────────────────────────────────────────────────────────
 * Validation + assembly
 * ──────────────────────────────────────────────────────────────────────── */

function required<T>(value: T | undefined, name: string, patternId: string): T {
  if (value === undefined || value === null) {
    throw new Error(`[pattern "${patternId}"] missing required field: ${name}`);
  }
  return value;
}

function validateTimeline(
  patternId: string,
  where: string,
  steps: ReadonlyArray<TimelineStep>,
  nodeIds: ReadonlySet<string>,
  edgeIds: ReadonlySet<string>
): void {
  steps.forEach((s, idx) => {
    s.fire?.forEach((f) => {
      const eid = f.startsWith('!') ? f.slice(1) : f;
      if (!edgeIds.has(eid)) {
        throw new Error(
          `[pattern "${patternId}"] ${where} step ${idx} fires unknown edge "${f}"`
        );
      }
    });
    s.activate?.forEach((n) => {
      if (!nodeIds.has(n)) {
        throw new Error(
          `[pattern "${patternId}"] ${where} step ${idx} activates unknown node "${n}"`
        );
      }
    });
    s.dim?.forEach((n) => {
      if (!nodeIds.has(n)) {
        throw new Error(
          `[pattern "${patternId}"] ${where} step ${idx} dims unknown node "${n}"`
        );
      }
    });
  });
}

function finalize(state: BuilderState): Pattern {
  const id = state.id;
  const title = required(state.title, 'title', id);
  const mechanism = required(state.mechanism, 'mechanism', id);
  const group = required(state.group, 'group', id);
  const num = required(state.num, 'num', id);
  const grpLabel = required(state.grpLabel, 'grpLabel', id);
  const aliases = state.aliases ?? '';
  const fit = state.fit ?? '';
  const risks = state.risks ?? '';
  const example = required(state.example, 'example', id);
  const nodesObj = required(state.nodes, 'nodes', id);
  const edgesObj = state.edges ?? {};
  const timeline = required(state.timeline, 'timeline', id);

  const nodeIds = new Set(Object.keys(nodesObj));
  const edgeIds = new Set(Object.keys(edgesObj));

  // Validate edges reference real nodes.
  for (const [eid, e] of Object.entries(edgesObj)) {
    if (!nodeIds.has(e.from)) {
      throw new Error(`[pattern "${id}"] edge "${eid}" from unknown node "${e.from}"`);
    }
    if (!nodeIds.has(e.to)) {
      throw new Error(`[pattern "${id}"] edge "${eid}" to unknown node "${e.to}"`);
    }
  }

  // Validate main timeline.
  validateTimeline(id, 'timeline', timeline, nodeIds, edgeIds);

  // Validate variant timelines (when not null).
  state.variants?.forEach((v, vi) => {
    if (v.timeline) {
      validateTimeline(id, `variant[${vi}] "${v.label}"`, v.timeline, nodeIds, edgeIds);
    }
  });

  // Build the materialized node array (inject id).
  const nodes: PatternNode[] = Object.entries(nodesObj).map(([nid, n]) => {
    const out: PatternNode = { id: nid, x: n.x, y: n.y, label: n.label };
    if (n.w !== undefined) out.w = n.w;
    if (n.h !== undefined) out.h = n.h;
    if (n.sub !== undefined) out.sub = n.sub;
    if (n.kind !== undefined) out.kind = n.kind;
    return out;
  });

  // Materialize edges (strip generics to plain PatternEdge).
  const edges: Record<string, PatternEdge> = {};
  for (const [eid, e] of Object.entries(edgesObj)) {
    const out: PatternEdge = { from: e.from, to: e.to };
    if (e.label !== undefined) out.label = e.label;
    if (e.dashed !== undefined) out.dashed = e.dashed;
    if (e.curve !== undefined) out.curve = e.curve;
    if (e.anim !== undefined) out.anim = e.anim;
    edges[eid] = out;
  }

  const pattern: Pattern = {
    id,
    group,
    num,
    grpLabel,
    title,
    aliases,
    mechanism,
    nodes,
    edges,
    timeline: [...timeline],
    fit,
    risks,
    example,
  };
  if (state.titleEn !== undefined) pattern.titleEn = state.titleEn;
  if (state.code) pattern.code = state.code;
  if (state.variants && state.variants.length > 0) pattern.variants = state.variants;
  if (state.decorations && state.decorations.length > 0) {
    pattern.decorations = state.decorations;
  }
  return pattern;
}
