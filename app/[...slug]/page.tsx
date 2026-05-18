import { notFound } from 'next/navigation';
import { listAllSlugs, loadDoc } from '@/lib/wiki';
import { getNeighbors } from '@/lib/wiki-nav';
import { extractHeadings, extractTopology } from '@/lib/markdown-utils';
import { WikiShell } from '@/components/wiki/wiki-shell';
import { AnimatedPattern } from '@/components/wiki/animated-pattern';
import { TopologyHero } from '@/components/wiki/topology-hero';
import {
  PATTERN_CATEGORY,
  WIKI_TO_PATTERN,
  type PatternCategory,
} from '@/lib/pattern-map';

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
  const path = '/' + slug.join('/');
  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: path },
    openGraph: {
      type: 'article',
      title: doc.title,
      description: doc.description,
      url: path,
      images: [{ url: `/og${path}`, width: 1200, height: 630, alt: doc.title }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: doc.title,
      description: doc.description,
      images: [`/og${path}`],
    },
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

  const isPattern = slug[0] === 'patterns' && slug.length === 2;
  const patternSlug = isPattern ? slug[1] : undefined;
  const animationId = patternSlug ? WIKI_TO_PATTERN[patternSlug] : undefined;
  const category: PatternCategory | undefined = patternSlug
    ? PATTERN_CATEGORY[patternSlug]
    : undefined;

  // Lift the first mermaid block out of the body so it becomes the hero
  // and doesn't render twice on pattern pages.
  let content = doc.content;
  let widget: React.ReactNode = null;

  if (isPattern) {
    const { mermaid, content: stripped } = extractTopology(content);
    content = stripped;
    if (animationId) {
      widget = <AnimatedPattern patternId={animationId} />;
    } else if (mermaid) {
      widget = <TopologyHero chart={mermaid} />;
    }
  }

  const headings = extractHeadings(content);
  const editPath = `content/wiki/${slug.join('/')}.md`;

  return (
    <WikiShell
      title={doc.title}
      description={doc.description}
      content={content}
      slug={slug}
      prev={prev}
      next={next}
      breadcrumbs={breadcrumbs}
      widget={widget}
      headings={headings}
      category={category}
      editPath={editPath}
    />
  );
}
