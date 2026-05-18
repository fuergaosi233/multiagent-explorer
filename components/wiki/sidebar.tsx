'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import type { NavItem, NavLeaf, NavGroupLabel } from '@/lib/wiki-nav';
import { cn } from '@/lib/utils';

interface Props { nav: NavItem[] }

export function WikiSidebar({ nav }: Props) {
  return (
    <nav className="flex flex-col gap-0.5 py-6 pr-4">
      {nav.map((item, i) =>
        item.type === 'doc' ? (
          <NavDoc key={item.href} item={item} />
        ) : (
          <NavCategory key={`cat-${i}`} label={item.label} items={item.items} />
        ),
      )}
    </nav>
  );
}

function NavDoc({ item, depth = 0 }: { item: NavLeaf; depth?: number }) {
  const pathname = usePathname();
  const active = pathname === item.href;
  return (
    <Link
      href={item.href}
      className={cn(
        'relative flex items-center rounded-md py-1.5 text-[13px] leading-tight transition-colors',
        depth === 0 ? 'pl-3 pr-2' : 'pl-5 pr-2',
        active
          ? 'text-foreground'
          : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground',
      )}
    >
      {active && (
        <motion.span
          layoutId="wiki-active-pill"
          className="absolute inset-0 -z-0 rounded-md bg-sidebar-accent"
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        />
      )}
      {active && (
        <motion.span
          layoutId="wiki-active-bar"
          className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2.5px] rounded-r-full bg-brand"
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        />
      )}
      <span className={cn('relative z-10 truncate', active && 'font-medium')}>{item.label}</span>
    </Link>
  );
}

function NavGroup({ label }: { label: NavGroupLabel['label'] }) {
  return (
    <div className="mt-3 mb-0.5 px-3 font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
      {label}
    </div>
  );
}

function NavCategory({
  label,
  items,
}: {
  label: string;
  items: (NavLeaf | NavGroupLabel)[];
}) {
  const pathname = usePathname();
  const hasActive = items.some(i => i.type === 'doc' && i.href === pathname);
  const [open, setOpen] = useState<boolean>(hasActive || true);
  const docCount = items.filter(i => i.type === 'doc').length;

  return (
    <div className="mt-4 first:mt-1">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center gap-1.5 px-3 py-1 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/75 transition-colors hover:text-foreground"
      >
        <ChevronRight
          className={cn(
            'size-3 text-brand transition-transform duration-200',
            open && 'rotate-90',
          )}
        />
        <span>{label}</span>
        <span className="ml-auto font-sans text-[10px] font-normal tracking-normal text-muted-foreground/60">
          {docCount}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-0.5 flex flex-col gap-0.5">
              {items.map((it, i) =>
                it.type === 'group' ? (
                  <NavGroup key={`g-${i}`} label={it.label} />
                ) : (
                  <NavDoc key={it.href} item={it} depth={1} />
                ),
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
