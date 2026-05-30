'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Globe } from 'lucide-react';
import { useCallback, useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

const LANGUAGES: Record<string, string> = {
  en: 'English',
  zh: '中文',
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations('nav');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const switchLanguage = useCallback((next: string) => {
    if (next === locale) {
      setOpen(false);
      return;
    }
    document.cookie = `locale=${next};path=/;max-age=31536000`;
    window.location.reload();
  }, [locale]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={t('language')}
        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <Globe className="size-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[140px] overflow-hidden rounded-lg border border-border bg-card py-1 shadow-lg">
          {Object.entries(LANGUAGES).map(([code, name]) => (
            <button
              key={code}
              type="button"
              onClick={() => switchLanguage(code)}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2 text-[13px] transition-colors hover:bg-accent/40',
                locale === code ? 'font-medium text-foreground' : 'text-muted-foreground',
              )}
            >
              <span className={cn(
                'size-2 rounded-full',
                locale === code ? 'bg-brand' : 'bg-muted-foreground/30',
              )} />
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
