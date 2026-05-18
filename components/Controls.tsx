'use client';

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

export default function Controls({
  step, totalSteps, playing, speed,
  onPlay, onPause, onRestart, onPrev, onNext, onGotoStep, onSpeedChange,
}: Props) {
  return (
    <div className="controls">
      <button onClick={onRestart} title="Replay">
        <svg className="icon" viewBox="0 0 16 16">
          <path d="M3 8a5 5 0 1 0 1.5-3.6" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M2 3v4h4" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
        Replay
      </button>

      <button onClick={onPrev}>‹ Prev</button>

      <button className="primary" onClick={playing ? onPause : onPlay}>
        <svg className="icon" viewBox="0 0 16 16">
          {playing ? (
            <>
              <rect x="3" y="2" width="3.5" height="12" fill="currentColor" />
              <rect x="9.5" y="2" width="3.5" height="12" fill="currentColor" />
            </>
          ) : (
            <path d="M3 2v12l11-6z" fill="currentColor" />
          )}
        </svg>
        {playing ? 'Pause' : 'Play'}
      </button>

      <button onClick={onNext}>Next ›</button>

      <div className="timeline">
        {Array.from({ length: totalSteps }, (_, i) => [
          i > 0 && (
            <div key={`fill-${i}`} className={`dot-fill${i <= step ? ' done' : ''}`} />
          ),
          <div
            key={`dot-${i}`}
            className={`dot${i === step ? ' current' : i < step ? ' done' : ''}`}
            title={`Step ${i + 1}`}
            onClick={() => onGotoStep(i)}
          />,
        ])}
      </div>

      <div className="speed-group">
        <label>SPEED</label>
        <select
          value={speed}
          onChange={e => onSpeedChange(parseFloat(e.target.value))}
        >
          <option value={0.5}>0.5×</option>
          <option value={1}>1×</option>
          <option value={1.5}>1.5×</option>
          <option value={2}>2×</option>
        </select>
      </div>
    </div>
  );
}
