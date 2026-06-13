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
import { getLocale } from '@/lib/locale';
import { markdownPathForSlug } from '@/lib/wiki-md';
import { getTranslations } from 'next-intl/server';

export const dynamicParams = false;

export function generateStaticParams() {
  const slugs = listAllSlugs();
  return slugs
    .filter(slug => slug.length > 0)
    .map(slug => ({ slug }));
}

interface Props {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const locale = await getLocale();
  const doc = loadDoc(slug, locale);
  if (!doc) return {};
  const path = '/' + slug.join('/');
  return {
    title: doc.title,
    description: doc.description,
    alternates: {
      canonical: path,
      types: { 'text/markdown': markdownPathForSlug(slug) },
    },
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

export default async function WikiPage({ params }: Props) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'wiki.breadcrumb' });
  const doc = loadDoc(slug, locale);
  if (!doc) notFound();

  const { prev, next } = getNeighbors(slug, locale);

  const breadcrumbs: { label: string; href?: string }[] = [{ label: t('wiki'), href: '/' }];
  if (slug.length >= 1) {
    const sectionHref = `/${slug[0]}`;
    breadcrumbs.push({
      label: slug[0] === 'patterns' ? t('patterns')
        : slug[0] === 'workflows' ? t('workflows')
        : slug[0] === 'implementation' ? t('implementation')
        : slug[0] === 'reference' ? t('reference')
        : slug[0],
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
