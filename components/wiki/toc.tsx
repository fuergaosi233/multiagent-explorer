'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { Heading } from '@/lib/markdown-utils';
import { cn } from '@/lib/utils';

interface Props {
  headings: Heading[];
}

export function Toc({ headings }: Props) {
  const [active, setActive] = useState<string | null>(null);
  const t = useTranslations('wiki');

  useEffect(() => {
    if (headings.length === 0) return;
    const ids = headings.map(h => h.id);
    const nodes = ids
      .map(id => document.getElementById(id))
      .filter((n): n is HTMLElement => !!n);
    if (nodes.length === 0) return;

    const obs = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -65% 0px', threshold: [0, 1] },
    );

    nodes.forEach(n => obs.observe(n));
    return () => obs.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto py-6 pl-4 pr-2">
      <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/70">
        {t('onThisPage')}
      </div>
      <ul className="flex flex-col gap-1 border-l border-border">
        {headings.map(h => {
          const isActive = active === h.id;
          return (
            <li key={h.id} className={cn(h.level === 3 && 'pl-3')}>
              <a
                href={`#${h.id}`}
                className={cn(
                  'relative -ml-px block border-l-2 py-1 pl-3 text-[12px] leading-snug transition-colors',
                  isActive
                    ? 'border-brand text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                  h.level === 3 && 'text-[11.5px]',
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="toc-active"
                    className="absolute -left-px top-0 h-full w-[2px] rounded-full bg-brand"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {h.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
