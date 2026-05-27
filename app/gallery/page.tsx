import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { GalleryUploader } from '@/components/gallery/GalleryUploader';
import { getGalleryPhotos } from '@/lib/actions/gallery';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function GalleryPage() {
  const photos = await getGalleryPhotos();
  const session = await auth();
  const categories = Array.from(new Set(photos.map((p) => p.category)));

  return (
    <>
      <Header active="/gallery" />
      <main className="max-w-container mx-auto px-10 py-16">
        <div className="mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-ink-mute">Gallery</span>
          <h1 className="font-serif italic text-6xl mt-2">The work.</h1>
        </div>
        <GalleryGrid initial={photos} />
      </main>
      {session?.user?.isAdmin && <GalleryUploader categories={categories.length ? categories : ['general']} />}
      <Footer />
    </>
  );
}
