import { loadDoc } from '@/lib/wiki';
import { getNeighbors } from '@/lib/wiki-nav';
import { extractHeadings } from '@/lib/markdown-utils';
import { WikiShell } from '@/components/wiki/wiki-shell';
import { notFound } from 'next/navigation';
import { getLocale } from '@/lib/locale';

export default async function Home() {
  const locale = await getLocale();
  const doc = loadDoc([], locale);
  if (!doc) notFound();
  const { prev, next } = getNeighbors([], locale);
  const headings = extractHeadings(doc.content);
  return (
    <WikiShell
      title={doc.title}
      description={doc.description}
      content={doc.content}
      slug={[]}
      prev={prev}
      next={next}
      headings={headings}
      editPath="content/wiki/index.md"
    />
  );
}
