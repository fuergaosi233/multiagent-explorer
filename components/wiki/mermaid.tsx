'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { Maximize2 } from 'lucide-react';
import { MermaidModal } from './mermaid-modal';

interface Props { chart: string }

export function Mermaid({ chart }: Props) {
  const { resolvedTheme } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const reactId = useId();
  const id = `m_${reactId.replace(/[^A-Za-z0-9]/g, '_')}`;

  useEffect(() => {
    let cancelled = false;
    async function render() {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: resolvedTheme === 'dark' ? 'dark' : 'neutral',
          themeVariables: resolvedTheme === 'dark'
            ? { background: 'transparent', primaryColor: '#1b1f2a', primaryTextColor: '#f4f4f5', primaryBorderColor: '#6c7c9f', lineColor: '#6c7c9f', secondaryColor: '#2a3142', tertiaryColor: '#1b1f2a', fontFamily: 'var(--font-sans)' }
            : { background: 'transparent', primaryColor: '#f1f3f9', primaryTextColor: '#1a1d23', primaryBorderColor: '#475569', lineColor: '#64748b', secondaryColor: '#e2e8f0', tertiaryColor: '#ffffff', fontFamily: 'var(--font-sans)' },
        });
        const { svg } = await mermaid.render(id, chart);
        if (cancelled) return;
        if (ref.current) ref.current.innerHTML = svg;
      } catch (e) {
        if (cancelled) return;
        setErr(String(e instanceof Error ? e.message : e));
      }
    }
    render();
    return () => { cancelled = true; };
  }, [chart, resolvedTheme, id]);

  if (err) {
    return (
      <div className="my-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 font-mono text-xs text-destructive">
        Mermaid render error: {err}
      </div>
    );
  }

  return (
    <>
      <div className="group relative my-4 overflow-x-auto rounded-lg border border-border bg-muted/30 p-4 [&_svg]:mx-auto [&_svg]:max-w-full">
        <div ref={ref} />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open diagram fullscreen"
          title="Open fullscreen (zoom & pan)"
          className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-md bg-background/80 text-muted-foreground opacity-0 shadow-sm backdrop-blur-sm transition-all hover:bg-background hover:text-foreground group-hover:opacity-100 focus:opacity-100"
        >
          <Maximize2 className="size-3.5" />
        </button>
      </div>
      <MermaidModal chart={chart} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
