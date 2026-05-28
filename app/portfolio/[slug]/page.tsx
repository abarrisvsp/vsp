import { notFound } from 'next/navigation';
import { getFeaturedWorkBySlug } from '@/lib/actions/featured-work';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const dynamic = 'force-dynamic';

export default async function PortfolioDetailPage({ params }: { params: { slug: string } }) {
  const item = await getFeaturedWorkBySlug(params.slug);
  if (!item) notFound();

  return (
    <>
      <Header />
      <main className="max-w-container mx-auto px-10 py-16">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-mute mb-2">{item.event_type}</p>
        <h1 className="font-serif italic text-5xl mb-4">{item.headline}</h1>

        <div className="flex gap-6 text-sm text-ink-mute mb-10 flex-wrap">
          {item.venue && <span>📍 {item.venue}</span>}
          {item.event_date && <span>📅 {new Date(item.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>}
          {item.guest_count && <span>👥 {item.guest_count} guests</span>}
        </div>

        {item.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.cover_image_url}
            alt={item.headline}
            className="w-full max-h-[500px] object-cover rounded mb-12"
          />
        )}

        {item.body_html && (
          <article
            className="prose prose-invert max-w-3xl"
            dangerouslySetInnerHTML={{ __html: item.body_html }}
          />
        )}
      </main>
      <Footer />
    </>
  );
}
