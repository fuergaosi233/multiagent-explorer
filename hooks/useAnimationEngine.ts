'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Pattern, TimelineStep } from '@/types/pattern';

export interface AnimationState {
  step: number;
  playing: boolean;
  speed: number;
  variantIdx: number;
  activeNodes: Set<string>;
  dimNodes: Set<string>;
  /** Map of edgeId → isReverse */
  firingEdges: Map<string, boolean>;
  doneEdges: Set<string>;
  caption: string;
}

export function useAnimationEngine(pattern: Pattern | null) {
  const [variantIdx, setVariantIdx] = useState(0);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [activeNodes, setActiveNodes] = useState<Set<string>>(new Set());
  const [dimNodes, setDimNodes] = useState<Set<string>>(new Set());
  const [firingEdges, setFiringEdges] = useState<Map<string, boolean>>(new Map());
  const [doneEdges, setDoneEdges] = useState<Set<string>>(new Set());
  const [caption, setCaption] = useState('');

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playingRef = useRef(false);
  const stepRef = useRef(0);
  const speedRef = useRef(1);
  const patternRef = useRef<Pattern | null>(null);
  const variantIdxRef = useRef(0);

  playingRef.current = playing;
  stepRef.current = step;
  speedRef.current = speed;
  patternRef.current = pattern;
  variantIdxRef.current = variantIdx;

  const getTimeline = useCallback((p: Pattern, vIdx: number): TimelineStep[] => {
    if (p.variants && p.variants[vIdx]?.timeline) {
      return p.variants[vIdx].timeline!;
    }
    return p.timeline;
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const applyStep = useCallback((tl: TimelineStep[], stepIdx: number) => {
    const s = tl[stepIdx];
    if (!s) return 0;
    setActiveNodes(new Set(s.activate || []));
    setDimNodes(new Set(s.dim || []));
    setCaption(s.caption || '');

    const rawEdges = s.fire || [];
    const firingMap = new Map<string, boolean>();
    rawEdges.forEach(raw => {
      const reverse = raw.startsWith('!');
      firingMap.set(reverse ? raw.slice(1) : raw, reverse);
    });
    setFiringEdges(firingMap);
    const baseDur = s.duration || 1500;
    const dur = baseDur / speedRef.current;
    const edgeIds = Array.from(firingMap.keys());
    setTimeout(() => {
      setFiringEdges(new Map());
      setDoneEdges(prev => {
        const next = new Set(prev);
        edgeIds.forEach(e => next.add(e));
        return next;
      });
    }, Math.min(dur * 0.85, 1400));

    return dur;
  }, []);

  const scheduleNext = useCallback((tl: TimelineStep[], currentStep: number) => {
    const s = tl[currentStep];
    if (!s) return;
    const baseDur = s.duration || 1500;
    const dur = baseDur / speedRef.current;

    timerRef.current = setTimeout(() => {
      if (!playingRef.current) return;
      const nextStep = (currentStep + 1) % tl.length;
      if (nextStep === 0) {
        setDoneEdges(new Set());
      }
      stepRef.current = nextStep;
      setStep(nextStep);
      const newDur = applyStep(tl, nextStep);
      scheduleNext(tl, nextStep);
    }, dur);
  }, [applyStep]);

  const play = useCallback(() => {
    const p = patternRef.current;
    if (!p || playingRef.current) return;
    setPlaying(true);
    playingRef.current = true;
    const tl = getTimeline(p, variantIdxRef.current);
    applyStep(tl, stepRef.current);
    scheduleNext(tl, stepRef.current);
  }, [getTimeline, applyStep, scheduleNext]);

  const pause = useCallback(() => {
    setPlaying(false);
    playingRef.current = false;
    clearTimer();
  }, [clearTimer]);

  const gotoStep = useCallback((i: number) => {
    const p = patternRef.current;
    if (!p) return;
    pause();
    const tl = getTimeline(p, variantIdxRef.current);
    const normalized = ((i % tl.length) + tl.length) % tl.length;
    stepRef.current = normalized;
    setStep(normalized);
    // Replay all done edges up to this step
    const done = new Set<string>();
    for (let k = 0; k < normalized; k++) {
      (tl[k].fire || []).forEach(eraw => {
        done.add(eraw.startsWith('!') ? eraw.slice(1) : eraw);
      });
    }
    setDoneEdges(done);
    setFiringEdges(new Map());
    setActiveNodes(new Set(tl[normalized].activate || []));
    setDimNodes(new Set(tl[normalized].dim || []));
    setCaption(tl[normalized].caption || '');
  }, [pause, getTimeline]);

  const restart = useCallback(() => {
    pause();
    setStep(0);
    stepRef.current = 0;
    setDoneEdges(new Set());
    setFiringEdges(new Map());
    setTimeout(() => play(), 50);
  }, [pause, play]);

  const nextStep = useCallback(() => gotoStep(stepRef.current + 1), [gotoStep]);
  const prevStep = useCallback(() => gotoStep(stepRef.current - 1), [gotoStep]);

  const selectVariant = useCallback((idx: number) => {
    pause();
    setVariantIdx(idx);
    variantIdxRef.current = idx;
    setStep(0);
    stepRef.current = 0;
    setDoneEdges(new Set());
    setFiringEdges(new Map());
    setTimeout(() => play(), 50);
  }, [pause, play]);

  // When pattern changes — reset and auto-play
  useEffect(() => {
    if (!pattern) return;
    clearTimer();
    setVariantIdx(0);
    variantIdxRef.current = 0;
    setStep(0);
    stepRef.current = 0;
    setDoneEdges(new Set());
    setFiringEdges(new Map());
    setActiveNodes(new Set());
    setDimNodes(new Set());
    setCaption('');
    setPlaying(false);
    playingRef.current = false;

    // small delay so diagram renders first
    const t = setTimeout(() => {
      playingRef.current = true;
      setPlaying(true);
      const tl = getTimeline(pattern, 0);
      applyStep(tl, 0);
      scheduleNext(tl, 0);
    }, 100);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pattern?.id]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return {
    step,
    playing,
    speed,
    variantIdx,
    activeNodes,
    dimNodes,
    firingEdges,
    doneEdges,
    caption,
    play,
    pause,
    restart,
    nextStep,
    prevStep,
    gotoStep,
    selectVariant,
    setSpeed: (s: number) => { speedRef.current = s; setSpeed(s); },
    timeline: pattern ? getTimeline(pattern, variantIdx) : [],
  };
}
