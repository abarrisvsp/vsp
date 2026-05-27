import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getSiteContent } from '@/lib/actions/content';
import { InlineText } from '@/components/edit-mode/InlineText';
import { InlineImage } from '@/components/edit-mode/InlineImage';

export const dynamic = 'force-dynamic';

const KEYS = [
  'about_eyebrow',
  'about_headline',
  'about_subhead',
  'about_body',
  'about_image',
];

const DEFAULTS: Record<string, string> = {
  about_eyebrow: 'About',
  about_headline: 'One person picks up the phone. That person also designs your show.',
  about_subhead: 'Owner-operated since 2004.',
  about_body: `VSP is Aaron Barris. After 22 years in the room, I still design every show, run every site visit, and answer every call.

When you hire us, you get one point of contact — the owner — from the first sketch to the last truck out. No junior reps, no white-labeling, no call centers.

We work nationally but we live in Metro Detroit. The team is small on purpose: senior designers, senior crew, senior trucks. That's how we keep the work as good as it is.`,
  about_image: '',
};

export default async function AboutPage() {
  const c = await getSiteContent(KEYS);
  return (
    <>
      <Header active="/about" />
      <main className="max-w-container mx-auto px-10 py-24 grid md:grid-cols-2 gap-16">
        <div>
          <InlineText
            contentKey="about_eyebrow"
            defaultValue={c.about_eyebrow || DEFAULTS.about_eyebrow}
            tag="span"
            className="text-xs uppercase tracking-[0.2em] text-ink-mute"
            revalidate="/about"
          />
          <InlineText
            contentKey="about_headline"
            defaultValue={c.about_headline || DEFAULTS.about_headline}
            tag="h1"
            className="font-serif italic text-5xl mt-4 mb-6 leading-tight"
            multiline
            revalidate="/about"
          />
          <InlineText
            contentKey="about_subhead"
            defaultValue={c.about_subhead || DEFAULTS.about_subhead}
            tag="p"
            className="text-ink-dim text-lg mb-6"
            multiline
            revalidate="/about"
          />
          <InlineText
            contentKey="about_body"
            defaultValue={c.about_body || DEFAULTS.about_body}
            tag="div"
            className="text-ink-dim leading-relaxed whitespace-pre-wrap"
            multiline
            revalidate="/about"
          />
        </div>
        <div className="relative aspect-[3/4]">
          <InlineImage
            contentKey="about_image"
            defaultUrl={c.about_image}
            storageFolder="about"
            alt="Aaron Barris"
            fill
            className="object-cover"
            revalidate="/about"
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
