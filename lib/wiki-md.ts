import { SITE_URL } from './site';
import { loadDoc, loadRawDoc, type WikiDoc } from './wiki';

export function pagePathForSlug(slug: string[]): string {
  return slug.length === 0 ? '/' : '/' + slug.join('/');
}

export function markdownPathForSlug(slug: string[]): string {
  const pagePath = pagePathForSlug(slug);
  return pagePath === '/' ? '/index.md' : `${pagePath}.md`;
}

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

export function loadCanonicalMarkdown(slug: string[]): string | null {
  return loadRawDoc(slug, 'en');
}

export function loadCanonicalDoc(slug: string[]): WikiDoc | null {
  return loadDoc(slug, 'en');
}

export function markdownResponse(markdown: string): Response {
  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      Vary: 'Accept',
    },
  });
}

