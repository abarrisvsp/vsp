import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getSiteContent } from '@/lib/actions/content';
import { InlineRichText } from '@/components/edit-mode/InlineRichText';
import { InlineImage } from '@/components/edit-mode/InlineImage';
import { StartProjectButton } from '@/components/shared/StartProjectButton';

export const dynamic = 'force-dynamic';

const SLUG = 'rentals';
const PREFIX = 'rentals';

const KEYS = [
  `${PREFIX}_hero_image`,
  `${PREFIX}_eyebrow`,
  `${PREFIX}_headline`,
  `${PREFIX}_subhead`,
  `${PREFIX}_body`,
];

const DEFAULTS: Record<string, string> = {
  rentals_hero_image: '',
  rentals_eyebrow: 'Rentals',
  rentals_headline: 'Touring-grade gear, delivered with options.',
  rentals_subhead: 'LED walls, line arrays, moving lights, staging, DJ-grade gear.',
  rentals_body:
    'Dry-hire of the same inventory we use on our own shows. We deliver, set up if you want, walk you through it, and pick it up. No surprises, no nickel-and-diming.',
};

export default async function Page() {
  const c = await getSiteContent(KEYS);
  return (
    <>
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
      </main>
      <Footer />
    </>
  );
}
