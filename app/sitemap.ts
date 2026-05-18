import type { MetadataRoute } from 'next';
import { listAllSlugs } from '@/lib/wiki';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = listAllSlugs();
  return slugs.map(slug => {
    const path = slug.length === 0 ? '/' : '/' + slug.join('/');
    return {
      url: SITE_URL + (path === '/' ? '' : path),
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority:
        slug.length === 0 ? 1
        : slug[0] === 'patterns' ? 0.8
        : 0.6,
    };
  });
}
