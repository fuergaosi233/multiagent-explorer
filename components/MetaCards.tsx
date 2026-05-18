'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronRight, Code2, Sparkles, Target } from 'lucide-react';
import type { Pattern } from '@/types/pattern';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Props { pattern: Pattern }

export default function MetaCards({ pattern }: Props) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1.8fr]">
      <MetaCard
        icon={<Target className="size-3.5" />}
        label="Fit"
        accent="brand"
        body={pattern.fit}
      />
      <MetaCard
        icon={<AlertTriangle className="size-3.5" />}
        label="Risks"
        accent="warning"
        body={pattern.risks}
      />
      <ExampleCard pattern={pattern} />
    </div>
  );
}

function MetaCard({
  icon, label, body, accent,
}: {
  icon: React.ReactNode;
  label: string;
  body: string;
  accent: 'brand' | 'warning';
}) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="p-4">
        <div className={cn(
          'mb-2 flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em]',
          accent === 'brand' ? 'text-brand' : 'text-warning',
        )}>
          {icon}
          <span>{label}</span>
        </div>
        <p
          className="text-[13px] leading-relaxed text-muted-foreground [&_b]:font-medium [&_b]:text-foreground"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      </div>
    </Card>
  );
}

function ExampleCard({ pattern }: { pattern: Pattern }) {
  const [codeOpen, setCodeOpen] = useState(false);
  return (
    <Card className="relative overflow-hidden border-warning/30 bg-warning-soft/50 transition-shadow hover:shadow-md md:col-span-2 xl:col-span-1">
      <div className="absolute inset-y-0 left-0 w-[3px] bg-warning" />
      <div className="p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-warning">
          <Sparkles className="size-3.5" />
          <span>In Practice</span>
          <Badge variant="outline" className="border-warning/40 bg-card/60 text-warning">
            {pattern.example.tag}
          </Badge>
        </div>
        <p
          className="text-[13px] leading-relaxed text-foreground [&_b]:font-semibold [&_b]:text-foreground [&_code]:rounded [&_code]:bg-foreground/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.86em]"
          dangerouslySetInnerHTML={{ __html: pattern.example.body }}
        />

        {pattern.code && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setCodeOpen(o => !o)}
              className="inline-flex items-center gap-1.5 rounded-md border border-warning/40 bg-card/60 px-2.5 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-warning transition-colors hover:bg-card"
            >
              <Code2 className="size-3.5" />
              <span>{codeOpen ? 'Hide' : 'View'} code · {pattern.code.lang}</span>
              <ChevronRight
                className={cn(
                  'size-3.5 transition-transform duration-200',
                  codeOpen && 'rotate-90',
                )}
              />
            </button>

            <AnimatePresence initial={false}>
              {codeOpen && (
                <motion.div
                  key="code"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <pre className="code-block mt-3 overflow-x-auto rounded-md bg-zinc-950 px-4 py-3 text-[12.5px] leading-relaxed text-zinc-100">
                    <code dangerouslySetInnerHTML={{ __html: pattern.code.snippet }} />
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </Card>
  );
}
