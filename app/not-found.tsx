import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <main className="min-w-0 flex-1 py-16 lg:pl-10 lg:pr-8">
      <div className="max-w-[760px]">
        <span className="inline-flex items-center rounded-md border border-border bg-muted/40 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          404
        </span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          {t('description')}
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            { href: '/', label: t('links.home.label'), sub: t('links.home.sub') },
            { href: '/patterns', label: t('links.patterns.label'), sub: t('links.patterns.sub') },
            { href: '/taxonomy', label: t('links.taxonomy.label'), sub: t('links.taxonomy.sub') },
            { href: '/decision-matrix', label: t('links.decisionMatrix.label'), sub: t('links.decisionMatrix.sub') },
          ].map(it => (
            <Link
              key={it.href}
              href={it.href}
              className="group flex flex-col gap-1 rounded-lg border border-border p-3 transition-colors hover:border-brand/40 hover:bg-accent/30"
            >
              <span className="text-sm font-medium text-foreground transition-colors group-hover:text-brand">
                {it.label}
              </span>
              <span className="text-[12px] text-muted-foreground">{it.sub}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
