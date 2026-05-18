'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import type { NavItem } from '@/lib/wiki-nav';
import { cn } from '@/lib/utils';

interface Props { nav: NavItem[] }

export function WikiSidebar({ nav }: Props) {
  return (
    <nav className="flex flex-col gap-1 px-2 py-4">
      {nav.map((item, i) =>
        item.type === 'doc' ? (
          <NavDoc key={item.href} href={item.href} label={item.label} />
        ) : (
          <NavCategory key={`cat-${i}`} label={item.label} items={item.items} />
        ),
      )}
    </nav>
  );
}

function NavDoc({ href, label, depth = 0 }: { href: string; label: string; depth?: number }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={cn(
        'relative flex items-center rounded-md px-3 py-1.5 text-[13px] transition-colors',
        depth > 0 && 'ml-2',
        active
          ? 'text-foreground'
          : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground',
      )}
    >
      {active && (
        <motion.span
          layoutId="wiki-active-pill"
          className="absolute inset-0 -z-0 rounded-md bg-sidebar-accent"
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        />
      )}
      {active && (
        <motion.span
          layoutId="wiki-active-bar"
          className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-brand"
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        />
      )}
      <span className="relative z-10 truncate">{label}</span>
    </Link>
  );
}

function NavCategory({ label, items }: { label: string; items: { href: string; label: string }[] }) {
  const pathname = usePathname();
  const hasActive = items.some(i => i.href === pathname);
  const [open, setOpen] = useState<boolean>(hasActive || true);

  return (
    <div className="mt-3 first:mt-1">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center gap-1.5 px-3 py-1.5 text-left font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-foreground/70 transition-colors hover:text-foreground"
      >
        <ChevronRight
          className={cn(
            'size-3 text-brand transition-transform duration-200',
            open && 'rotate-90',
          )}
        />
        <span>{label}</span>
        <span className="ml-auto text-muted-foreground/60">{items.length}</span>
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
              {items.map(it => (
                <NavDoc key={it.href} href={it.href} label={it.label} depth={1} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
