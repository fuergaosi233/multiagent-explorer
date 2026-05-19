'use client';
import Link from 'next/link';
import { Children, isValidElement, type ReactElement } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import { Mermaid } from './mermaid';
import { FlowDiagram } from './flow-diagram';
import { CodeBlock } from './code-block';
import { cn } from '@/lib/utils';

interface Props {
  content: string;
  slug: string[];
}

/** Languages that Mermaid renders as diagrams. */
const MERMAID_TAGS = new Set([
  'mermaid',
  'flowchart',
  'sequencediagram',
  'statediagram',
  'statediagram-v2',
  'classdiagram',
  'erdiagram',
  'journey',
  'gantt',
  'pie',
  'gitgraph',
  'mindmap',
  'timeline',
  'quadrantchart',
  'sankey',
  'xychart',
  'block',
  'packet',
]);

/** First-token detection so a bare ```flowchart block whose body already starts with
 *  `flowchart TD` is rendered correctly without double-prepending. */
const MERMAID_BARE_KEYWORDS = new Set(
  Array.from(MERMAID_TAGS).filter(t => t !== 'mermaid'),
);

function toMermaidSource(lang: string, body: string): string {
  if (lang === 'mermaid') return body;
  const firstToken = body.trim().split(/\s/, 1)[0]?.toLowerCase() ?? '';
  if (MERMAID_BARE_KEYWORDS.has(firstToken)) return body;
  return `${lang}\n${body}`;
}

function resolveWikiLink(href: string | undefined, currentSlug: string[]): string | null {
  if (!href) return null;
  if (/^(https?:)?\/\//i.test(href)) return null;
  if (href.startsWith('#')) return null;
  if (href.startsWith('mailto:')) return null;

  const [pathPart, hash] = href.split('#');
  const clean = pathPart.replace(/\.md$/, '').replace(/\/index$/, '');

  let absolute: string;
  if (clean.startsWith('/')) {
    absolute = clean;
  } else {
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

/** Flatten a React node tree to plain text — needed when rehype-highlight has
 *  wrapped the source in <span> tokens for syntax highlighting. */
function nodeText(node: React.ReactNode): string {
  if (node == null || node === false || node === true) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join('');
  if (isValidElement(node)) {
    return nodeText((node.props as { children?: React.ReactNode }).children);
  }
  return '';
}

/** Recursively find the first element carrying a `language-xxx` className —
 *  rehype-highlight nests the syntax-highlighted code under <code class="hljs
 *  language-ts">…</code>, but the inner code element is what we want. */
function findCodeElement(node: React.ReactNode): ReactElement<{ className?: string; children?: React.ReactNode }> | null {
  const arr = Children.toArray(node);
  for (const c of arr) {
    if (!isValidElement(c)) continue;
    const cls = (c.props as { className?: string }).className;
    if (cls && /language-[\w-]+/.test(cls)) return c as ReactElement<{ className?: string; children?: React.ReactNode }>;
    const inner = findCodeElement((c.props as { children?: React.ReactNode }).children);
    if (inner) return inner;
  }
  return null;
}

function readCodeChild(children: React.ReactNode): { lang?: string; source: string } | null {
  const el = findCodeElement(children);
  if (!el) {
    // No language tag → still return source text so we can wrap it as plain code.
    return { source: nodeText(children).replace(/\n$/, '') };
  }
  const cls = el.props.className ?? '';
  const lang = cls.match(/language-([\w-]+)/)?.[1];
  return { lang, source: nodeText(el.props.children).replace(/\n$/, '') };
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

    h1: () => null,
    h2: ({ children, ...props }) => (
      <h2
        {...props}
        className="group mt-10 mb-3 scroll-mt-20 text-xl font-semibold tracking-tight text-foreground first:mt-0"
      >
        <a href={`#${(props as { id?: string }).id ?? ''}`} className="no-underline">
          {children}
        </a>
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 {...props} className="mt-6 mb-2 scroll-mt-20 text-base font-semibold tracking-tight text-foreground">
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

    // Inline code stays unwrapped; block code is intercepted at `pre` so we
    // can wrap with a header + copy button (and route Mermaid-like langs to
    // the diagram renderer).
    code: ({ className, children, ...props }) => {
      if (!className) {
        return (
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.86em] text-foreground">
            {children}
          </code>
        );
      }
      return (
        <code className={cn(className, 'block font-mono text-[12.5px] leading-relaxed')} {...props}>
          {children}
        </code>
      );
    },

    pre: ({ children }) => {
      const meta = readCodeChild(children);
      const lang = meta?.lang?.toLowerCase();
      const source = meta?.source ?? '';

      if (lang && MERMAID_TAGS.has(lang)) {
        const chart = toMermaidSource(lang, source);
        // Try the React Flow renderer first (animated edges, draggable
        // nodes, fullscreen zoom). It transparently falls back to the
        // mermaid renderer for any syntax it can't handle.
        return <FlowDiagram chart={chart} fallback={<Mermaid chart={chart} />} />;
      }

      return (
        <CodeBlock lang={meta?.lang} source={source}>
          <pre className="overflow-x-auto px-4 py-3 text-[12.5px] leading-relaxed text-foreground [&_code]:bg-transparent [&_code]:p-0">
            {children}
          </pre>
        </CodeBlock>
      );
    },

    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
  };

  return (
    <article className="text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, [rehypeHighlight, { detect: true, ignoreMissing: true }]]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
