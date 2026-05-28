// app/admin/media/page.tsx
import { getMediaFiles } from '@/lib/actions/media';
import { MediaLibrary } from '@/components/admin/MediaLibrary';

export const dynamic = 'force-dynamic';

export default async function MediaPage() {
  const files = await getMediaFiles().catch(() => []);
  return (
    <div className="px-8 py-10">
      <h1 className="font-serif italic text-4xl mb-1">Media Library</h1>
      <p className="text-ink-mute text-sm mb-8">All images in your Supabase storage bucket.</p>
      <MediaLibrary initialFiles={files} />
    </div>
  );
}
