'use client';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PATTERNS } from '@/data/patterns';
import { useAnimationEngine } from '@/hooks/useAnimationEngine';
import DiagramCanvas from '@/components/DiagramCanvas';
import Controls from '@/components/Controls';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Props {
  /** The animation pattern id (matches an entry in data/patterns.ts). */
  patternId: string;
}

/**
 * Compact embeddable visualization: diagram + step caption + transport
 * controls. Used at the top of pattern wiki pages where an animated
 * version exists.
 */
export function AnimatedPattern({ patternId }: Props) {
  const pattern = PATTERNS.find(p => p.id === patternId);
  const engine = useAnimationEngine(pattern ?? null);

  // Keyboard shortcuts scoped to the widget area
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        engine.playing ? engine.pause() : engine.play();
      } else if (e.key === 'ArrowRight' || e.key === 'l') engine.nextStep();
      else if (e.key === 'ArrowLeft' || e.key === 'j') engine.prevStep();
      else if (e.key === 'r') engine.restart();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [engine]);

  if (!pattern) return null;

  const engineState = {
    activeNodes: engine.activeNodes,
    dimNodes: engine.dimNodes,
    firingEdges: engine.firingEdges,
    doneEdges: engine.doneEdges,
  };

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-card/40 p-4 shadow-sm">
      <header className="flex flex-wrap items-center gap-2">
        <Badge variant="brand">Live visualization</Badge>
        <span className="text-[12px] text-muted-foreground">
          Animated topology — press <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">Space</kbd> to play / pause
        </span>
      </header>

      <DiagramCanvas pattern={pattern} engineState={engineState} speed={engine.speed} />

      {pattern.variants && pattern.variants.length >= 2 && (
        <div className="variants flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Variant
          </span>
          {pattern.variants.map((v, i) => {
            const active = i === engine.variantIdx;
            return (
              <button
                key={i}
                type="button"
                onClick={() => engine.selectVariant(i)}
                className={cn(
                  'chip relative rounded-full border px-3 py-1 text-[11px] font-medium transition-colors',
                  active
                    ? 'active border-brand bg-brand/10 text-brand'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground',
                )}
              >
                <span>{v.label}</span>
                {v.sub && <span className="ml-1.5 opacity-60">{v.sub}</span>}
              </button>
            );
          })}
        </div>
      )}

      <div className="caption-wrap flex min-h-[32px] items-center gap-3">
        <div className="step-no font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground whitespace-nowrap tabular-nums">
          <span className="cur text-brand font-semibold">{engine.step + 1}</span>
          <span className="opacity-50"> / {engine.timeline.length}</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={`cap-${pattern.id}-${engine.variantIdx}-${engine.step}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 text-[13px] leading-relaxed text-foreground [&_b]:font-semibold [&_b]:text-brand [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.86em]"
            dangerouslySetInnerHTML={{ __html: engine.caption || '—' }}
          />
        </AnimatePresence>
      </div>

      <Controls
        step={engine.step}
        totalSteps={engine.timeline.length}
        playing={engine.playing}
        speed={engine.speed}
        onPlay={engine.play}
        onPause={engine.pause}
        onRestart={engine.restart}
        onPrev={engine.prevStep}
        onNext={engine.nextStep}
        onGotoStep={engine.gotoStep}
        onSpeedChange={engine.setSpeed}
      />
    </section>
  );
}

