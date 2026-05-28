import Link from 'next/link';
import { getPublishedFeaturedWork } from '@/lib/actions/featured-work';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const metadata: Metadata = {
  title: 'Portfolio | Visionary Sound Productions',
  description: 'Case studies from VSP events: weddings, corporate galas, mitzvahs, and more.',
  alternates: { canonical: '/portfolio' },
};

export default async function PortfolioPage() {
  const items = await getPublishedFeaturedWork();

  return (
    <>
      <Header active="/portfolio" />
      <main>
        <section className="max-w-container mx-auto px-10 py-20">
          <span className="text-xs uppercase tracking-[0.2em] text-ink-mute">Portfolio</span>
          <h1 className="font-serif italic text-5xl mt-2 mb-4">Featured work.</h1>
          <p className="text-ink-dim max-w-2xl mb-16">
            A selection of events we&apos;re proud to have been part of.
          </p>

          {items.length === 0 ? (
            <p className="text-ink-mute">No portfolio entries yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/portfolio/${item.slug}`}
                  className="group border border-line bg-bg-elev rounded overflow-hidden hover:border-brand transition-colors"
                >
                  {item.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.cover_image_url}
                      alt={item.headline}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-48 bg-bg-soft" />
                  )}
                  <div className="p-5">
                    <p className="text-xs text-ink-mute mb-1">
                      {item.event_type}
                      {item.event_date ? ` · ${new Date(item.event_date).getFullYear()}` : ''}
                      {item.guest_count ? ` · ${item.guest_count} guests` : ''}
                    </p>
                    <h2 className="font-serif italic text-lg text-ink group-hover:text-brand transition-colors">
                      {item.headline}
                    </h2>
                    {item.venue && (
                      <p className="text-xs text-ink-mute mt-1">{item.venue}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
