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
  const row = await getSeoSettings('/weddings').catch(() => null);
  return {
    title: row?.meta_title ?? 'Wedding DJ & AV | Visionary Sound Productions',
    description: row?.meta_description ?? 'Full-service event production — stage, lighting, sound & video. Metro Detroit · Nationwide. Since 2004.',
    alternates: { canonical: '/weddings' },
    openGraph: {
      images: row?.og_image_url ? [row.og_image_url] : [],
    },
  };
}

const SLUG = 'weddings';
const PREFIX = 'weddings';

const KEYS = [
  `${PREFIX}_hero_image`,
  `${PREFIX}_eyebrow`,
  `${PREFIX}_headline`,
  `${PREFIX}_subhead`,
  `${PREFIX}_body`,
];

const DEFAULTS: Record<string, string> = {
  weddings_hero_image: '',
  weddings_eyebrow: 'Weddings',
  weddings_headline: 'The warm amber glow our clients keep writing us about.',
  weddings_subhead: 'Lighting and sound that make the room feel like the night you imagined.',
  weddings_body: [
    "Your wedding happens once, with no rehearsal for the moment that matters. That's the standard we design to.",
    "Visionary Sound Productions has lit and powered weddings across Michigan since 2004 — from the Shinola Hotel and the Detroit Institute of Arts' Great Hall to country clubs in Grosse Pointe and lakeside tents up north in Bay Harbor. We don't start with a gear list. We start with how you want the room to feel, then build the design backward from there: warm amber uplighting that wraps the walls, a first-dance look that quietly finds just the two of you, pin spots that make every centerpiece glow, a monogram on the floor, and effects timed to the music when you want a moment to land. Sound is tuned to the room so the toasts carry to the back table and your band or DJ fills the floor without burying the conversation at the bar.",
    "A typical wedding covers both the ceremony and the reception: wireless mics so the officiant and the vows are heard cleanly, a sound system sized to the room instead of blasted at it, full uplighting in your colors, dance-floor lighting with optional haze so the beams actually read, and the moments that matter — first dance, parent dances, the grand exit — lit and cued on purpose. We coordinate directly with your planner and venue so power, load-in, and timeline are settled well before the day.",
    "From the first call to the last load-out, you work directly with the owner — not a salesperson, not a rotating account rep who has never seen your venue. We walk the space with you, build one fixed-price proposal with every line spelled out, and run the night with our own crew and our own gear. No day-of surprises, no add-ons that appear on the final invoice.",
    "It's the part clients write to us about afterward: 'Thank you for the beautiful lighting you provided for my daughter's wedding. Absolutely stunning.' — Pamela, Farmington Hills.",
    "Whether it's an intimate sixty-guest dinner or a three-hundred-person reception, the same owner-designed care goes into every room — and the same direct line to the person designing it.",
  ].join('\n\n'),
};

export default async function Page() {
  const [c, faqs] = await Promise.all([
    getSiteContent(KEYS),
    getFaqsByPage('weddings').catch(() => []),
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
        <section className="max-w-container mx-auto px-10 pb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-mute mb-6">Selected venues</p>
          <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3 text-ink-dim">
            {[
              'Shinola Hotel, Detroit',
              'Detroit Institute of Arts',
              'Woodward Ballroom, Detroit',
              'Grosse Pointe country clubs',
              'Bay Harbor & Northern Michigan',
              'Private estates & tented weddings',
            ].map((name) => (
              <li key={name} className="border-l border-line pl-3 leading-snug">{name}</li>
            ))}
          </ul>
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
