import { loadDoc } from '@/lib/wiki';
import { getNav, getNeighbors } from '@/lib/wiki-nav';
import { extractHeadings } from '@/lib/markdown-utils';
import { WikiShell } from '@/components/wiki/wiki-shell';
import { notFound } from 'next/navigation';

export default async function Home() {
  const doc = loadDoc([]);
  if (!doc) notFound();
  const nav = getNav();
  const { prev, next } = getNeighbors([]);
  const headings = extractHeadings(doc.content);
  return (
    <WikiShell
      nav={nav}
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
