'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize, Minus, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  chart: string;
  open: boolean;
  onClose: () => void;
}

const MIN_SCALE = 0.3;
const MAX_SCALE = 6;
const STEP = 1.2;

/**
 * Full-screen mermaid viewer with mouse-wheel zoom, drag-pan, and a small
 * floating toolbar. Opens via the Maximize button on the inline diagram.
 */
export function MermaidModal({ chart, open, onClose }: Props) {
  const { resolvedTheme } = useTheme();
  const svgHostRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Render the mermaid SVG once per open + theme change.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      const mermaid = (await import('mermaid')).default;
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: resolvedTheme === 'dark' ? 'dark' : 'neutral',
        themeVariables: resolvedTheme === 'dark'
          ? { background: 'transparent', primaryColor: '#1b1f2a', primaryTextColor: '#f4f4f5', primaryBorderColor: '#6c7c9f', lineColor: '#6c7c9f', secondaryColor: '#2a3142', tertiaryColor: '#1b1f2a', fontFamily: 'var(--font-sans)' }
          : { background: 'transparent', primaryColor: '#f1f3f9', primaryTextColor: '#1a1d23', primaryBorderColor: '#475569', lineColor: '#64748b', secondaryColor: '#e2e8f0', tertiaryColor: '#ffffff', fontFamily: 'var(--font-sans)' },
      });
      const id = `mermaid-modal-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
      try {
        const { svg } = await mermaid.render(id, chart);
        if (!cancelled && svgHostRef.current) {
          svgHostRef.current.innerHTML = svg;
          // Make the rendered SVG fill its viewport so transform applies sensibly.
          const inner = svgHostRef.current.querySelector('svg');
          if (inner) {
            inner.removeAttribute('width');
            inner.removeAttribute('height');
            inner.style.width = '100%';
            inner.style.height = '100%';
            inner.style.maxWidth = 'none';
            inner.style.maxHeight = 'none';
          }
        }
      } catch (e) {
        if (!cancelled && svgHostRef.current) {
          svgHostRef.current.textContent = String(e instanceof Error ? e.message : e);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [chart, resolvedTheme, open]);

  const reset = useCallback(() => setTransform({ scale: 1, x: 0, y: 0 }), []);
  const zoomBy = useCallback((factor: number, originX?: number, originY?: number) => {
    setTransform(prev => {
      const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale * factor));
      if (nextScale === prev.scale) return prev;
      if (originX == null || originY == null) {
        return { ...prev, scale: nextScale };
      }
      // Zoom anchored to the mouse position.
      const ratio = nextScale / prev.scale;
      return {
        scale: nextScale,
        x: originX - ratio * (originX - prev.x),
        y: originY - ratio * (originY - prev.y),
      };
    });
  }, []);

  // Reset transform when the chart or open state changes.
  useEffect(() => { if (open) reset(); }, [chart, open, reset]);

  // Keyboard + scroll-lock when open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === '+' || e.key === '=') zoomBy(STEP);
      else if (e.key === '-' || e.key === '_') zoomBy(1 / STEP);
      else if (e.key === '0') reset();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose, reset, zoomBy]);

  // Wheel handler must use non-passive listener so we can preventDefault.
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp || !open) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const rect = vp.getBoundingClientRect();
      const ox = e.clientX - rect.left;
      const oy = e.clientY - rect.top;
      zoomBy(e.deltaY < 0 ? STEP : 1 / STEP, ox, oy);
    };
    vp.addEventListener('wheel', handler, { passive: false });
    return () => vp.removeEventListener('wheel', handler);
  }, [open, zoomBy]);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, baseX: transform.x, baseY: transform.y };
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    const { startX, startY, baseX, baseY } = dragRef.current;
    setTransform(prev => ({ ...prev, x: baseX + (e.clientX - startX), y: baseY + (e.clientY - startY) }));
  }
  function onPointerUp() { dragRef.current = null; }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Top bar */}
          <div
            className="flex items-center justify-between border-b border-border px-4 py-2 text-foreground"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Diagram viewer
              <span className="tabular-nums text-foreground/80">{Math.round(transform.scale * 100)}%</span>
            </div>
            <div className="flex items-center gap-1">
              <ToolbarButton onClick={() => zoomBy(1 / STEP)} label="Zoom out (-)"><Minus className="size-4" /></ToolbarButton>
              <ToolbarButton onClick={() => zoomBy(STEP)} label="Zoom in (+)"><Plus className="size-4" /></ToolbarButton>
              <ToolbarButton onClick={reset} label="Reset (0)"><Maximize className="size-4" /></ToolbarButton>
              <ToolbarButton onClick={onClose} label="Close (Esc)"><X className="size-4" /></ToolbarButton>
            </div>
          </div>

          {/* Viewport */}
          <div
            ref={viewportRef}
            className={cn(
              'relative flex-1 overflow-hidden select-none',
              dragRef.current ? 'cursor-grabbing' : 'cursor-grab',
            )}
            onClick={e => e.stopPropagation()}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                transformOrigin: '0 0',
                transition: dragRef.current ? 'none' : 'transform 120ms ease-out',
                willChange: 'transform',
              }}
            >
              <div ref={svgHostRef} className="size-full [&_svg]:size-full" />
            </div>
          </div>

          {/* Footer hint */}
          <div
            className="border-t border-border px-4 py-2 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
            onClick={e => e.stopPropagation()}
          >
            scroll = zoom · drag = pan · <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">+</kbd> / <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">−</kbd> / <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">0</kbd> / <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">Esc</kbd>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function ToolbarButton({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {children}
    </button>
  );
}
