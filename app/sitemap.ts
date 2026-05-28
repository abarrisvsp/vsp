import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/config';
import { getPublishedPosts } from '@/lib/actions/blog';
import { getPublishedFeaturedWork } from '@/lib/actions/featured-work';

// Static public routes, ordered by priority.
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/event-production', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/weddings', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/mitzvahs', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/av-installation', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/rentals', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/services', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/portfolio', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/gallery', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.7, changeFrequency: 'yearly' },
  { path: '/blog', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'yearly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const [posts, work] = await Promise.all([
    getPublishedPosts().catch(() => []),
    getPublishedFeaturedWork().catch(() => []),
  ]);

  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const workEntries: MetadataRoute.Sitemap = work.map((w) => ({
    url: `${SITE_URL}/portfolio/${w.slug}`,
    lastModified: w.updated_at ? new Date(w.updated_at) : now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticEntries, ...postEntries, ...workEntries];
}
