'use client';
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  step: number;
  totalSteps: number;
  playing: boolean;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onRestart: () => void;
  onPrev: () => void;
  onNext: () => void;
  onGotoStep: (i: number) => void;
  onSpeedChange: (s: number) => void;
}

const SPEEDS = [0.5, 1, 1.5, 2];

export default function Controls({
  step, totalSteps, playing, speed,
  onPlay, onPause, onRestart, onPrev, onNext, onGotoStep, onSpeedChange,
}: Props) {
  return (
    <div className="controls flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={onRestart} className="font-mono text-[11px]">
        <RotateCcw className="size-3.5" />
        Replay
      </Button>

      <Button variant="outline" size="sm" onClick={onPrev} aria-label="Previous step" className="font-mono text-[11px]">
        <ChevronLeft className="size-3.5" />
        Prev
      </Button>

      <Button
        variant="brand"
        size="sm"
        onClick={playing ? onPause : onPlay}
        className="primary min-w-[80px] font-mono text-[11px]"
      >
        {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
        {playing ? 'Pause' : 'Play'}
      </Button>

      <Button variant="outline" size="sm" onClick={onNext} aria-label="Next step" className="font-mono text-[11px]">
        Next
        <ChevronRight className="size-3.5" />
      </Button>

      {/* Timeline scrubber */}
      <div className="flex h-9 min-w-0 flex-1 items-center gap-1.5 rounded-md border border-border bg-card px-3">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex flex-1 items-center gap-1.5 first:flex-none">
            {i > 0 && (
              <div className={cn(
                'h-px flex-1 transition-colors duration-300',
                i <= step ? 'bg-brand' : 'bg-border',
              )} />
            )}
            <button
              type="button"
              onClick={() => onGotoStep(i)}
              title={`Step ${i + 1}`}
              aria-label={`Step ${i + 1}`}
              className="relative flex size-3.5 items-center justify-center rounded-full transition-transform hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              {i === step && (
                <motion.span
                  layoutId="timeline-current"
                  className="absolute inset-0 rounded-full bg-brand ring-4 ring-brand/20"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className={cn(
                'relative size-2 rounded-full transition-colors',
                i < step ? 'bg-brand' : i === step ? 'bg-brand-foreground' : 'bg-muted-foreground/30',
              )} />
            </button>
          </div>
        ))}
      </div>

      {/* Speed */}
      <div className="speed-group flex items-center gap-1 rounded-md border border-border bg-card p-0.5">
        {SPEEDS.map(s => (
          <button
            key={s}
            type="button"
            data-speed={s}
            aria-pressed={speed === s}
            onClick={() => onSpeedChange(s)}
            className={cn(
              'relative h-7 min-w-[32px] rounded-[5px] px-2 font-mono text-[10px] font-medium tracking-wider transition-colors',
              speed === s
                ? 'text-brand-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {speed === s && (
              <motion.span
                layoutId="speed-active"
                className="absolute inset-0 rounded-[5px] bg-brand"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative">{s}×</span>
          </button>
        ))}
      </div>
    </div>
  );
}
