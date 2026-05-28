import Link from 'next/link';
import { getAllFeaturedWork } from '@/lib/actions/featured-work';
import { FeaturedWorkList } from '@/components/admin/FeaturedWorkList';

export const dynamic = 'force-dynamic';

export default async function FeaturedWorkPage() {
  const items = await getAllFeaturedWork().catch(() => []);
  return (
    <div className="px-8 py-10 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif italic text-4xl mb-1">Featured Work</h1>
          <p className="text-ink-mute text-sm">Case studies shown on the /portfolio page.</p>
        </div>
        <Link
          href="/admin/featured-work/new"
          className="bg-amber text-bg text-sm font-medium px-4 py-2 rounded hover:opacity-90"
        >
          + Add Case Study
        </Link>
      </div>
      <FeaturedWorkList initialItems={items} />
    </div>
  );
}
