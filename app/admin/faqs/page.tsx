// app/admin/faqs/page.tsx
import { getAllFaqsByPage } from '@/lib/actions/faqs';
import { FaqManager } from '@/components/admin/FaqManager';

export const dynamic = 'force-dynamic';

const PAGES = [
  { key: 'general', label: 'General' },
  { key: 'weddings', label: 'Weddings' },
  { key: 'corporate', label: 'Corporate' },
  { key: 'mitzvahs', label: 'Mitzvahs' },
  { key: 'av-installation', label: 'AV Installation' },
  { key: 'rentals', label: 'Rentals' },
];

export default async function FaqsPage() {
  // Fetch all pages in parallel
  const results = await Promise.all(PAGES.map((p) => getAllFaqsByPage(p.key).catch(() => [])));
  const initialData = Object.fromEntries(PAGES.map((p, i) => [p.key, results[i]]));

  return (
    <div className="px-8 py-10 max-w-3xl">
      <h1 className="font-serif italic text-4xl mb-1">FAQs</h1>
      <p className="text-ink-mute text-sm mb-8">
        Separate FAQ lists per service page. Drag to reorder within each tab.
      </p>
      <FaqManager pages={PAGES} initialData={initialData} />
    </div>
  );
}
