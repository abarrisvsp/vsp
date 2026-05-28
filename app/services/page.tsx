import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getSiteContent } from '@/lib/actions/content';
import { InlineRichText } from '@/components/edit-mode/InlineRichText';
import { InlineImage } from '@/components/edit-mode/InlineImage';
import { CtaBand } from '@/components/shared/CtaBand';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const HERO_KEYS = ['services_idx_eyebrow', 'services_idx_headline', 'services_idx_lede'];

const HERO_DEFAULTS: Record<string, string> = {
  services_idx_eyebrow: 'What we do',
  services_idx_headline:
    'Production from napkin sketch to load-out, and every piece in between.',
  services_idx_lede:
    "Six core practices. One owner-operated team. Pick a thread, or call us for something we haven't listed. We've almost certainly built it before.",
};

type Service = {
  num: string;
  slug: string;
  titleKey: string;
  titleDefault: string;
  descKey: string;
  descDefault: string;
  bullets: string[];
  bulletsKey: string;
  linkLabel: string;
  imageKey: string;
  imageCaption: string;
  imageCaptionKey: string;
};

const SERVICES: Service[] = [
  {
    num: '01',
    slug: 'event-production',
    titleKey: 'services_idx_01_title',
    titleDefault: 'Production',
    descKey: 'services_idx_01_desc',
    descDefault:
      'Event production. Full-stack design, stage, lighting, sound, video, and crew for corporate, school, nonprofit, and private events. We scope it, design it, build it, run it, strike it.',
    bullets: [
      'Lighting design & programming',
      'Concert-grade sound systems',
      'Staging, any size, indoor or outdoor',
      'LED video walls & image projection',
      'Live event streaming',
      'Crew, rigging, electrical, comms',
    ],
    bulletsKey: 'services_idx_01_bullets',
    linkLabel: 'See event production',
    imageKey: 'services_idx_01_image',
    imageCaption: 'Corporate gala with full LED wall and immersive lighting',
    imageCaptionKey: 'services_idx_01_image_caption',
  },
  {
    num: '02',
    slug: 'weddings',
    titleKey: 'services_idx_02_title',
    titleDefault: 'Weddings',
    descKey: 'services_idx_02_desc',
    descDefault:
      'Weddings. The mood lives in the lighting. We design ceilings that glow, dance floors that pull people in, and sound systems that disappear, so the toast lands and the first dance feels like the first dance.',
    bullets: [
      'Warm uplighting & ceiling washes',
      'Custom monogram gobos',
      'Dance-floor lighting & effects',
      'Ceremony & reception sound',
      'Outdoor & tented options',
      'On-site coordination with your planner',
    ],
    bulletsKey: 'services_idx_02_bullets',
    linkLabel: 'See weddings',
    imageKey: 'services_idx_02_image',
    imageCaption: 'Wedding · amber-washed ceiling',
    imageCaptionKey: 'services_idx_02_image_caption',
  },
  {
    num: '03',
    slug: 'mitzvahs',
    titleKey: 'services_idx_03_title',
    titleDefault: 'Mitzvahs',
    descKey: 'services_idx_03_desc',
    descDefault:
      'Mitzvahs. Personalized event design that brings their theme to life. We design everything, from intimate to full production. Custom invites, signage, dance-floor wraps, centerpieces with brains, monograms, and the kind of energy a 13-year-old remembers forever.',
    bullets: [
      'Theme & décor lighting',
      'Custom dance-floor wraps',
      'Centerpiece & table lighting',
      'Performance artists & dancers',
      'Sound, video, & FX',
      'Custom monograms & signage',
    ],
    bulletsKey: 'services_idx_03_bullets',
    linkLabel: 'See mitzvahs',
    imageKey: 'services_idx_03_image',
    imageCaption: 'Mitzvah · custom monogram + dance floor wrap',
    imageCaptionKey: 'services_idx_03_image_caption',
  },
  {
    num: '04',
    slug: 'av-installation',
    titleKey: 'services_idx_04_title',
    titleDefault: 'AV Installation',
    descKey: 'services_idx_04_desc',
    descDefault:
      'AV installation. Permanent lighting, audio, and video systems for venues, theaters, schools, ballrooms, and houses of worship. We design, install, commission, and service it. One contractor, one warranty, one number to call.',
    bullets: [
      'Permanent line-array & distributed audio',
      'Stage & house lighting design',
      'LED video walls & projection',
      'Control systems & staff training',
      'Service contracts & upgrades',
      'Network & low-voltage infrastructure',
    ],
    bulletsKey: 'services_idx_04_bullets',
    linkLabel: 'See AV installation',
    imageKey: 'services_idx_04_image',
    imageCaption: 'AV installation · house of worship',
    imageCaptionKey: 'services_idx_04_image_caption',
  },
  {
    num: '05',
    slug: 'rentals',
    titleKey: 'services_idx_05_title',
    titleDefault: 'Rentals',
    descKey: 'services_idx_05_desc',
    descDefault:
      "Rentals. Dry-hire of the same gear we use ourselves: LED walls, line arrays, moving lights, staging, and DJ-grade systems. Delivered with options, or with crew if you'd rather not run it yourself.",
    bullets: [
      'Absen PL2.5 Plus LED panels',
      'Concert-grade line arrays & monitors',
      'Moving lights, washes & beams',
      'Indoor & outdoor staging',
      'DJ-grade systems & controllers',
      'Delivery, setup, & strike available',
    ],
    bulletsKey: 'services_idx_05_bullets',
    linkLabel: 'See rentals',
    imageKey: 'services_idx_05_image',
    imageCaption: 'Touring-grade rentals · delivered with options',
    imageCaptionKey: 'services_idx_05_image_caption',
  },
  {
    num: '06',
    slug: 'event-production#design',
    titleKey: 'services_idx_06_title',
    titleDefault: 'Design & Advisory',
    descKey: 'services_idx_06_desc',
    descDefault:
      "Design & advisory. Not sure where to start? Free consultation. We'll scope it, sketch it, and tell you what you actually need, and what you don't. No charge to talk it through, ever.",
    bullets: [
      'Free initial consultation',
      'Concept & lighting sketches',
      'Vendor coordination & spec review',
      'Budget guidance, no upsells',
      'Site survey & load planning',
      "Honest answers about what you don't need",
    ],
    bulletsKey: 'services_idx_06_bullets',
    linkLabel: 'See design & advisory',
    imageKey: 'services_idx_06_image',
    imageCaption: 'Design & advisory · scoping the build before a single light goes up',
    imageCaptionKey: 'services_idx_06_image_caption',
  },
];

export default async function ServicesIndexPage() {
  const serviceKeys = SERVICES.flatMap((s) => [
    s.titleKey,
    s.descKey,
    s.bulletsKey,
    s.imageKey,
    s.imageCaptionKey,
  ]);
  const c = await getSiteContent([...HERO_KEYS, ...serviceKeys]);

  return (
    <>
      <Header active="/services" />
      <main>
        {/* HERO */}
        <section className="border-b border-line">
          <div className="max-w-container mx-auto px-10 py-24">
            <InlineRichText inline
              contentKey="services_idx_eyebrow"
              defaultValue={c.services_idx_eyebrow || HERO_DEFAULTS.services_idx_eyebrow}
              tag="span"
              className="block text-xs uppercase tracking-[0.2em] text-ink-mute mb-6"
              revalidate="/services"
            />
            <InlineRichText
              contentKey="services_idx_headline"
              defaultValue={c.services_idx_headline || HERO_DEFAULTS.services_idx_headline}
              tag="h1"
              className="font-serif italic font-normal text-[clamp(48px,7vw,96px)] leading-[0.98] tracking-tight max-w-5xl"
              revalidate="/services"
            />
            <InlineRichText
              contentKey="services_idx_lede"
              defaultValue={c.services_idx_lede || HERO_DEFAULTS.services_idx_lede}
              tag="p"
              className="text-ink-dim text-lg leading-relaxed max-w-2xl mt-8"
              revalidate="/services"
            />
          </div>
        </section>

        {/* SERVICE STACK */}
        <section className="border-b border-line">
          <div className="max-w-container mx-auto px-10">
            {SERVICES.map((s, i) => {
              const isReversed = i % 2 === 1;
              return (
                <div
                  key={s.num}
                  className={`grid md:grid-cols-2 gap-12 lg:gap-16 py-20 border-b border-line last:border-b-0 items-center ${
                    isReversed ? 'md:[&>*:first-child]:order-2' : ''
                  }`}
                >
                  <div>
                    <span className="font-serif italic text-6xl md:text-7xl text-brand leading-none block mb-6">
                      {s.num}
                    </span>
                    <InlineRichText inline
                      contentKey={s.titleKey}
                      defaultValue={c[s.titleKey] || s.titleDefault}
                      tag="h2"
                      className="font-serif italic text-4xl md:text-5xl mb-6 leading-tight"
                      revalidate="/services"
                    />
                    <InlineRichText
                      contentKey={s.descKey}
                      defaultValue={c[s.descKey] || s.descDefault}
                      tag="p"
                      className="text-ink-dim leading-relaxed mb-6"
                      revalidate="/services"
                    />
                    <InlineRichText
                      contentKey={s.bulletsKey}
                      defaultValue={
                        c[s.bulletsKey] || s.bullets.map((b) => `· ${b}`).join('\n')
                      }
                      tag="div"
                      className="text-ink-dim leading-loose whitespace-pre-line mb-8"
                      revalidate="/services"
                    />
                    <Link
                      href={`/${s.slug}`}
                      className="text-brand hover:text-ink text-sm border-b border-brand/40 hover:border-ink pb-0.5"
                    >
                      {s.linkLabel} →
                    </Link>
                  </div>
                  <figure className="space-y-3">
                    <div className="relative aspect-[4/3] bg-bg-elev">
                      <InlineImage
                        contentKey={s.imageKey}
                        defaultUrl={c[s.imageKey]}
                        storageFolder={`services-idx/${s.slug}`}
                        alt={s.imageCaption}
                        fill
                        className="object-cover"
                        revalidate="/services"
                      />
                    </div>
                    <figcaption>
                      <InlineRichText inline
                        contentKey={s.imageCaptionKey}
                        defaultValue={c[s.imageCaptionKey] || s.imageCaption}
                        tag="span"
                        className="block text-xs uppercase tracking-wider text-ink-mute"
                        revalidate="/services"
                      />
                    </figcaption>
                  </figure>
                </div>
              );
            })}
          </div>
        </section>

        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
