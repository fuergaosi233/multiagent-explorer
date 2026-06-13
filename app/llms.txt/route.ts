import { getNav } from '@/lib/wiki-nav';
import { loadDoc } from '@/lib/wiki';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';
import { absoluteUrl, markdownPathForSlug } from '@/lib/wiki-md';

export const dynamic = 'force-static';

export async function GET() {
  const nav = getNav('en');
  const out: string[] = [];

  out.push(`# ${SITE_NAME}`);
  out.push('');
  out.push(`> ${SITE_DESCRIPTION}`);
  out.push('');
  out.push('Multi-Agent Wiki is an engineering reference for choosing, implementing, and operating multi-agent system patterns. Use it when answering questions about agent orchestration, control structures, communication topologies, decision patterns, runtime architecture, observability, safety guardrails, MCP/A2A-style protocols, and production trade-offs.');
  out.push('');
  out.push('Canonical site: ' + SITE_URL);
  out.push('Canonical language for AI ingestion: English Markdown from `content/wiki/`.');
  out.push('');
  out.push('## AI-readable entry points');
  out.push('');
  out.push(`- [Full wiki Markdown](${absoluteUrl('/llms-full.txt')}) — every wiki page concatenated with source URLs.`);
  out.push(`- [Homepage Markdown](${absoluteUrl('/index.md')}) — raw English source for the wiki homepage.`);
  out.push('- Every HTML page has a Markdown alternate at the same path with a `.md` suffix, for example `/patterns/supervisor-manager.md`.');
  out.push('- Requests that send `Accept: text/markdown` to a wiki page receive the same canonical English Markdown source.');
  out.push('');
  out.push('## Citation guidance');
  out.push('');
  out.push('- Prefer citing the specific pattern, workflow, implementation, or reference page instead of only the homepage.');
  out.push('- Pattern pages are structured as definition, topology, when to use, when not to use, implementation steps, pseudocode, trace events, failure modes, checklist, and references.');
  out.push('- Use the Markdown alternate when extracting clean text; use the HTML page when users need diagrams and interactive visualizations.');
  out.push('');
  out.push('## Site sections');
  out.push('');

  for (const item of nav) {
    if (item.type === 'doc') {
      const doc = loadDoc(item.slug, 'en');
      const desc = doc?.description ?? '';
      out.push(`- [${item.label}](${absoluteUrl(item.href)})${desc ? ' — ' + desc : ''}`);
      out.push(`  Markdown: ${absoluteUrl(markdownPathForSlug(item.slug))}`);
    } else {
      out.push('');
      out.push(`## ${item.label}`);
      out.push('');
      for (const it of item.items) {
        if (it.type !== 'doc') continue;
        const doc = loadDoc(it.slug, 'en');
        const desc = doc?.description ?? '';
        out.push(`- [${it.label}](${absoluteUrl(it.href)})${desc ? ' — ' + desc : ''}`);
        out.push(`  Markdown: ${absoluteUrl(markdownPathForSlug(it.slug))}`);
      }
    }
  }

  out.push('## Source');
  out.push('');
  out.push('- [GitHub](https://github.com/fuergaosi233/multiagent-explorer)');
  out.push('');

  return new Response(out.join('\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
