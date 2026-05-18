import { PATTERNS } from '@/data/patterns';
import { GROUP_NAMES, GROUP_ORDER, patternToMarkdown } from '@/lib/patterns-md';

export const dynamic = 'force-static';

export async function GET() {
  const out: string[] = [];

  out.push('# Multi-Agent Explorer — full pattern reference');
  out.push('');
  out.push('Every pattern catalogued in the Multi-Agent Explorer, rendered as plain markdown for LLM ingestion. Source of truth: `data/patterns.ts` in the repo.');
  out.push('');
  out.push('## Table of contents');
  out.push('');
  for (const group of GROUP_ORDER) {
    const patterns = PATTERNS.filter(p => p.group === group);
    if (!patterns.length) continue;
    out.push(`### ${GROUP_NAMES[group]}`);
    for (const p of patterns) {
      out.push(`- ${p.title} (\`${p.id}\`)`);
    }
    out.push('');
  }

  out.push('---');
  out.push('');

  for (const group of GROUP_ORDER) {
    const patterns = PATTERNS.filter(p => p.group === group);
    if (!patterns.length) continue;
    out.push(`# ${GROUP_NAMES[group]}`);
    out.push('');
    for (const p of patterns) {
      out.push(patternToMarkdown(p));
      out.push('---');
      out.push('');
    }
  }

  return new Response(out.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
