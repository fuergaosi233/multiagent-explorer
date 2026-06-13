import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  const host = new URL(SITE_URL).host;

  return {
    rules: [
      {
        userAgent: [
          'OAI-SearchBot',
          'Claude-SearchBot',
          'PerplexityBot',
          'ChatGPT-User',
          'Claude-User',
          'Perplexity-User',
          'Googlebot',
          'Bingbot',
        ],
        allow: '/',
      },
      {
        userAgent: [
          'GPTBot',
          'ClaudeBot',
          'Meta-ExternalAgent',
          'CCBot',
          'Google-Extended',
          'Applebot-Extended',
          'Bytespider',
        ],
        disallow: '/',
      },
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: SITE_URL + '/sitemap.xml',
    host,
  };
}
