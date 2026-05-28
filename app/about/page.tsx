import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getSiteContent } from '@/lib/actions/content';
import { InlineText } from '@/components/edit-mode/InlineText';
import { InlineRichText } from '@/components/edit-mode/InlineRichText';
import { InlineImage } from '@/components/edit-mode/InlineImage';
import { SectionHead } from '@/components/shared/SectionHead';
import { CtaBand } from '@/components/shared/CtaBand';

export const dynamic = 'force-dynamic';

const KEYS = [
  // Hero
  'about_eyebrow', 'about_headline',
  'about_fact_founded_label', 'about_fact_founded_value',
  'about_fact_owner_label', 'about_fact_owner_value',
  'about_fact_crew_label', 'about_fact_crew_value',
  'about_fact_area_label', 'about_fact_area_value',
  'about_fact_featured_label', 'about_fact_featured_value',
  // Story
  'about_story_eyebrow', 'about_story_title', 'about_story_body',
  // Portrait band
  'about_portrait_image', 'about_portrait_label', 'about_portrait_name', 'about_portrait_bio',
  // Numbers
  'about_numbers_eyebrow', 'about_numbers_title',
  'about_num_1_value', 'about_num_1_label', 'about_num_1_desc',
  'about_num_2_value', 'about_num_2_label', 'about_num_2_desc',
  'about_num_3_value', 'about_num_3_label', 'about_num_3_desc',
  'about_num_4_value', 'about_num_4_label', 'about_num_4_desc',
  // Values
  'about_values_eyebrow', 'about_values_title',
  'about_value_1_title', 'about_value_1_body',
  'about_value_2_title', 'about_value_2_body',
  'about_value_3_title', 'about_value_3_body',
  'about_value_4_title', 'about_value_4_body',
  'about_value_5_title', 'about_value_5_body',
  // Timeline
  'about_timeline_eyebrow', 'about_timeline_title',
  'about_time_1_year', 'about_time_1_text',
  'about_time_2_year', 'about_time_2_text',
  'about_time_3_year', 'about_time_3_text',
  'about_time_4_year', 'about_time_4_text',
  'about_time_5_year', 'about_time_5_text',
  'about_time_6_year', 'about_time_6_text',
];

const D: Record<string, string> = {
  about_eyebrow: 'About · Owner-operated since 2004',
  about_headline: 'One call. One vision. Built by hand for two decades.',
  about_fact_founded_label: 'Founded', about_fact_founded_value: '2004 · Metro Detroit',
  about_fact_owner_label: 'Owner', about_fact_owner_value: 'Aaron Barris',
  about_fact_crew_label: 'Crew', about_fact_crew_value: '2 – 40+, scaled to event',
  about_fact_area_label: 'Service area', about_fact_area_value: 'Detroit · Midwest · National',
  about_fact_featured_label: 'Featured', about_fact_featured_value: 'PLSN · Mobile Beat · L&S America',
  about_story_eyebrow: 'Our story',
  about_story_title: 'It started with one DJ rig and a stubborn refusal to do a half job.',
  about_story_body: "Visionary Sound Productions is a full-service event production company headquartered in Commerce Township, Michigan. We've been at this since 2004 — long enough that many of our clients have been with us for more than a decade, and some have been with us since the beginning.\n\nWhen you call, text, or email, you'll speak directly with the owner. That's not a marketing line. It's how we've always run things — and the reason a wedding mother sends a thank-you about ceiling lights three weeks later, the reason a high school principal renews for the fourth year running.",
  about_portrait_image: '',
  about_portrait_label: 'The owner',
  about_portrait_name: 'Aaron Barris',
  about_portrait_bio: "Owner, lead designer, and the voice on the other end of the phone. Aaron has been designing lighting, sound, and stages for two decades — and has been featured in PLSN's Showtime section 25 times.",
  about_numbers_eyebrow: 'By the numbers',
  about_numbers_title: 'Twenty-two years, quietly measured.',
  about_num_1_value: '4,247', about_num_1_label: 'Events serviced since 2004',
  about_num_1_desc: 'From 60-person weddings to 1,500-student dances and stadium-scale productions.',
  about_num_2_value: '25', about_num_2_label: 'National publication features',
  about_num_2_desc: 'PLSN Showtime, Mobile Beat, Lighting & Sound America, Mitzvah Market, more.',
  about_num_3_value: '22', about_num_3_label: 'Years owner-operated',
  about_num_3_desc: 'Same name on the door since 2004. Same name answering the phone.',
  about_num_4_value: '10+', about_num_4_label: 'Average client tenure (years)',
  about_num_4_desc: "Schools, venues, and families who've been with us for a decade or longer.",
  about_values_eyebrow: 'What we believe',
  about_values_title: "Five things we won't compromise on.",
  about_value_1_title: 'Free advice is free.',
  about_value_1_body: "You'll never see a consultation charge. Whether or not we end up working together, you leave knowing more than you came with.",
  about_value_2_title: 'Fixed pricing — period.',
  about_value_2_body: 'If we said it\'s in, it\'s in. No day-of upcharges, no "oh, that\'s extra." The quote you sign is the bill you pay.',
  about_value_3_title: 'The owner answers.',
  about_value_3_body: "Your event isn't a ticket number. Every call, every text, every email goes to a person who can make decisions.",
  about_value_4_title: 'Touring-grade gear, every show.',
  about_value_4_body: "We rent the same equipment we'd use on a national tour. No B-rigs, no rentals from competitors, no excuses.",
  about_value_5_title: 'On site, on time, on point.',
  about_value_5_body: 'Our crew is dialed in before guests arrive. We stay through the last song. The room you imagined is the room we build.',
  about_timeline_eyebrow: 'Two decades, abbreviated',
  about_timeline_title: 'A short timeline.',
  about_time_1_year: '2004', about_time_1_text: 'Aaron founds VSP in Metro Detroit. First gig: a school dance.',
  about_time_2_year: '2008', about_time_2_text: 'First PLSN feature. Production scope expands to galas and corporate.',
  about_time_3_year: '2013', about_time_3_text: 'Ten-year mark. Many of our earliest clients are still with us — and still are today.',
  about_time_4_year: '2020', about_time_4_text: 'Drive-in commencements and FM-broadcast audio keep events alive through the pandemic.',
  about_time_5_year: '2024', about_time_5_text: '25th feature in PLSN. Major LED upgrade to Absen PL2.5 Plus panels.',
  about_time_6_year: '2026', about_time_6_text: 'Super Bowl 26 weekend in the books. Twenty-two years and still building.',
};

export default async function AboutPage() {
  const c = await getSiteContent(KEYS);
  const v = (k: string) => c[k] || D[k] || '';

  const facts = [
    { labelKey: 'about_fact_founded_label', valueKey: 'about_fact_founded_value' },
    { labelKey: 'about_fact_owner_label', valueKey: 'about_fact_owner_value' },
    { labelKey: 'about_fact_crew_label', valueKey: 'about_fact_crew_value' },
    { labelKey: 'about_fact_area_label', valueKey: 'about_fact_area_value' },
    { labelKey: 'about_fact_featured_label', valueKey: 'about_fact_featured_value' },
  ];
  const numbers = [1, 2, 3, 4].map((n) => ({
    valueKey: `about_num_${n}_value`,
    labelKey: `about_num_${n}_label`,
    descKey: `about_num_${n}_desc`,
  }));
  const values = [1, 2, 3, 4, 5].map((n) => ({
    titleKey: `about_value_${n}_title`,
    bodyKey: `about_value_${n}_body`,
    num: String(n).padStart(2, '0'),
  }));
  const timeline = [1, 2, 3, 4, 5, 6].map((n) => ({
    yearKey: `about_time_${n}_year`,
    textKey: `about_time_${n}_text`,
  }));

  return (
    <>
      <Header active="/about" />
      <main>
        {/* HERO */}
        <section className="border-b border-line">
          <div className="max-w-container mx-auto px-10 py-24">
            <InlineText contentKey="about_eyebrow" defaultValue={v('about_eyebrow')} tag="span"
              className="block text-xs uppercase tracking-[0.2em] text-ink-mute mb-6" revalidate="/about" />
            <InlineText contentKey="about_headline" defaultValue={v('about_headline')} tag="h1"
              className="font-serif italic font-normal text-[clamp(48px,7vw,96px)] leading-[0.98] tracking-tight max-w-5xl mb-14"
              multiline revalidate="/about" />
            <dl className="grid grid-cols-2 md:grid-cols-5 gap-8 border-t border-line pt-10">
              {facts.map((f) => (
                <div key={f.labelKey}>
                  <InlineText contentKey={f.labelKey} defaultValue={v(f.labelKey)} tag="span"
                    className="block text-xs uppercase tracking-wider text-ink-mute mb-2" revalidate="/about" />
                  <InlineText contentKey={f.valueKey} defaultValue={v(f.valueKey)} tag="div"
                    className="text-ink text-sm" revalidate="/about" multiline />
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* STORY */}
        <section className="border-b border-line">
          <div className="max-w-container mx-auto px-10 py-24 grid md:grid-cols-[1fr_2fr] gap-12">
            <InlineText contentKey="about_story_eyebrow" defaultValue={v('about_story_eyebrow')} tag="span"
              className="block text-xs uppercase tracking-[0.2em] text-ink-mute" revalidate="/about" />
            <div>
              <InlineText contentKey="about_story_title" defaultValue={v('about_story_title')} tag="h2"
                className="font-serif italic text-3xl md:text-4xl mb-8 leading-tight" multiline revalidate="/about" />
              <InlineRichText contentKey="about_story_body" defaultValue={v('about_story_body')}
                className="text-ink-dim text-lg leading-relaxed" revalidate="/about" />
            </div>
          </div>
        </section>

        {/* PORTRAIT BAND */}
        <section className="border-b border-line bg-bg-elev">
          <div className="max-w-container mx-auto px-10 py-24 grid md:grid-cols-[2fr_3fr] gap-12 items-center">
            <div className="relative aspect-[3/4] bg-bg">
              <InlineImage contentKey="about_portrait_image" defaultUrl={v('about_portrait_image')}
                storageFolder="about" alt="Aaron Barris" fill className="object-cover" revalidate="/about" />
            </div>
            <div>
              <InlineText contentKey="about_portrait_label" defaultValue={v('about_portrait_label')} tag="span"
                className="block text-xs uppercase tracking-[0.2em] text-ink-mute mb-4" revalidate="/about" />
              <InlineText contentKey="about_portrait_name" defaultValue={v('about_portrait_name')} tag="h2"
                className="font-serif italic text-4xl md:text-5xl mb-8 leading-tight" revalidate="/about" />
              <InlineRichText contentKey="about_portrait_bio" defaultValue={v('about_portrait_bio')}
                className="text-ink-dim text-lg leading-relaxed" revalidate="/about" />
            </div>
          </div>
        </section>

        {/* NUMBERS */}
        <section className="border-b border-line">
          <div className="max-w-container mx-auto px-10 py-24">
            <SectionHead eyebrow="By the numbers" title={
              <InlineText contentKey="about_numbers_title" defaultValue={v('about_numbers_title')} tag="span" revalidate="/about" />
            } className="mb-16" />
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
              {numbers.map((n) => (
                <div key={n.valueKey}>
                  <InlineText contentKey={n.valueKey} defaultValue={v(n.valueKey)} tag="div"
                    className="font-serif italic text-6xl text-amber leading-none mb-4" revalidate="/about" />
                  <InlineText contentKey={n.labelKey} defaultValue={v(n.labelKey)} tag="div"
                    className="text-ink font-medium mb-2" revalidate="/about" />
                  <InlineText contentKey={n.descKey} defaultValue={v(n.descKey)} tag="p"
                    className="text-ink-dim text-sm leading-relaxed" multiline revalidate="/about" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* VALUES */}
        <section className="border-b border-line bg-bg-elev">
          <div className="max-w-container mx-auto px-10 py-24">
            <SectionHead eyebrow="What we believe" title={
              <InlineText contentKey="about_values_title" defaultValue={v('about_values_title')} tag="span" revalidate="/about" />
            } className="mb-12" />
            <ol className="grid md:grid-cols-2 gap-x-12 gap-y-10">
              {values.map((val_) => (
                <li key={val_.num} className="grid grid-cols-[50px_1fr] gap-4">
                  <span className="font-serif italic text-3xl text-amber leading-none">{val_.num}</span>
                  <div>
                    <InlineText contentKey={val_.titleKey} defaultValue={v(val_.titleKey)} tag="h3"
                      className="font-serif italic text-xl mb-2 leading-snug" revalidate="/about" />
                    <InlineText contentKey={val_.bodyKey} defaultValue={v(val_.bodyKey)} tag="p"
                      className="text-ink-dim leading-relaxed" multiline revalidate="/about" />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* TIMELINE */}
        <section className="border-b border-line">
          <div className="max-w-container mx-auto px-10 py-24">
            <SectionHead eyebrow="Two decades, abbreviated" title={
              <InlineText contentKey="about_timeline_title" defaultValue={v('about_timeline_title')} tag="span" revalidate="/about" />
            } className="mb-16" />
            <ol className="border-t border-line">
              {timeline.map((t) => (
                <li key={t.yearKey} className="grid grid-cols-[80px_1fr] md:grid-cols-[120px_1fr] gap-6 md:gap-10 py-8 border-b border-line">
                  <InlineText contentKey={t.yearKey} defaultValue={v(t.yearKey)} tag="span"
                    className="font-serif italic text-3xl md:text-4xl text-amber leading-none" revalidate="/about" />
                  <InlineText contentKey={t.textKey} defaultValue={v(t.textKey)} tag="p"
                    className="text-ink-dim leading-relaxed self-center" multiline revalidate="/about" />
                </li>
              ))}
            </ol>
          </div>
        </section>

        <CtaBand title={<>Ready to start? <em>Tell us about your event.</em></>} />
      </main>
      <Footer />
    </>
  );
}
