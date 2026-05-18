'use client';
import Link from 'next/link';
import { LogoMark } from './logo';
import { ThemeToggle } from './theme-toggle';

export function TopNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-4 px-4 lg:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-md bg-foreground text-background transition-transform group-hover:scale-105">
            <LogoMark size={15} className="text-brand" />
          </span>
          <span className="text-[13.5px] font-semibold tracking-tight">Multi-Agent Wiki</span>
        </Link>

        <span className="ml-2 hidden font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/80 sm:inline">
          patterns · runtime · references
        </span>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
