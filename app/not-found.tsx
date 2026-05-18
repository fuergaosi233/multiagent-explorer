import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-w-0 flex-1 py-16 lg:pl-10 lg:pr-8">
      <div className="max-w-[760px]">
        <span className="inline-flex items-center rounded-md border border-border bg-muted/40 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          404
        </span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          The wiki page you're looking for doesn't exist. Browse the sidebar, or
          jump straight to one of these:
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            { href: '/', label: 'Home', sub: 'Overview + recommended paths' },
            { href: '/patterns', label: 'Patterns', sub: '29 multi-agent patterns' },
            { href: '/taxonomy', label: 'Taxonomy', sub: '5-dimensional view' },
            { href: '/decision-matrix', label: 'Decision Matrix', sub: 'Pick by task' },
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
