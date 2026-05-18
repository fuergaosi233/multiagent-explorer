import { getNav } from '@/lib/wiki-nav';
import { loadDoc } from '@/lib/wiki';

export const dynamic = 'force-static';

export async function GET() {
  const nav = getNav();
  const out: string[] = [];

  out.push('# Multi-Agent Wiki — full content');
  out.push('');
  out.push('Every wiki page concatenated as plain markdown for LLM ingestion. Source of truth lives under `content/wiki/` in the repo.');
  out.push('');
  out.push('## Table of contents');
  out.push('');
  for (const item of nav) {
    if (item.type === 'doc') {
      out.push(`- ${item.label} (\`${item.href}\`)`);
    } else {
      out.push('');
      out.push(`### ${item.label}`);
      for (const it of item.items) {
        out.push(`- ${it.label} (\`${it.href}\`)`);
      }
    }
  }
  out.push('');
  out.push('---');
  out.push('');

  for (const item of nav) {
    const docs = item.type === 'doc' ? [item] : item.items;
    if (item.type === 'category') {
      out.push(`# ${item.label}`);
      out.push('');
    }
    for (const it of docs) {
      const doc = loadDoc(it.slug);
      if (!doc) continue;
      out.push(`## ${doc.title}`);
      if (doc.description) {
        out.push('');
        out.push(`*${doc.description}*`);
      }
      out.push('');
      out.push(`Source: \`${it.href}\``);
      out.push('');
      out.push(doc.content.trim());
      out.push('');
      out.push('---');
      out.push('');
    }
  }

  return new Response(out.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
