import { listAllSlugs } from '@/lib/wiki';
import { loadCanonicalMarkdown, markdownResponse } from '@/lib/wiki-md';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  const slugs = listAllSlugs('en').filter(slug => slug.length > 0);
  return [['index'], ...slugs].map(slug => ({ slug }));
}

interface Context {
  params: Promise<{ slug: string[] }>;
}

export async function GET(_: Request, ctx: Context) {
  const { slug } = await ctx.params;
  const markdown = loadCanonicalMarkdown(slug);
  if (!markdown) return new Response(null, { status: 404 });

  return markdownResponse(markdown);
}

