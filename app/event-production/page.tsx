import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getSiteContent } from '@/lib/actions/content';
import { InlineRichText } from '@/components/edit-mode/InlineRichText';
import { InlineText } from '@/components/edit-mode/InlineText';
import { InlineList } from '@/components/edit-mode/InlineList';
import { InlineImage } from '@/components/edit-mode/InlineImage';
import { StartProjectButton } from '@/components/shared/StartProjectButton';
import { withStyleKeys } from '@/lib/edit-mode/block-style';
import type { Metadata } from 'next';
import { getSeoSettings } from '@/lib/actions/seo';
import { getFaqsByPage } from '@/lib/actions/faqs';
import { FaqAccordion } from '@/components/public/FaqAccordion';
import { JsonLd } from '@/components/seo/JsonLd';
import { serviceSchema, faqSchema, breadcrumbSchema } from '@/lib/seo/schema';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function generateMetadata(): Promise<Metadata> {
  const row = await getSeoSettings('/event-production').catch(() => null);
  return {
    title: row?.meta_title ?? 'Event Production | Visionary Sound Productions',
    description: row?.meta_description ?? 'Full-scale event production for galas, concerts, and corporate events. Staging, lighting, sound, and video, owner-run across Metro Detroit since 2004.',
    alternates: { canonical: '/event-production' },
    openGraph: {
      images: row?.og_image_url ? [row.og_image_url] : [],
    },
  };
}

const SLUG = 'event-production';
const PREFIX = 'event_production';

const KEYS = [
  `${PREFIX}_hero_image`,
  `${PREFIX}_eyebrow`,
  `${PREFIX}_headline`,
  `${PREFIX}_subhead`,
  `${PREFIX}_body`,
  `${PREFIX}_selected_work_title`,
  `${PREFIX}_selected_work`,
];

const DEFAULTS: Record<string, string> = {
  event_production_hero_image: '',
  event_production_eyebrow: 'Event Production',
  event_production_headline: 'Full-stack production for the room everyone will remember.',
  event_production_subhead: 'Stage, lighting, sound, and video, all under one design lead.',
  event_production_body: [
    "We handle corporate galas, school assemblies and homecomings, nonprofit fundraisers, concerts, award nights, and brand activations. We scope, design, build, and run the whole production: stage, lighting, sound, and video, with one design lead, our own crew, and our own trucks.",
    "We've produced events at every scale since 2004. We design and run Fash Bash, the Detroit Institute of Arts' signature fashion gala, alongside Neiman Marcus. We produce the Grosse Pointe Academy's annual auction, commencements for the University of Michigan in Dearborn, and national brand activations for Mars at Super Bowl LIV through LX. Closer to home, schools like Brighton and Huron Valley bring us back year after year, including Brighton's 1,500-student 'Let's Glow Crazy' homecoming with full lighting, audio, rigging, and effects.",
    "Our design work has been featured in PLSN's Showtime section twenty-five times. We've also been trusted with high-security rooms, including communications support recognized by the White House Communications Agency for a U.S. Presidential visit to Michigan.",
    "Every production starts with a site survey and a plot, not a guess. We confirm power, rigging points, sightlines, and load-in access up front, build the lighting and audio design to the actual room, and carry backup on the gear that matters so a single failure never becomes the story. For multi-day or repeat events the design carries over, so each year builds on the last instead of starting from scratch.",
    "One owner-direct phone call gets you a fixed-price proposal with every line spelled out. No change-order games, no mystery fees. From there we handle load-in, programming, show-calling, and truck-out. Our team is on site, set, and dialed in before the first guest or student walks through the door, and we stay through the final cue and the strike.",
    "We own our inventory: line arrays, LED walls, moving lights, staging, and control surfaces. That lets us scale a crew of two to forty or more to fit the event instead of subcontracting it out. You get one accountable team, one consistent look, and one number to call when something has to change at 6 p.m. on show day.",
  ].join('\n\n'),
  event_production_selected_work_title: 'Selected work',
  event_production_selected_work: [
    'Detroit Institute of Arts (Fash Bash)',
    'Neiman Marcus',
    'Mars (Super Bowl LIV through LX)',
    'The Grosse Pointe Academy',
    'Brighton High School',
    'University of Michigan, Dearborn',
    "Detroit Children's Fund",
    'Huron Valley Schools',
  ].join('\n'),
};

export default async function Page() {
  const [c, faqs] = await Promise.all([
    getSiteContent(withStyleKeys(KEYS)),
    getFaqsByPage('corporate').catch(() => []), // 'corporate' is the FAQ page key for /event-production
  ]);
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: 'Event Production',
            description: DEFAULTS[`${PREFIX}_body`],
            path: `/${SLUG}`,
          }),
          faqSchema(faqs),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Event Production', path: `/${SLUG}` },
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
              styleValue={c[`${PREFIX}_eyebrow__style`]}
              revalidate={`/${SLUG}`}
            />
            <InlineRichText
              contentKey={`${PREFIX}_headline`}
              defaultValue={c[`${PREFIX}_headline`] || DEFAULTS[`${PREFIX}_headline`]}
              tag="h1"
              className="font-serif italic text-6xl mt-4 max-w-3xl leading-tight"
              styleValue={c[`${PREFIX}_headline__style`]}
              clampMobileSize="text-7xl"
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
            styleValue={c[`${PREFIX}_subhead__style`]}
            revalidate={`/${SLUG}`}
          />
          <InlineRichText
            contentKey={`${PREFIX}_body`}
            defaultValue={c[`${PREFIX}_body`] || DEFAULTS[`${PREFIX}_body`]}
            tag="div"
            className="text-ink-dim text-lg leading-relaxed whitespace-pre-wrap"
            styleValue={c[`${PREFIX}_body__style`]}
            revalidate={`/${SLUG}`}
          />
        </section>
        <section className="max-w-container mx-auto px-10 pb-12">
          <InlineText
            tag="p"
            contentKey={`${PREFIX}_selected_work_title`}
            defaultValue={c[`${PREFIX}_selected_work_title`] || DEFAULTS[`${PREFIX}_selected_work_title`]}
            className="text-xs uppercase tracking-[0.2em] text-ink-mute mb-6"
            revalidate={`/${SLUG}`}
          />
          <InlineList
            contentKey={`${PREFIX}_selected_work`}
            defaultValue={c[`${PREFIX}_selected_work`] || DEFAULTS[`${PREFIX}_selected_work`]}
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
