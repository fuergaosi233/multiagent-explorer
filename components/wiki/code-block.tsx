'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  lang?: string;
  source: string;
  children: React.ReactNode;
}

const LANG_LABEL: Record<string, string> = {
  ts: 'TypeScript',
  typescript: 'TypeScript',
  tsx: 'TSX',
  js: 'JavaScript',
  javascript: 'JavaScript',
  jsx: 'JSX',
  py: 'Python',
  python: 'Python',
  sh: 'Shell',
  bash: 'Bash',
  zsh: 'Shell',
  yaml: 'YAML',
  yml: 'YAML',
  json: 'JSON',
  md: 'Markdown',
  markdown: 'Markdown',
  sql: 'SQL',
  go: 'Go',
  rust: 'Rust',
  text: 'Text',
  plain: 'Text',
  txt: 'Text',
};

export function CodeBlock({ lang, source, children }: Props) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations('code');
  const label = lang ? (LANG_LABEL[lang.toLowerCase()] ?? lang.toUpperCase()) : 'Code';

  async function copy() {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — silent */
    }
  }

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-border bg-muted shadow-sm">
      <div className="flex items-center justify-between border-b border-border/70 bg-muted/70 px-3 py-1.5">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? t('copied') : t('copyCode')}
          className={cn(
            'inline-flex h-6 items-center gap-1 rounded px-1.5 text-[10px] font-medium transition-colors',
            copied
              ? 'text-success'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          )}
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          <span className="hidden sm:inline">{copied ? t('copied') : t('copy')}</span>
        </button>
      </div>
      {children}
    </div>
  );
}
