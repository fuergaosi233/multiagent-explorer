import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { getLocale } from './locale';

const EN_ROOT = path.join(process.cwd(), 'content', 'wiki');
const ZH_ROOT = path.join(process.cwd(), 'content', 'wiki-zh');

function getWikiRoot(locale?: string): string {
  return locale === 'zh' ? ZH_ROOT : EN_ROOT;
}

export interface WikiDoc {
  slug: string[];
  title: string;
  description?: string;
  content: string;
  href: string;
}

interface FrontMatter {
  title?: string;
  description?: string;
}

function readDoc(filePath: string, slug: string[]): WikiDoc | null {
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  const fm = data as FrontMatter;
  return {
    slug,
    title: fm.title ?? slug[slug.length - 1] ?? 'Untitled',
    description: fm.description,
    content,
    href: '/wiki' + (slug.length ? '/' + slug.join('/') : ''),
  };
}

/** Resolve a slug to its markdown file path; supports `foo.md` or `foo/index.md`. */
function resolveSlug(slug: string[], root: string): string | null {
  const base = path.join(root, ...slug);
  if (fs.existsSync(base + '.md')) return base + '.md';
  if (fs.existsSync(path.join(base, 'index.md'))) return path.join(base, 'index.md');
  return null;
}

export function loadDoc(slug: string[], locale?: string): WikiDoc | null {
  // Normalize: a trailing 'index' segment is the same as no segment
  const normalized = slug[slug.length - 1] === 'index' ? slug.slice(0, -1) : slug;
  const root = getWikiRoot(locale);
  const file = resolveSlug(normalized, root);
  if (!file) return null;
  return readDoc(file, normalized);
}

/** Walk the wiki dir and return every slug array (excluding folder-only entries). */
export function listAllSlugs(locale?: string): string[][] {
  const out: string[][] = [];
  const root = getWikiRoot(locale);
  function walk(dir: string, prefix: string[]) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath, [...prefix, entry.name]);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const base = entry.name.replace(/\.md$/, '');
        const slug = base === 'index' ? prefix : [...prefix, base];
        out.push(slug);
      }
    }
  }
  walk(root, []);
  return out;
}

/** Get just the frontmatter title for a slug — used for sidebar labels. */
export function getDocTitle(slug: string[], locale?: string): string | null {
  const doc = loadDoc(slug, locale);
  return doc?.title ?? null;
}
