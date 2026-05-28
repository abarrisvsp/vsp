// app/admin/seo/page.tsx
import { getAllSeoSettings } from '@/lib/actions/seo';
import { SeoEditor } from '@/components/admin/SeoEditor';

export const dynamic = 'force-dynamic';

const PUBLIC_ROUTES = [
  { label: 'Home', route: '/' },
  { label: 'Weddings', route: '/weddings' },
  { label: 'Event Production', route: '/event-production' },
  { label: 'Mitzvahs', route: '/mitzvahs' },
  { label: 'AV Installation', route: '/av-installation' },
  { label: 'Rentals', route: '/rentals' },
  { label: 'Gallery', route: '/gallery' },
  { label: 'Blog', route: '/blog' },
  { label: 'About', route: '/about' },
  { label: 'Contact', route: '/contact' },
];

export default async function SeoPage() {
  const allSettings = await getAllSeoSettings().catch(() => []);
  const settingsMap = Object.fromEntries(allSettings.map((s) => [s.route, s]));

  return (
    <div className="px-8 py-10 max-w-5xl">
      <h1 className="font-serif italic text-4xl mb-1">SEO</h1>
      <p className="text-ink-mute text-sm mb-8">
        Edit meta title, description, and share image for each page.
      </p>
      <SeoEditor routes={PUBLIC_ROUTES} settingsMap={settingsMap} />
    </div>
  );
}
