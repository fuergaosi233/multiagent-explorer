'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogoMark } from './logo';
import { ThemeToggle } from './theme-toggle';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/', label: 'Wiki' },
  { href: '/patterns', label: 'Patterns' },
];

export function TopNav() {
  const pathname = usePathname();
  const activeIdx = TABS.findIndex(
    t => pathname === t.href || (t.href !== '/' && pathname.startsWith(t.href)),
  );

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-12 items-center gap-4 px-4 lg:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-md bg-foreground text-background transition-transform group-hover:scale-105">
            <LogoMark size={15} className="text-brand" />
          </span>
          <span className="flex items-center gap-1.5 text-[13px] font-semibold tracking-tight">
            Multi-Agent Wiki
            <Badge variant="brand" className="px-1.5 py-0 text-[9px] leading-none">v1</Badge>
          </span>
        </Link>

        <div className="ml-2 flex h-8 items-center gap-0.5 rounded-md p-0.5">
          {TABS.map((tab, i) => {
            const active = i === activeIdx;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'relative inline-flex h-7 items-center rounded-[5px] px-3 text-[12.5px] font-medium transition-colors',
                  active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="top-nav-pill"
                    className="absolute inset-0 -z-0 rounded-[5px] bg-accent"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">{tab.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <Link
            href="https://github.com/fuergaosi233/multiagent-explorer"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="GitHub"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.69-3.87-1.36-3.87-1.36-.52-1.32-1.28-1.67-1.28-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.89-.39.98 0 1.97.13 2.89.39 2.2-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.83 1.18 3.09 0 4.43-2.69 5.4-5.25 5.69.41.36.77 1.06.77 2.14v3.17c0 .31.21.66.79.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
            </svg>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
