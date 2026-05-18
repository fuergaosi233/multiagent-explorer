'use client';
import { useEffect, useRef } from 'react';
import type { Pattern, PatternNode, PatternEdge } from '@/types/pattern';
import type { AnimationState } from '@/hooks/useAnimationEngine';

const SVG_NS = 'http://www.w3.org/2000/svg';
const NODE_W = 140, NODE_H = 54;
const ARROW_TRIM = 4;
const TOKEN_COUNT = 5;
const TOKEN_STAGGER = 0.10;

function nodeCenter(n: PatternNode) {
  return { cx: n.x + (n.w ?? NODE_W) / 2, cy: n.y + (n.h ?? NODE_H) / 2 };
}

function trimToEdge(cx: number, cy: number, w: number, h: number, dx: number, dy: number) {
  if (Math.abs(dx) < 1e-6 && Math.abs(dy) < 1e-6) return { x: cx, y: cy };
  const halfW = w / 2, halfH = h / 2;
  const len = Math.hypot(dx, dy);
  const ux = dx / len, uy = dy / len;
  const tx = Math.abs(ux) > 1e-6 ? halfW / Math.abs(ux) : Infinity;
  const ty = Math.abs(uy) > 1e-6 ? halfH / Math.abs(uy) : Infinity;
  const t = Math.min(tx, ty) + ARROW_TRIM;
  return { x: cx + ux * t, y: cy + uy * t };
}

function buildPath(edge: PatternEdge, nodesById: Record<string, PatternNode>) {
  const from = nodesById[edge.from], to = nodesById[edge.to];
  if (!from || !to) return '';
  const f = nodeCenter(from), t = nodeCenter(to);
  const fw = from.w ?? NODE_W, fh = from.h ?? NODE_H;
  const tw = to.w ?? NODE_W, th = to.h ?? NODE_H;
  const dx = t.cx - f.cx, dy = t.cy - f.cy;
  const start = trimToEdge(f.cx, f.cy, fw, fh, dx, dy);
  const end = trimToEdge(t.cx, t.cy, tw, th, -dx, -dy);
  const curve = edge.curve ?? 0;
  if (curve === 0) return `M${start.x},${start.y} L${end.x},${end.y}`;
  const mx = (start.x + end.x) / 2, my = (start.y + end.y) / 2;
  const len2 = Math.hypot(end.x - start.x, end.y - start.y) || 1;
  const px = -(end.y - start.y) / len2, py = (end.x - start.x) / len2;
  return `M${start.x},${start.y} Q${mx + px * curve},${my + py * curve} ${end.x},${end.y}`;
}

function spawnTokens(
  pathEl: SVGPathElement,
  gBubbles: SVGGElement,
  duration: number,
  reverse: boolean,
  cleanup: (fn: () => void) => void,
) {
  const len = pathEl.getTotalLength();
  const tokens: SVGCircleElement[] = [];
  for (let i = 0; i < TOKEN_COUNT; i++) {
    const tk = document.createElementNS(SVG_NS, 'circle') as SVGCircleElement;
    tk.setAttribute('r', '3.5');
    tk.setAttribute('class', `msg-token${reverse ? ' return' : ''}`);
    tk.setAttribute('opacity', '0');
    gBubbles.appendChild(tk);
    tokens.push(tk);
  }
  const start = performance.now();
  const traverseTime = duration * (1 - TOKEN_STAGGER * (TOKEN_COUNT - 1));
  let rafId: number;
  function tick(now: number) {
    const elapsed = now - start;
    let anyAlive = false;
    tokens.forEach((tk, i) => {
      const tStart = i * TOKEN_STAGGER * duration;
      const t = (elapsed - tStart) / traverseTime;
      if (t < 0 || t > 1) { tk.setAttribute('opacity', '0'); return; }
      anyAlive = true;
      const u = reverse ? (1 - t) : t;
      const pt = pathEl.getPointAtLength(u * len);
      tk.setAttribute('cx', String(pt.x));
      tk.setAttribute('cy', String(pt.y));
      const fade = Math.min(t * 5, 1, (1 - t) * 5);
      tk.setAttribute('opacity', String(Math.max(0, fade) * 0.95));
    });
    if (elapsed < duration + 200) {
      rafId = requestAnimationFrame(tick);
    } else {
      tokens.forEach(tk => tk.remove());
    }
  }
  rafId = requestAnimationFrame(tick);
  cleanup(() => {
    cancelAnimationFrame(rafId);
    tokens.forEach(tk => tk.remove());
  });
}

interface Props {
  pattern: Pattern;
  engineState: {
    activeNodes: Set<string>;
    dimNodes: Set<string>;
    firingEdges: Map<string, boolean>;
    doneEdges: Set<string>;
  };
  speed: number;
}

export default function DiagramCanvas({ pattern, engineState, speed }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const cleanupRef = useRef<Array<() => void>>([]);

  // Rebuild diagram whenever pattern changes
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Clear previous bubbles cleanup
    cleanupRef.current.forEach(fn => fn());
    cleanupRef.current = [];

    // Remove non-defs children
    Array.from(svg.children).forEach(c => { if (c.tagName !== 'defs') c.remove(); });

    const gDeco = document.createElementNS(SVG_NS, 'g');
    const gEdges = document.createElementNS(SVG_NS, 'g');
    const gBubbles = document.createElementNS(SVG_NS, 'g');
    gBubbles.setAttribute('class', 'bubbles-layer');
    const gNodes = document.createElementNS(SVG_NS, 'g');
    svg.append(gDeco, gEdges, gBubbles, gNodes);

    // Decorations
    (pattern.decorations ?? []).forEach(d => {
      if (d.type !== 'rect') return;
      const r = document.createElementNS(SVG_NS, 'rect') as SVGRectElement;
      r.setAttribute('x', String(d.x)); r.setAttribute('y', String(d.y));
      r.setAttribute('width', String(d.w)); r.setAttribute('height', String(d.h));
      r.setAttribute('rx', '8'); r.setAttribute('fill', 'none');
      r.setAttribute('stroke', 'var(--accent)'); r.setAttribute('stroke-width', '1.2');
      r.setAttribute('stroke-dasharray', '7 5'); r.setAttribute('opacity', '0.6');
      gDeco.appendChild(r);
      if (d.label) {
        const bg = document.createElementNS(SVG_NS, 'rect') as SVGRectElement;
        bg.setAttribute('x', String(d.x + 16)); bg.setAttribute('y', String(d.y - 10));
        bg.setAttribute('width', '96'); bg.setAttribute('height', '20');
        bg.setAttribute('rx', '2'); bg.setAttribute('fill', 'var(--bg-ink)');
        gDeco.appendChild(bg);
        const lbl = document.createElementNS(SVG_NS, 'text') as SVGTextElement;
        lbl.setAttribute('x', String(d.x + 64)); lbl.setAttribute('y', String(d.y + 1));
        lbl.setAttribute('text-anchor', 'middle'); lbl.setAttribute('dominant-baseline', 'central');
        lbl.setAttribute('font-family', 'var(--mono)'); lbl.setAttribute('font-size', '11');
        lbl.setAttribute('fill', 'var(--accent)'); lbl.setAttribute('letter-spacing', '0.18em');
        lbl.textContent = d.label;
        gDeco.appendChild(lbl);
      }
    });

    const nodesById: Record<string, PatternNode> = {};
    pattern.nodes.forEach(n => { nodesById[n.id] = n; });

    // Edges
    Object.entries(pattern.edges).forEach(([eid, edge]) => {
      const d = buildPath(edge, nodesById);
      const path = document.createElementNS(SVG_NS, 'path') as SVGPathElement;
      path.setAttribute('d', d);
      path.setAttribute('class', 'edge' + (edge.dashed ? ' dashed' : ''));
      path.setAttribute('data-eid', eid);
      path.setAttribute('fill', 'none');
      gEdges.appendChild(path);

      if (edge.label) {
        // measure mid point after appending
        requestAnimationFrame(() => {
          const len = path.getTotalLength();
          const mid = path.getPointAtLength(len / 2);
          const charW = 6.5, padX = 6, padY = 2, fontSize = 11;
          const w = edge.label!.length * charW + padX * 2;
          const h = fontSize + padY * 2;
          const bg = document.createElementNS(SVG_NS, 'rect') as SVGRectElement;
          bg.setAttribute('x', String(mid.x - w / 2)); bg.setAttribute('y', String(mid.y - h / 2));
          bg.setAttribute('width', String(w)); bg.setAttribute('height', String(h));
          bg.setAttribute('rx', '2'); bg.setAttribute('class', 'edge-label-bg');
          bg.setAttribute('data-eid', eid);
          gEdges.insertBefore(bg, path);
          const txt = document.createElementNS(SVG_NS, 'text') as SVGTextElement;
          txt.setAttribute('x', String(mid.x)); txt.setAttribute('y', String(mid.y));
          txt.setAttribute('class', 'edge-label'); txt.setAttribute('data-eid', eid);
          txt.setAttribute('text-anchor', 'middle'); txt.setAttribute('dominant-baseline', 'central');
          txt.textContent = edge.label!;
          gEdges.appendChild(txt);
        });
      }
    });

    // Nodes
    pattern.nodes.forEach(n => {
      const w = n.w ?? NODE_W, h = n.h ?? NODE_H;
      const g = document.createElementNS(SVG_NS, 'g') as SVGGElement;
      g.setAttribute('class', `node kind-${n.kind ?? 'plain'}`);
      g.setAttribute('data-id', n.id);

      if (n.kind === 'store') {
        const circle = document.createElementNS(SVG_NS, 'circle') as SVGCircleElement;
        circle.setAttribute('cx', String(n.x + w / 2));
        circle.setAttribute('cy', String(n.y + h / 2));
        circle.setAttribute('r', String(w / 2));
        circle.setAttribute('class', 'node-rect');
        g.appendChild(circle);
      } else {
        const rect = document.createElementNS(SVG_NS, 'rect') as SVGRectElement;
        rect.setAttribute('x', String(n.x)); rect.setAttribute('y', String(n.y));
        rect.setAttribute('width', String(w)); rect.setAttribute('height', String(h));
        rect.setAttribute('class', 'node-rect');
        if (n.kind === 'user') { rect.setAttribute('rx', '30'); rect.setAttribute('ry', '30'); }
        else { rect.setAttribute('rx', '6'); rect.setAttribute('ry', '6'); }
        g.appendChild(rect);
      }

      if (n.sub) {
        const lbl = document.createElementNS(SVG_NS, 'text') as SVGTextElement;
        lbl.setAttribute('x', String(n.x + w / 2)); lbl.setAttribute('y', String(n.y + h / 2 - 8));
        lbl.setAttribute('class', 'node-label'); lbl.textContent = n.label;
        g.appendChild(lbl);
        const sub = document.createElementNS(SVG_NS, 'text') as SVGTextElement;
        sub.setAttribute('x', String(n.x + w / 2)); sub.setAttribute('y', String(n.y + h / 2 + 12));
        sub.setAttribute('class', 'node-sub'); sub.textContent = n.sub;
        g.appendChild(sub);
      } else {
        const lbl = document.createElementNS(SVG_NS, 'text') as SVGTextElement;
        lbl.setAttribute('x', String(n.x + w / 2)); lbl.setAttribute('y', String(n.y + h / 2));
        lbl.setAttribute('class', 'node-label'); lbl.textContent = n.label;
        g.appendChild(lbl);
      }
      gNodes.appendChild(g);
    });
  }, [pattern]);

  // Apply animation state — runs on each engineState update
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Nodes
    svg.querySelectorAll<SVGGElement>('.node[data-id]').forEach(g => {
      const id = g.dataset.id!;
      g.classList.toggle('active', engineState.activeNodes.has(id));
      g.classList.toggle('dim', engineState.dimNodes.has(id));
    });

    // Edges
    svg.querySelectorAll<SVGPathElement>('.edge[data-eid]').forEach(p => {
      const eid = p.dataset.eid!;
      p.classList.toggle('firing', engineState.firingEdges.has(eid));
      p.classList.toggle('done', engineState.doneEdges.has(eid) && !engineState.firingEdges.has(eid));
    });

    // Edge labels
    svg.querySelectorAll<SVGTextElement>('.edge-label[data-eid]').forEach(t => {
      const eid = t.dataset.eid!;
      t.classList.toggle('show', engineState.firingEdges.has(eid));
    });

    // Token streams for firing edges
    const gBubbles = svg.querySelector<SVGGElement>('.bubbles-layer');
    if (!gBubbles) return;

    engineState.firingEdges.forEach((reverse, eid) => {
      const path = svg.querySelector<SVGPathElement>(`.edge[data-eid="${eid}"]`);
      if (!path) return;
      const dur = Math.min((1500 / speed) * 0.85, 1400);
      spawnTokens(path, gBubbles, dur, reverse, fn => {
        cleanupRef.current.push(fn);
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engineState.firingEdges, engineState.activeNodes, engineState.dimNodes, engineState.doneEdges]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { cleanupRef.current.forEach(fn => fn()); };
  }, []);

  return (
    <div className="canvas-wrap">
      <div className="replay-hint">
        <span className="pulse" />
        LIVE
      </div>
      <svg
        ref={svgRef}
        className="diagram"
        viewBox="0 0 900 540"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}
