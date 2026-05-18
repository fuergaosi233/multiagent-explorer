import { getNav } from '@/lib/wiki-nav';
import { loadDoc } from '@/lib/wiki';

export const dynamic = 'force-static';

export async function GET() {
  const nav = getNav();
  const out: string[] = [];

  out.push('# Multi-Agent Wiki');
  out.push('');
  out.push('> A working reference for multi-agent interaction patterns, classification, and engineering implementation. Each pattern answers four questions: what problem it solves, what its communication structure is, how to implement it in a real system, and when *not* to use it.');
  out.push('');
  out.push('Site sections:');
  out.push('');

  for (const item of nav) {
    if (item.type === 'doc') {
      const doc = loadDoc(item.slug);
      const desc = doc?.description ?? '';
      out.push(`- [${item.label}](${item.href})${desc ? ' — ' + desc : ''}`);
    } else {
      out.push('');
      out.push(`## ${item.label}`);
      out.push('');
      for (const it of item.items) {
        if (it.type !== 'doc') continue;
        const doc = loadDoc(it.slug);
        const desc = doc?.description ?? '';
        out.push(`- [${it.label}](${it.href})${desc ? ' — ' + desc : ''}`);
      }
    }
  }

  out.push('');
  out.push('## Full content');
  out.push('');
  out.push('- [/llms-full.txt](/llms-full.txt) — every wiki page concatenated as plain markdown.');
  out.push('');
  out.push('## Source');
  out.push('');
  out.push('- [GitHub](https://github.com/fuergaosi233/multiagent-explorer)');
  out.push('');

  return new Response(out.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
