'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import type { NavItem, NavLeaf, NavGroupLabel } from '@/lib/wiki-nav';
import { cn } from '@/lib/utils';

interface Props { nav: NavItem[] }

const SCROLL_KEY = 'wiki:sidebar-scroll';

// SSR-safe useLayoutEffect.
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function WikiSidebar({ nav }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Capture scroll position the instant the user clicks any link inside the
  // sidebar, BEFORE Next.js (or framer-motion's layoutId animations) get a
  // chance to mutate scrollTop on the container. Saving on scroll events
  // alone races with the auto-scroll Next.js performs on navigation.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element).closest('a')) {
        sessionStorage.setItem(SCROLL_KEY, String(el.scrollTop));
      }
    };
    el.addEventListener('click', onClick, true);
    return () => el.removeEventListener('click', onClick, true);
  }, []);

  // Restore on every route change, synchronously after DOM updates — this
  // wins over any post-navigation scroll reset.
  useIsoLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved !== null) el.scrollTop = Number(saved) || 0;
  }, [pathname]);

  return (
    <div
      ref={scrollRef}
      className="sticky top-14 h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain"
    >
      <nav className="flex flex-col gap-0.5 py-6 pr-4">
      {nav.map((item, i) =>
        item.type === 'doc' ? (
          <NavDoc key={item.href} item={item} />
        ) : (
          <NavCategory
            key={`cat-${i}`}
            label={item.label}
            href={item.href}
            items={item.items}
          />
        ),
      )}
      </nav>
    </div>
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
  href,
  items,
}: {
  label: string;
  href?: string;
  items: (NavLeaf | NavGroupLabel)[];
}) {
  const pathname = usePathname();
  const hasActive = items.some(i => i.type === 'doc' && i.href === pathname);
  const [open, setOpen] = useState<boolean>(hasActive || true);
  const docCount = items.filter(i => i.type === 'doc').length;
  const labelActive = href && pathname === href;

  // Header is a flex row: chevron (toggle) + label (link if href).
  // Keeping them as separate clickable surfaces means clicking the chevron
  // toggles without navigating, and clicking the label navigates without
  // collapsing the section.
  return (
    <div className="mt-4 first:mt-1">
      <div className="flex w-full items-center gap-0.5 px-2 py-1">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="flex size-5 items-center justify-center rounded text-brand transition-colors hover:bg-accent/40"
          aria-label={open ? `Collapse ${label}` : `Expand ${label}`}
          aria-expanded={open}
        >
          <ChevronRight
            className={cn('size-3 transition-transform duration-200', open && 'rotate-90')}
          />
        </button>
        {href ? (
          <Link
            href={href}
            className={cn(
              'flex flex-1 items-center gap-1.5 rounded-sm px-1 py-0.5 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors',
              labelActive ? 'text-foreground' : 'text-foreground/75 hover:text-foreground',
            )}
          >
            <span>{label}</span>
            <span className="ml-auto font-sans text-[10px] font-normal tracking-normal text-muted-foreground/60">
              {docCount}
            </span>
          </Link>
        ) : (
          <span className="flex flex-1 items-center gap-1.5 px-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/75">
            {label}
            <span className="ml-auto font-sans text-[10px] font-normal tracking-normal text-muted-foreground/60">
              {docCount}
            </span>
          </span>
        )}
      </div>
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
