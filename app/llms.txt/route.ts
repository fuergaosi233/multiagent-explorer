import { PATTERNS } from '@/data/patterns';
import { GROUP_NAMES, GROUP_ORDER, patternSummary } from '@/lib/patterns-md';

export const dynamic = 'force-static';

export async function GET() {
  const out: string[] = [];

  out.push('# Multi-Agent Explorer');
  out.push('');
  out.push('> Interactive reference for 13 multi-agent system patterns across 5 categories — Centralized Control, Flow, Dialog, Decision, and Decentralized / Protocol. Each pattern includes a mechanism description, animated topology diagram, timeline of execution steps, when-to-use guidance, risks, a concrete example, and a runnable code snippet.');
  out.push('');
  out.push('Designed for engineers picking a multi-agent architecture, and as a structured reference for LLM agents researching the design space. The UI at the homepage lets you step through each pattern\'s animation; this `llms.txt` is the text-only index.');
  out.push('');

  for (const group of GROUP_ORDER) {
    const patterns = PATTERNS.filter(p => p.group === group);
    if (!patterns.length) continue;
    out.push(`## ${GROUP_NAMES[group]}`);
    out.push('');
    for (const p of patterns) {
      out.push(`- **${p.title}** (\`${p.id}\`) — ${patternSummary(p)}`);
    }
    out.push('');
  }

  out.push('## Full content');
  out.push('');
  out.push('- [/llms-full.txt](/llms-full.txt): every pattern in full markdown (mechanism, topology, timeline, variants, when-to-use, risks, example, code).');
  out.push('');

  out.push('## Source');
  out.push('');
  out.push('- [GitHub repository](https://github.com/fuergaosi233/multiagent-explorer)');
  out.push('');

  return new Response(out.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
