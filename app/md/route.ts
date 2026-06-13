import { loadCanonicalMarkdown, markdownResponse } from '@/lib/wiki-md';

export const dynamic = 'force-static';

export async function GET() {
  const markdown = loadCanonicalMarkdown([]);
  if (!markdown) return new Response(null, { status: 404 });

  return markdownResponse(markdown);
}

