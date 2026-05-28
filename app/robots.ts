import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/config';

const PRIVATE_PATHS = ['/admin', '/api/', '/login', '/unsubscribe'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // AI *search* crawlers that can cite the site — explicitly allowed.
      {
        userAgent: ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-Web', 'PerplexityBot'],
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      // AI *training-only* crawlers — blocked (content can be cited, not trained on).
      {
        userAgent: ['CCBot', 'anthropic-ai', 'Google-Extended', 'cohere-ai', 'Bytespider'],
        disallow: '/',
      },
      // Everyone else (Googlebot, Bingbot, etc.).
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
