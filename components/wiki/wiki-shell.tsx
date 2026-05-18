'use client';
import { motion } from 'framer-motion';
import type { NavItem, NavLeaf } from '@/lib/wiki-nav';
import { WikiSidebar } from './sidebar';
import { Markdown } from './markdown';
import { TopNav } from '../top-nav';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  nav: NavItem[];
  title: string;
  description?: string;
  content: string;
  slug: string[];
  prev?: NavLeaf;
  next?: NavLeaf;
  /** Optional widget to render at the top of the page (e.g. animated pattern explorer). */
  widget?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export function WikiShell({
  nav, title, description, content, slug, prev, next, widget, breadcrumbs,
}: Props) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <TopNav />

      <div className="mx-auto flex max-w-[1400px] gap-0 px-4 lg:px-6">
        {/* Sidebar */}
        <aside className="hidden w-[260px] shrink-0 border-r border-border lg:block">
          <div className="sticky top-12 h-[calc(100dvh-3rem)] overflow-y-auto">
            <WikiSidebar nav={nav} />
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1 px-0 py-8 lg:px-10">
          <motion.div
            key={slug.join('/') || 'home'}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-[760px]"
          >
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="mb-3 flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {breadcrumbs.map((b, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    {i > 0 && <span className="opacity-40">/</span>}
                    {b.href ? (
                      <Link href={b.href} className="transition-colors hover:text-foreground">
                        {b.label}
                      </Link>
                    ) : (
                      <span className="text-foreground/80">{b.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            )}

            <header className="mb-6">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
              {description && (
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                  {description}
                </p>
              )}
            </header>

            {widget && (
              <div className="mb-6">
                {widget}
              </div>
            )}

            <Markdown content={content} slug={slug} />

            {(prev || next) && (
              <nav className="mt-12 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
                {prev ? (
                  <Link
                    href={prev.href}
                    className="group flex flex-col gap-1 rounded-lg border border-border p-3 transition-colors hover:border-brand/40 hover:bg-accent/30"
                  >
                    <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      <ChevronLeft className="size-3" />
                      Previous
                    </span>
                    <span className="text-sm font-medium text-foreground transition-colors group-hover:text-brand">
                      {prev.label}
                    </span>
                  </Link>
                ) : <span />}
                {next ? (
                  <Link
                    href={next.href}
                    className="group flex flex-col items-end gap-1 rounded-lg border border-border p-3 text-right transition-colors hover:border-brand/40 hover:bg-accent/30"
                  >
                    <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Next
                      <ChevronRight className="size-3" />
                    </span>
                    <span className="text-sm font-medium text-foreground transition-colors group-hover:text-brand">
                      {next.label}
                    </span>
                  </Link>
                ) : <span />}
              </nav>
            )}
          </motion.div>

          <footer className="mt-16 border-t border-border pt-6 text-[11px] text-muted-foreground">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>Multi-Agent Wiki — an engineering knowledge base.</span>
              <span className="flex items-center gap-2">
                <Badge variant="outline">Built with Next.js</Badge>
                <Badge variant="outline">Deployed on Vercel</Badge>
              </span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
