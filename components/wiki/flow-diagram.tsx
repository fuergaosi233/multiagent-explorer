'use client';
import { useEffect, useMemo, useState, useRef } from 'react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import dagre from 'dagre';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  Handle,
  Position,
  type Edge,
  type Node,
  type NodeProps,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Maximize2 } from 'lucide-react';
import { parseFlowchart, type FlowDirection, type ParsedFlow, type NodeShape } from '@/lib/mermaid-parser';
import { cn } from '@/lib/utils';

interface Props {
  chart: string;
  fallback?: React.ReactNode;
  height?: number;
}

const NODE_W = 200;
const NODE_H = 56;

const SHAPE_CLASS: Record<NodeShape, string> = {
  rect: 'rounded-lg',
  round: 'rounded-full',
  circle: 'rounded-full aspect-square',
  cylinder: 'rounded-2xl',
  diamond: 'rotate-45 rounded-md',
};

const SHAPE_LABEL_CLASS: Record<NodeShape, string> = {
  rect: '',
  round: '',
  circle: '',
  cylinder: '',
  diamond: '-rotate-45',
};

function autoTone(id: string, label: string): string {
  const prefix = id.match(/^[A-Za-z]+/)?.[0]?.toUpperCase() ?? id;
  const seed = prefix.charCodeAt(0) % 6;
  const TONES = [
    'border-amber-500/40 bg-amber-500/[0.06] text-amber-700 dark:text-amber-300',
    'border-sky-500/40 bg-sky-500/[0.06] text-sky-700 dark:text-sky-300',
    'border-violet-500/40 bg-violet-500/[0.06] text-violet-700 dark:text-violet-300',
    'border-emerald-500/40 bg-emerald-500/[0.06] text-emerald-700 dark:text-emerald-300',
    'border-rose-500/40 bg-rose-500/[0.06] text-rose-700 dark:text-rose-300',
    'border-zinc-500/40 bg-zinc-500/[0.06] text-zinc-700 dark:text-zinc-300',
  ];
  void label;
  return TONES[seed];
}

function FlowNode({ data }: NodeProps<Node<{ label: string; shape: NodeShape; tone: string }>>) {
  const shape = data.shape;
  return (
    <div
      className={cn(
        'group/node flex h-full w-full items-center justify-center border bg-card px-3 py-2 text-center shadow-sm transition-all hover:scale-[1.03] hover:shadow-md',
        SHAPE_CLASS[shape],
        data.tone,
      )}
    >
      <Handle type="target" position={Position.Top} className="!size-1.5 !border-0 !bg-transparent" />
      <Handle type="target" position={Position.Left} className="!size-1.5 !border-0 !bg-transparent" />
      <span className={cn('text-[12px] font-medium leading-snug', SHAPE_LABEL_CLASS[shape])}>
        {data.label}
      </span>
      <Handle type="source" position={Position.Bottom} className="!size-1.5 !border-0 !bg-transparent" />
      <Handle type="source" position={Position.Right} className="!size-1.5 !border-0 !bg-transparent" />
    </div>
  );
}

const NODE_TYPES = { wiki: FlowNode };

function layout(flow: ParsedFlow): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: flow.direction, nodesep: 50, ranksep: 70, marginx: 20, marginy: 20 });
  g.setDefaultEdgeLabel(() => ({}));

  for (const n of flow.nodes) g.setNode(n.id, { width: NODE_W, height: NODE_H });
  for (const e of flow.edges) g.setEdge(e.source, e.target);

  dagre.layout(g);

  const isHorizontal = flow.direction === 'LR' || flow.direction === 'RL';

  const nodes: Node[] = flow.nodes.map(n => {
    const pos = g.node(n.id);
    return {
      id: n.id,
      type: 'wiki',
      position: { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 },
      data: { label: n.label, shape: n.shape, tone: autoTone(n.id, n.label) },
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      draggable: true,
      width: NODE_W,
      height: NODE_H,
    };
  });

  const edges: Edge[] = flow.edges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    animated: !e.noArrow,
    style: {
      stroke: 'hsl(var(--brand))',
      strokeWidth: 1.5,
      strokeDasharray: e.dashed ? '6 4' : undefined,
    },
    labelStyle: { fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontFamily: 'var(--font-mono)' },
    labelBgStyle: { fill: 'hsl(var(--background))', fillOpacity: 0.85 },
    type: 'smoothstep',
    markerEnd: e.noArrow ? undefined : { type: MarkerType.ArrowClosed, color: 'hsl(var(--brand))' },
  }));

  return { nodes, edges };
}

function Inner({ flow, height = 480 }: { flow: ParsedFlow; height?: number }) {
  const { resolvedTheme } = useTheme();
  const { nodes, edges } = useMemo(() => layout(flow), [flow]);

  return (
    <div
      className="relative size-full"
      style={{
        ['--xy-edge-stroke' as string]: 'hsl(var(--brand))',
        ['--xy-edge-stroke-selected' as string]: 'hsl(var(--brand))',
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        colorMode={resolvedTheme === 'dark' ? 'dark' : 'light'}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        nodesDraggable
        nodesConnectable={false}
        edgesFocusable={false}
        zoomOnScroll
        panOnScroll={false}
        panOnDrag
        minZoom={0.3}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ animated: true }}
        style={{ width: '100%', height }}
      >
        <Background variant={BackgroundVariant.Dots} gap={18} size={1.2} />
        <Controls position="bottom-right" showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

export function FlowDiagram({ chart, fallback, height = 480 }: Props) {
  const flow = useMemo(() => parseFlowchart(chart), [chart]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('diagram');

  if (!flow) return fallback ?? null;

  return (
    <>
      <div
        ref={containerRef}
        className="group relative my-4 overflow-hidden rounded-xl border border-border bg-gradient-to-br from-muted/30 via-background to-muted/20 shadow-sm"
        style={{ height }}
      >
        <ReactFlowProvider>
          <Inner flow={flow} height={height} />
        </ReactFlowProvider>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t('fullscreen')}
          title={t('openFullscreen')}
          className="absolute right-2 top-2 z-10 inline-flex size-8 items-center justify-center rounded-md bg-background/80 text-muted-foreground opacity-0 shadow-sm backdrop-blur-sm transition-all hover:bg-background hover:text-foreground group-hover:opacity-100"
        >
          <Maximize2 className="size-3.5" />
        </button>
      </div>

      {open && <FullscreenFlow flow={flow} onClose={() => setOpen(false)} />}
    </>
  );
}

function FullscreenFlow({ flow, onClose }: { flow: ParsedFlow; onClose: () => void }) {
  const t = useTranslations('diagram');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {t('viewer')} · {t('hint')}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('close')}
          className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          ✕
        </button>
      </div>
      <div className="relative flex-1">
        <ReactFlowProvider>
          <Inner flow={flow} height={Number.POSITIVE_INFINITY as unknown as number} />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
