import type { Pattern, PatternEdge, PatternNode, PatternGroup } from '@/types/pattern';

export const GROUP_NAMES: Record<PatternGroup, string> = {
  centralized: 'Centralized Control',
  flow: 'Flow',
  dialog: 'Dialog',
  decision: 'Decision',
  decentral: 'Decentralized / Protocol',
};

export const GROUP_ORDER: PatternGroup[] = [
  'centralized', 'flow', 'dialog', 'decision', 'decentral',
];

function stripHtml(s: string | undefined): string {
  if (!s) return '';
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function nodeLine(n: PatternNode): string {
  const role = n.sub ? ` _(${n.sub})_` : '';
  const kind = n.kind && n.kind !== 'plain' ? ` [${n.kind}]` : '';
  return `- \`${n.id}\` — ${n.label}${role}${kind}`;
}

function edgeLine(e: PatternEdge): string {
  const arrow = e.dashed ? '⇢' : '→';
  const label = e.label ? ` — ${e.label}` : '';
  return `- \`${e.from}\` ${arrow} \`${e.to}\`${label}`;
}

export function patternToMarkdown(p: Pattern): string {
  const out: string[] = [];

  out.push(`## ${p.title}`);
  if (p.titleEn) out.push(`*${p.titleEn}*`);
  out.push('');
  out.push(`**ID:** \`${p.id}\` · **Group:** ${p.grpLabel} · **#${p.num}**`);
  out.push('');
  out.push(`**Aliases:** ${p.aliases}`);
  out.push('');

  out.push('### Mechanism');
  out.push(stripHtml(p.mechanism));
  out.push('');

  out.push('### Topology');
  out.push('');
  out.push('**Nodes**');
  for (const n of p.nodes) out.push(nodeLine(n));
  out.push('');
  out.push('**Edges**');
  for (const e of Object.values(p.edges)) out.push(edgeLine(e));
  out.push('');

  out.push('### Timeline');
  p.timeline.forEach((step, i) => {
    out.push(`${i + 1}. ${stripHtml(step.caption)}`);
  });
  out.push('');

  if (p.variants && p.variants.length > 1) {
    out.push('### Variants');
    for (const v of p.variants) {
      out.push('');
      out.push(`#### ${v.label}${v.sub ? ` — _${v.sub}_` : ''}`);
      if (v.timeline) {
        v.timeline.forEach((step, i) => {
          out.push(`${i + 1}. ${stripHtml(step.caption)}`);
        });
      } else {
        out.push('_(uses the default timeline above)_');
      }
    }
    out.push('');
  }

  out.push('### When to use');
  out.push(stripHtml(p.fit));
  out.push('');

  out.push('### Risks');
  out.push(stripHtml(p.risks));
  out.push('');

  out.push(`### Example — ${p.example.tag}`);
  out.push(stripHtml(p.example.body));
  out.push('');

  if (p.code) {
    out.push(`### Code (${p.code.lang})`);
    out.push('```' + p.code.lang);
    out.push(stripHtml(p.code.snippet));
    out.push('```');
    out.push('');
  }

  return out.join('\n');
}

export function patternSummary(p: Pattern): string {
  return stripHtml(p.mechanism);
}
