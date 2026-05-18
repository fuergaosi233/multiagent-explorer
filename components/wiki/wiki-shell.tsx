'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { NavLeaf } from '@/lib/wiki-nav';
import type { Heading } from '@/lib/markdown-utils';
import { Markdown } from './markdown';
import { Toc } from './toc';
import { cn } from '@/lib/utils';
import { CATEGORY_TONE, type PatternCategory } from '@/lib/pattern-map';

interface Props {
  title: string;
  description?: string;
  content: string;
  slug: string[];
  prev?: NavLeaf;
  next?: NavLeaf;
  widget?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  headings?: Heading[];
  category?: PatternCategory;
  editPath?: string;
}

/**
 * Article body for a wiki page. Top nav + left sidebar live in the root
 * layout so they persist across navigation — this component owns only the
 * main content column and the optional right-side TOC.
 */
export function WikiShell({
  title, description, content, slug, prev, next, widget, breadcrumbs, headings, category, editPath,
}: Props) {
  return (
    <>
      <main className="min-w-0 flex-1 py-10 lg:pl-10 lg:pr-8">
        <motion.div
          key={slug.join('/') || 'home'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
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
            {category && (
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider',
                  CATEGORY_TONE[category],
                )}
              >
                {category}
              </span>
            )}
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {description && (
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
          </header>

          {widget && <div className="mb-6">{widget}</div>}

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

          <footer className="mt-16 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-6 text-[11px] text-muted-foreground">
            <span>Multi-Agent Wiki — an engineering knowledge base.</span>
            {editPath && (
              <a
                href={`https://github.com/fuergaosi233/multiagent-explorer/edit/main/${editPath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Edit this page →
              </a>
            )}
          </footer>
        </motion.div>
      </main>

      {headings && headings.length > 0 && (
        <aside className="hidden w-[200px] shrink-0 xl:block">
          <Toc headings={headings} />
        </aside>
      )}
    </>
  );
}
