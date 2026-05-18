import { notFound } from 'next/navigation';
import { listAllSlugs, loadDoc } from '@/lib/wiki';
import { getNav, getNeighbors } from '@/lib/wiki-nav';
import { WikiShell } from '@/components/wiki/wiki-shell';
import { AnimatedPattern } from '@/components/wiki/animated-pattern';
import { WIKI_TO_PATTERN } from '@/lib/pattern-map';

export const dynamicParams = false;

export function generateStaticParams() {
  return listAllSlugs()
    .filter(slug => slug.length > 0)
    .map(slug => ({ slug }));
}

interface Props {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const doc = loadDoc(slug);
  if (!doc) return {};
  return {
    title: `${doc.title} · Multi-Agent Wiki`,
    description: doc.description,
  };
}

const SECTION_LABELS: Record<string, string> = {
  patterns: 'Patterns',
  implementation: 'Implementation',
  reference: 'Reference',
};

export default async function WikiPage({ params }: Props) {
  const { slug } = await params;
  const doc = loadDoc(slug);
  if (!doc) notFound();

  const nav = getNav();
  const { prev, next } = getNeighbors(slug);

  const breadcrumbs: { label: string; href?: string }[] = [{ label: 'Wiki', href: '/' }];
  if (slug.length >= 1 && SECTION_LABELS[slug[0]]) {
    const sectionHref = `/${slug[0]}`;
    breadcrumbs.push({
      label: SECTION_LABELS[slug[0]],
      href: slug.length > 1 ? sectionHref : undefined,
    });
  }
  if (slug.length > 1) breadcrumbs.push({ label: doc.title });

  // Embed the animated widget on pattern pages that map to a known animation.
  const animationId =
    slug[0] === 'patterns' && slug.length === 2 ? WIKI_TO_PATTERN[slug[1]] : undefined;
  const widget = animationId ? <AnimatedPattern patternId={animationId} /> : null;

  return (
    <WikiShell
      nav={nav}
      title={doc.title}
      description={doc.description}
      content={doc.content}
      slug={slug}
      prev={prev}
      next={next}
      breadcrumbs={breadcrumbs}
      widget={widget}
    />
  );
}
