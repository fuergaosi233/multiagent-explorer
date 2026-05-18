'use client';
import Link from 'next/link';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { Mermaid } from './mermaid';
import { cn } from '@/lib/utils';

interface Props {
  content: string;
  /** Current slug (e.g. ['patterns', 'supervisor-manager']) — used to resolve relative `./foo` links. */
  slug: string[];
}

/** Rewrite a relative wiki link (`./foo`, `../bar`, `foo.md`) into an absolute `/wiki/...` URL. */
function resolveWikiLink(href: string | undefined, currentSlug: string[]): string | null {
  if (!href) return null;
  if (/^(https?:)?\/\//i.test(href)) return null;
  if (href.startsWith('#')) return null;
  if (href.startsWith('mailto:')) return null;

  // Strip trailing .md and section anchor.
  const [pathPart, hash] = href.split('#');
  let clean = pathPart.replace(/\.md$/, '').replace(/\/index$/, '');

  let absolute: string;
  if (clean.startsWith('/')) {
    absolute = clean;
  } else {
    // Resolve relative to the current page's *directory*.
    const dir = currentSlug.slice(0, -1);
    const parts = [...dir];
    for (const segment of clean.split('/')) {
      if (segment === '' || segment === '.') continue;
      if (segment === '..') parts.pop();
      else parts.push(segment);
    }
    absolute = '/' + parts.join('/');
  }

  if (!absolute.startsWith('/')) absolute = '/' + absolute;
  return absolute + (hash ? '#' + hash : '');
}

export function Markdown({ content, slug }: Props) {
  const components: Components = {
    a({ href, children }) {
      const fixed = resolveWikiLink(href, slug);
      if (fixed) {
        return (
          <Link
            href={fixed}
            className="font-medium text-brand underline decoration-brand/30 underline-offset-2 transition-colors hover:decoration-brand"
          >
            {children}
          </Link>
        );
      }
      return (
        <a
          href={href}
          target={href?.startsWith('http') ? '_blank' : undefined}
          rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="font-medium text-brand underline decoration-brand/30 underline-offset-2 transition-colors hover:decoration-brand"
        >
          {children}
        </a>
      );
    },

    h1: ({ children }) => null, // h1 comes from page title separately
    h2: ({ children }) => (
      <h2 className="mt-10 mb-3 scroll-mt-20 text-xl font-semibold tracking-tight text-foreground first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-6 mb-2 scroll-mt-20 text-base font-semibold tracking-tight text-foreground">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-4 mb-2 scroll-mt-20 text-[14px] font-semibold uppercase tracking-wide text-muted-foreground">
        {children}
      </h4>
    ),
    p: ({ children }) => (
      <p className="my-3 text-[14.5px] leading-relaxed text-foreground/85">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="my-3 space-y-1.5 pl-5 text-[14.5px] text-foreground/85 marker:text-muted-foreground/60 [&>li]:list-disc">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="my-3 space-y-1.5 pl-5 text-[14.5px] text-foreground/85 marker:text-muted-foreground/60 [&>li]:list-decimal">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    hr: () => <hr className="my-8 border-border" />,
    blockquote: ({ children }) => (
      <blockquote className="my-4 border-l-2 border-brand bg-brand/5 px-4 py-2 text-[14px] italic text-foreground/80">
        {children}
      </blockquote>
    ),

    table: ({ children }) => (
      <div className="my-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-[13px]">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => <tr className="border-b border-border last:border-b-0">{children}</tr>,
    th: ({ children }) => (
      <th className="px-3 py-2 text-left font-medium text-foreground">{children}</th>
    ),
    td: ({ children }) => <td className="px-3 py-2 align-top text-foreground/80">{children}</td>,

    code: ({ className, children, ...props }) => {
      const lang = className?.replace(/^language-/, '');
      const inline = !lang;
      const text = String(children).replace(/\n$/, '');

      if (inline) {
        return (
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.86em] text-foreground">
            {children}
          </code>
        );
      }

      if (lang === 'mermaid') {
        return <Mermaid chart={text} />;
      }

      return (
        <code className={cn(className, 'font-mono text-[12.5px] leading-relaxed')} {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children }) => (
      <pre className="my-4 overflow-x-auto rounded-lg bg-zinc-950 px-4 py-3 text-[12.5px] leading-relaxed text-zinc-100 [&_code]:bg-transparent [&_code]:p-0">
        {children}
      </pre>
    ),

    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
  };

  return (
    <article className="text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
