import { loadDoc } from '@/lib/wiki';
import { getNav, getNeighbors } from '@/lib/wiki-nav';
import { WikiShell } from '@/components/wiki/wiki-shell';
import { notFound } from 'next/navigation';

export default async function Home() {
  const doc = loadDoc([]);
  if (!doc) notFound();
  const nav = getNav();
  const { prev, next } = getNeighbors([]);
  return (
    <WikiShell
      nav={nav}
      title={doc.title}
      description={doc.description}
      content={doc.content}
      slug={[]}
      prev={prev}
      next={next}
    />
  );
}
