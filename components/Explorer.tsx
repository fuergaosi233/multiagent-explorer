'use client';
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PATTERNS } from '@/data/patterns';
import type { Pattern } from '@/types/pattern';
import { useAnimationEngine } from '@/hooks/useAnimationEngine';
import Sidebar from './Sidebar';
import DiagramCanvas from './DiagramCanvas';
import Controls from './Controls';
import MetaCards from './MetaCards';
import { Badge } from './ui/badge';
import { ThemeToggle } from './theme-toggle';
import { cn } from '@/lib/utils';

export default function Explorer() {
  const [pattern, setPattern] = useState<Pattern>(PATTERNS[0]);

  const engine = useAnimationEngine(pattern);

  const selectPattern = useCallback((id: string) => {
    const p = PATTERNS.find(x => x.id === id);
    if (p) setPattern(p);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      const idx = PATTERNS.findIndex(p => p.id === pattern.id);
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        engine.playing ? engine.pause() : engine.play();
      } else if (e.key === 'ArrowRight' || e.key === 'l') engine.nextStep();
      else if (e.key === 'ArrowLeft' || e.key === 'j') engine.prevStep();
      else if (e.key === 'r') engine.restart();
      else if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectPattern(PATTERNS[(idx + 1) % PATTERNS.length].id);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectPattern(PATTERNS[(idx - 1 + PATTERNS.length) % PATTERNS.length].id);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pattern.id, engine, selectPattern]);

  const engineState = {
    activeNodes: engine.activeNodes,
    dimNodes: engine.dimNodes,
    firingEdges: engine.firingEdges,
    doneEdges: engine.doneEdges,
  };

  return (
    <div className="grid h-dvh min-h-[600px] grid-cols-1 lg:grid-cols-[280px_1fr]">
      <Sidebar activeId={pattern.id} onSelect={selectPattern} />

      <main className="stage flex min-w-0 flex-col gap-4 overflow-y-auto p-6 lg:p-8">
        {/* Top bar */}
        <div className="flex items-center justify-end -mt-2 -mb-2">
          <ThemeToggle />
        </div>

        {/* Header */}
        <AnimatePresence mode="wait">
          <motion.header
            key={`head-${pattern.id}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="head flex flex-col gap-1.5"
          >
            <div className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              <span>{pattern.grpLabel}</span>
              <span className="opacity-40">·</span>
              <Badge variant="brand">Pattern {pattern.num}</Badge>
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              {pattern.title}
              {pattern.titleEn && (
                <span className="mt-1 block text-sm font-normal text-muted-foreground">
                  {pattern.titleEn}
                </span>
              )}
            </h2>
            <div className="font-mono text-[10px] leading-relaxed text-muted-foreground">
              <span className="mr-2 text-[9px] font-medium uppercase tracking-[0.16em] text-foreground/70">
                Aliases
              </span>
              {pattern.aliases}
            </div>
          </motion.header>
        </AnimatePresence>

        {/* Mechanism */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`mech-${pattern.id}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-baseline gap-3 border-y border-border py-2.5"
          >
            <span className="font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-muted-foreground whitespace-nowrap">
              Mechanism
            </span>
            <p className="text-sm leading-relaxed text-foreground">{pattern.mechanism}</p>
          </motion.div>
        </AnimatePresence>

        <DiagramCanvas pattern={pattern} engineState={engineState} speed={engine.speed} />

        {/* Variants */}
        {pattern.variants && pattern.variants.length >= 2 && (
          <div className="variants -mt-1 flex flex-wrap items-center gap-2">
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
                  {v.sub && (
                    <span className="ml-1.5 opacity-60">{v.sub}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Caption */}
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
              className="flex-1 text-sm leading-relaxed text-foreground [&_b]:font-semibold [&_b]:text-brand [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.86em]"
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

        <AnimatePresence mode="wait">
          <motion.div
            key={`meta-${pattern.id}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <MetaCards pattern={pattern} />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
