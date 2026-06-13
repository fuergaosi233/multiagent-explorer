import { getNav } from '@/lib/wiki-nav';
import { loadDoc, loadRawDoc } from '@/lib/wiki';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import { absoluteUrl, markdownPathForSlug } from '@/lib/wiki-md';

export const dynamic = 'force-static';

export async function GET() {
  const nav = getNav('en');
  const out: string[] = [];

  out.push(`# ${SITE_NAME} — full Markdown corpus`);
  out.push('');
  out.push('Every canonical English wiki page concatenated as Markdown for LLM ingestion. Source of truth lives under `content/wiki/` in the repository.');
  out.push('');
  out.push(`Canonical site: ${SITE_URL}`);
  out.push(`Overview: ${absoluteUrl('/llms.txt')}`);
  out.push('');
  out.push('## Table of contents');
  out.push('');
  for (const item of nav) {
    if (item.type === 'doc') {
      out.push(`- ${item.label} (${absoluteUrl(item.href)})`);
    } else {
      out.push('');
      out.push(`### ${item.label}`);
      for (const it of item.items) {
        if (it.type === 'doc') out.push(`- ${it.label} (${absoluteUrl(it.href)})`);
      }
    }
  }
  out.push('');
  out.push('---');
  out.push('');

  for (const item of nav) {
    const docs = item.type === 'doc' ? [item] : item.items.filter(it => it.type === 'doc');
    if (item.type === 'category') {
      out.push(`# ${item.label}`);
      out.push('');
    }
    for (const it of docs) {
      const doc = loadDoc(it.slug, 'en');
      const raw = loadRawDoc(it.slug, 'en');
      if (!doc) continue;
      out.push(`## Page: ${doc.title}`);
      if (doc.description) {
        out.push('');
        out.push(`Summary: ${doc.description}`);
      }
      out.push('');
      out.push(`Canonical URL: ${absoluteUrl(it.href)}`);
      out.push(`Markdown URL: ${absoluteUrl(markdownPathForSlug(it.slug))}`);
      out.push('');
      out.push((raw ?? doc.content).trim());
      out.push('');
      out.push('---');
      out.push('');
    }
  }

  return new Response(out.join('\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
