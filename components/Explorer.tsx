'use client';
import { useCallback, useEffect, useState } from 'react';
import { PATTERNS } from '@/data/patterns';
import type { Pattern } from '@/types/pattern';
import { useAnimationEngine } from '@/hooks/useAnimationEngine';
import Sidebar from './Sidebar';
import DiagramCanvas from './DiagramCanvas';
import Controls from './Controls';
import MetaCards from './MetaCards';

export default function Explorer() {
  const [pattern, setPattern] = useState<Pattern>(PATTERNS[0]);
  const [variantUI, setVariantUI] = useState(0);

  const engine = useAnimationEngine(pattern);

  const selectPattern = useCallback((id: string) => {
    const p = PATTERNS.find(x => x.id === id);
    if (p) {
      setPattern(p);
      setVariantUI(0);
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'SELECT') return;
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
    firingEdges: engine.firingEdges,  // Map<string, boolean>
    doneEdges: engine.doneEdges,
  };

  return (
    <div className="layout">
      <Sidebar activeId={pattern.id} onSelect={selectPattern} />

      <main className="stage">
        <header className="head">
          <div className="breadcrumb">
            <span id="grp-label">{pattern.grpLabel}</span> ·{' '}
            <span className="n">PATTERN {pattern.num}</span>
          </div>
          <h2>
            {pattern.title}
            <span className="en">{pattern.titleEn}</span>
          </h2>
          <div className="aliases">
            <b>ALIASES</b>
            <span>{pattern.aliases}</span>
          </div>
        </header>

        <div className="mechanism">
          <div className="k">MECHANISM</div>
          <div className="v">{pattern.mechanism}</div>
        </div>

        <DiagramCanvas pattern={pattern} engineState={engineState} speed={engine.speed} />

        {/* Variant chips */}
        {pattern.variants && pattern.variants.length >= 2 && (
          <div className="variants">
            <span className="label">VARIANT</span>
            {pattern.variants.map((v, i) => (
              <span
                key={i}
                className={`chip${i === engine.variantIdx ? ' active' : ''}`}
                onClick={() => engine.selectVariant(i)}
              >
                {v.label}
                {v.sub && <span className="alt">{v.sub}</span>}
              </span>
            ))}
          </div>
        )}

        {/* Caption */}
        <div className="caption-wrap">
          <div className="step-no">
            <span className="cur">{engine.step + 1}</span> / <span>{engine.timeline.length}</span>
          </div>
          <div
            className="caption"
            dangerouslySetInnerHTML={{ __html: engine.caption || '—' }}
          />
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

        <MetaCards pattern={pattern} />
      </main>
    </div>
  );
}
