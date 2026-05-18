'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { PATTERNS } from '@/data/patterns';
import type { PatternGroup } from '@/types/pattern';
import { Badge } from '@/components/ui/badge';
import { LogoMark } from '@/components/logo';
import { cn } from '@/lib/utils';

const GROUPS: { key: PatternGroup; label: string; roman: string }[] = [
  { key: 'centralized', roman: 'I',   label: 'Centralized Control' },
  { key: 'flow',        roman: 'II',  label: 'Flow & Information' },
  { key: 'dialog',      roman: 'III', label: 'Dialog & Collaboration' },
  { key: 'decision',    roman: 'IV',  label: 'Decision & Quality' },
  { key: 'decentral',   roman: 'V',   label: 'Decentralized / Protocol' },
];

interface Props {
  activeId: string;
  onSelect: (id: string) => void;
}

interface Section {
  key: string;
  label: string;
  count: string | number;
  countVariant?: 'default' | 'soon';
}

const SECTIONS: Section[] = [
  { key: 'patterns',   label: '13 Interaction Patterns', count: 13 },
  { key: 'components', label: 'Core Components',          count: 'SOON', countVariant: 'soon' },
  { key: 'impls',      label: 'Implementations',          count: 'SOON', countVariant: 'soon' },
  { key: 'protocols',  label: 'Protocols',                count: 3 },
];

export default function Sidebar({ activeId, onSelect }: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>({
    patterns: true, components: false, impls: false, protocols: false,
  });

  return (
    <aside className="rail flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background shadow-sm transition-transform duration-300 hover:scale-105">
            <LogoMark size={18} className="text-brand" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
              <span>Multi-Agent Wiki</span>
            </div>
            <h1 className="flex items-center gap-1.5 text-[15px] font-semibold tracking-tight leading-tight">
              MultiAgent
              <Badge variant="brand" className="px-1.5 py-0 text-[9px] leading-none">v1</Badge>
            </h1>
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Patterns, components &amp; implementations — click any entry to watch it animate.
        </p>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto">
        {SECTIONS.map(sec => {
          const isOpen = open[sec.key];
          return (
            <div key={sec.key} className="section border-b border-sidebar-border last:border-b-0">
              <button
                type="button"
                onClick={() => setOpen(prev => ({ ...prev, [sec.key]: !prev[sec.key] }))}
                className="section-head group flex w-full items-center gap-2 px-5 py-3 text-left transition-colors hover:bg-accent/40"
              >
                <ChevronRight
                  className={cn(
                    'size-3.5 text-brand transition-transform duration-200',
                    isOpen && 'rotate-90',
                  )}
                />
                <span className="flex-1 text-[11px] font-mono font-medium uppercase tracking-[0.14em] text-foreground">
                  {sec.label}
                </span>
                <Badge variant={sec.countVariant === 'soon' ? 'soon' : 'outline'}>
                  {sec.count}
                </Badge>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="pb-3">
                      {sec.key === 'patterns' && (
                        <PatternsList activeId={activeId} onSelect={onSelect} />
                      )}
                      {sec.key === 'components' && (
                        <Placeholder>
                          Agent · Tool · Memory · Router · Aggregator · Blackboard · Critic · Selector — docs in progress
                        </Placeholder>
                      )}
                      {sec.key === 'impls' && (
                        <Placeholder>
                          LangChain · AutoGen · CrewAI · OpenAI Agents SDK · Claude Code · ChatDev — docs in progress
                        </Placeholder>
                      )}
                      {sec.key === 'protocols' && (
                        <Placeholder>
                          MCP · A2A · ANP — detailed specs in progress
                        </Placeholder>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="border-t border-sidebar-border px-5 py-3 text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
        Multi-Agent Wiki
      </div>
    </aside>
  );
}

function PatternsList({ activeId, onSelect }: Props) {
  return (
    <>
      {GROUPS.map(grp => {
        const items = PATTERNS.filter(p => p.group === grp.key);
        return (
          <div key={grp.key} className="px-2 pt-2">
            <h3 className="px-3 pb-1 text-[10px] font-mono font-medium uppercase tracking-[0.16em] text-muted-foreground">
              <span className="text-brand">{grp.roman}</span>
              <span className="mx-1.5 opacity-50">·</span>
              <span>{grp.label}</span>
            </h3>
            <ul className="flex flex-col">
              {items.map(p => {
                const isActive = p.id === activeId;
                return (
                  <li key={p.id} data-id={p.id} className={isActive ? 'active' : undefined}>
                    <button
                      type="button"
                      onClick={() => onSelect(p.id)}
                      className={cn(
                        'group relative flex w-full items-baseline gap-2.5 rounded-md px-3 py-1.5 text-left text-[13px] transition-colors',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="sidebar-active-pill"
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-brand"
                          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                        />
                      )}
                      <span
                        className={cn(
                          'font-mono text-[10px] tracking-wider tabular-nums',
                          isActive ? 'text-brand' : 'text-muted-foreground/60',
                        )}
                      >
                        {p.num}
                      </span>
                      <span className="truncate">{p.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </>
  );
}

function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <div className="placeholder mx-5 my-1 rounded-md border border-dashed border-border px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
      {children}
    </div>
  );
}
