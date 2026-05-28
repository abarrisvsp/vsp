import { notFound } from 'next/navigation';
import { getFeaturedWorkById } from '@/lib/actions/featured-work';
import { FeaturedWorkEditor } from '@/components/admin/FeaturedWorkEditor';

export const dynamic = 'force-dynamic';

export default async function EditFeaturedWorkPage({ params }: { params: { id: string } }) {
  const item = await getFeaturedWorkById(params.id);
  if (!item) notFound();
  return (
    <div className="px-8 py-10 max-w-5xl">
      <h1 className="font-serif italic text-4xl mb-8">Edit Case Study</h1>
      <FeaturedWorkEditor initial={item} />
    </div>
  );
}
