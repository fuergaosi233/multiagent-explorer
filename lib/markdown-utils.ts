import GithubSlugger from 'github-slugger';

export interface Heading {
  id: string;
  label: string;
  level: 2 | 3;
}

/**
 * Pull the FIRST mermaid block out of the content (along with the optional
 * preceding `## Structure` heading). Returns the mermaid source and the
 * content with that block removed — used to lift the topology diagram
 * into a hero at the top of pattern pages without duplicating it inline.
 */
export function extractTopology(content: string): { mermaid: string | null; content: string } {
  const re = /(?:^##\s+Structure\s*\n+)?```mermaid\n([\s\S]*?)\n```\n*/m;
  const m = content.match(re);
  if (!m) return { mermaid: null, content };
  return {
    mermaid: m[1].trim(),
    content: content.replace(re, ''),
  };
}

/** Parse h2/h3 headings from markdown for the right-side TOC. */
export function extractHeadings(content: string): Heading[] {
  const slugger = new GithubSlugger();
  const out: Heading[] = [];
  // Strip fenced code blocks first so `## inside code` isn't mistaken for a heading.
  const sansCode = content.replace(/```[\s\S]*?```/g, '');
  const lines = sansCode.split('\n');
  for (const line of lines) {
    const m2 = line.match(/^##\s+(.+?)\s*$/);
    const m3 = line.match(/^###\s+(.+?)\s*$/);
    if (m2) {
      const label = m2[1].trim();
      out.push({ id: slugger.slug(label), label, level: 2 });
    } else if (m3) {
      const label = m3[1].trim();
      out.push({ id: slugger.slug(label), label, level: 3 });
    }
  }
  return out;
}

/** Pull the `**Category**: X` line from a pattern doc body. */
export function extractCategory(content: string): string | null {
  const m = content.match(/\*\*Category\*\*:\s*(.+)/);
  return m ? m[1].trim() : null;
}
