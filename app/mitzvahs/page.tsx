import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getSiteContent } from '@/lib/actions/content';
import { InlineRichText } from '@/components/edit-mode/InlineRichText';
import { InlineImage } from '@/components/edit-mode/InlineImage';
import { StartProjectButton } from '@/components/shared/StartProjectButton';
import type { Metadata } from 'next';
import { getSeoSettings } from '@/lib/actions/seo';
import { getFaqsByPage } from '@/lib/actions/faqs';
import { FaqAccordion } from '@/components/public/FaqAccordion';
import { JsonLd } from '@/components/seo/JsonLd';
import { serviceSchema, faqSchema, breadcrumbSchema } from '@/lib/seo/schema';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const row = await getSeoSettings('/mitzvahs').catch(() => null);
  return {
    title: row?.meta_title ?? 'Bar & Bat Mitzvah DJ | Visionary Sound Productions',
    description: row?.meta_description ?? 'Full-service event production — stage, lighting, sound & video. Metro Detroit · Nationwide. Since 2004.',
    alternates: { canonical: '/mitzvahs' },
    openGraph: {
      images: row?.og_image_url ? [row.og_image_url] : [],
    },
  };
}

const SLUG = 'mitzvahs';
const PREFIX = 'mitzvahs';

const KEYS = [
  `${PREFIX}_hero_image`,
  `${PREFIX}_eyebrow`,
  `${PREFIX}_headline`,
  `${PREFIX}_subhead`,
  `${PREFIX}_body`,
];

const DEFAULTS: Record<string, string> = {
  mitzvahs_hero_image: '',
  mitzvahs_eyebrow: 'Mitzvahs',
  mitzvahs_headline: 'Personalized event design that brings their theme to life.',
  mitzvahs_subhead: 'From intimate to full production — your child, your concept, our craft.',
  mitzvahs_body:
    'We sit down with you and your kid to learn what they actually want. Then we design lighting, sound, staging, FX, and entertainment integration that makes the night unforgettable — without making it about us.',
};

export default async function Page() {
  const [c, faqs] = await Promise.all([
    getSiteContent(KEYS),
    getFaqsByPage('mitzvahs').catch(() => []),
  ]);
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: DEFAULTS[`${PREFIX}_eyebrow`],
            description: DEFAULTS[`${PREFIX}_body`],
            path: `/${SLUG}`,
          }),
          faqSchema(faqs),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: DEFAULTS[`${PREFIX}_eyebrow`], path: `/${SLUG}` },
          ]),
        ]}
      />
      <Header active={`/${SLUG}`} />
      <main>
        <section className="relative h-[60vh] flex items-end">
          <InlineImage
            contentKey={`${PREFIX}_hero_image`}
            defaultUrl={c[`${PREFIX}_hero_image`]}
            storageFolder={`services/${SLUG}`}
            alt={DEFAULTS[`${PREFIX}_headline`]}
            fill
            className="object-cover absolute inset-0"
            priority
            revalidate={`/${SLUG}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent pointer-events-none" />
          <div className="relative max-w-container mx-auto px-10 pb-16 w-full">
            <InlineRichText inline
              contentKey={`${PREFIX}_eyebrow`}
              defaultValue={c[`${PREFIX}_eyebrow`] || DEFAULTS[`${PREFIX}_eyebrow`]}
              tag="span"
              className="text-xs uppercase tracking-[0.2em] text-ink-mute"
              revalidate={`/${SLUG}`}
            />
            <InlineRichText
              contentKey={`${PREFIX}_headline`}
              defaultValue={c[`${PREFIX}_headline`] || DEFAULTS[`${PREFIX}_headline`]}
              tag="h1"
              className="font-serif italic text-6xl mt-4 max-w-3xl leading-tight"
              revalidate={`/${SLUG}`}
            />
          </div>
        </section>
        <section className="max-w-container mx-auto px-10 py-24 grid md:grid-cols-[1fr_2fr] gap-16">
          <InlineRichText
            contentKey={`${PREFIX}_subhead`}
            defaultValue={c[`${PREFIX}_subhead`] || DEFAULTS[`${PREFIX}_subhead`]}
            tag="h2"
            className="font-serif italic text-3xl"
            revalidate={`/${SLUG}`}
          />
          <InlineRichText
            contentKey={`${PREFIX}_body`}
            defaultValue={c[`${PREFIX}_body`] || DEFAULTS[`${PREFIX}_body`]}
            tag="div"
            className="text-ink-dim text-lg leading-relaxed whitespace-pre-wrap"
            revalidate={`/${SLUG}`}
          />
        </section>
        <section className="max-w-container mx-auto px-10 pb-24">
          <StartProjectButton label="Talk about your project" />
        </section>
        {faqs.length > 0 && (
          <section className="max-w-container mx-auto px-10 py-16 border-t border-line">
            <h2 className="font-serif italic text-3xl mb-8">Frequently asked questions</h2>
            <FaqAccordion faqs={faqs} />
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
