import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { GalleryUploader } from '@/components/gallery/GalleryUploader';
import { getGalleryPhotos } from '@/lib/actions/gallery';
import { auth } from '@/lib/auth';
import { CtaBand } from '@/components/shared/CtaBand';
import { MiniStats } from '@/components/shared/MiniStats';
import { InlineRichText } from '@/components/edit-mode/InlineRichText';
import { getSiteContent } from '@/lib/actions/content';
import type { Metadata } from 'next';
import { getSeoSettings } from '@/lib/actions/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const row = await getSeoSettings('/gallery').catch(() => null);
  return {
    title: row?.meta_title ?? 'Gallery | Visionary Sound Productions',
    description: row?.meta_description ?? 'Full-service event production — sound, lighting & DJ. NYC tri-state area.',
    openGraph: {
      images: row?.og_image_url ? [row.og_image_url] : [],
    },
  };
}

const HERO_KEYS = [
  'gallery_eyebrow', 'gallery_headline', 'gallery_lede',
  'gallery_stat_1_value', 'gallery_stat_1_label',
  'gallery_stat_2_value', 'gallery_stat_2_label',
  'gallery_stat_3_value', 'gallery_stat_3_label',
];

const HERO_DEFAULTS: Record<string, string> = {
  gallery_eyebrow: 'Work · 2004 → present',
  gallery_headline: 'Twenty years of rooms we made unforgettable.',
  gallery_lede: 'Schools, mitzvahs, weddings, corporate galas, concerts, drive-ins, and one Super Bowl weekend. Filter by event type or scroll the whole reel.',
  gallery_stat_1_value: '4,247', gallery_stat_1_label: 'Events',
  gallery_stat_2_value: '25', gallery_stat_2_label: 'National features',
  gallery_stat_3_value: '22', gallery_stat_3_label: 'Years on the road',
};

export default async function GalleryPage() {
  const [photos, session, c] = await Promise.all([
    getGalleryPhotos(),
    auth(),
    getSiteContent(HERO_KEYS),
  ]);
  const categories = Array.from(new Set(photos.map((p) => p.category)));

  const stats = [
    { value: c.gallery_stat_1_value || HERO_DEFAULTS.gallery_stat_1_value, label: c.gallery_stat_1_label || HERO_DEFAULTS.gallery_stat_1_label },
    { value: c.gallery_stat_2_value || HERO_DEFAULTS.gallery_stat_2_value, label: c.gallery_stat_2_label || HERO_DEFAULTS.gallery_stat_2_label },
    { value: c.gallery_stat_3_value || HERO_DEFAULTS.gallery_stat_3_value, label: c.gallery_stat_3_label || HERO_DEFAULTS.gallery_stat_3_label },
  ];

  return (
    <>
      <Header active="/gallery" />
      <main>
        {/* HERO */}
        <section className="border-b border-line">
          <div className="max-w-container mx-auto px-10 py-20">
            <InlineRichText inline
              contentKey="gallery_eyebrow"
              defaultValue={c.gallery_eyebrow || HERO_DEFAULTS.gallery_eyebrow}
              tag="span"
              className="block text-xs uppercase tracking-[0.2em] text-ink-mute mb-6"
              revalidate="/gallery"
            />
            <InlineRichText
              contentKey="gallery_headline"
              defaultValue={c.gallery_headline || HERO_DEFAULTS.gallery_headline}
              tag="h1"
              className="font-serif italic font-normal text-[clamp(48px,7vw,96px)] leading-[0.98] tracking-tight max-w-4xl"
              revalidate="/gallery"
            />
            <InlineRichText
              contentKey="gallery_lede"
              defaultValue={c.gallery_lede || HERO_DEFAULTS.gallery_lede}
              tag="p"
              className="text-ink-dim text-lg leading-relaxed max-w-2xl mt-6 mb-10"
              revalidate="/gallery"
            />
            <MiniStats stats={stats} />
          </div>
        </section>

        {/* GRID */}
        <section className="max-w-container mx-auto px-10 py-16">
          <GalleryGrid initial={photos} />
        </section>

        <CtaBand title={<>Like what you see? <em>Tell us about your event.</em></>} />
      </main>
      {session?.user?.isAdmin && <GalleryUploader categories={categories.length ? categories : ['general']} />}
      <Footer />
    </>
  );
}
