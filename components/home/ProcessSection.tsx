import { SectionHead } from '@/components/shared/SectionHead';
import { getSiteContent } from '@/lib/actions/content';
import { InlineRichText } from '@/components/edit-mode/InlineRichText';

const DEFAULTS = {
  process_step_1_title: 'Talk it through — free.',
  process_step_1_body:
    "Tell us about the event. We'll listen, ask questions, and tell you what you actually need (and what you don't). No consultation charge, ever.",
  process_step_2_title: 'Fixed-price proposal.',
  process_step_2_body:
    "You get a written quote with everything spelled out. No surprises, no day-of upcharges. If we say it's in, it's in.",
  process_step_3_title: 'We show up early and make it work.',
  process_step_3_body:
    'Our crew is on site, set, and dialed before guests arrive. We stay through the last song. You enjoy the event.',
};

export async function ProcessSection() {
  const c = await getSiteContent([
    'process_step_1_title',
    'process_step_1_body',
    'process_step_2_title',
    'process_step_2_body',
    'process_step_3_title',
    'process_step_3_body',
  ]);
  const steps = [1, 2, 3].map((n) => ({
    num: String(n).padStart(2, '0'),
    title:
      c[`process_step_${n}_title`] ||
      DEFAULTS[`process_step_${n}_title` as keyof typeof DEFAULTS],
    body:
      c[`process_step_${n}_body`] ||
      DEFAULTS[`process_step_${n}_body` as keyof typeof DEFAULTS],
    titleKey: `process_step_${n}_title`,
    bodyKey: `process_step_${n}_body`,
  }));

  return (
    <section className="max-w-container mx-auto px-10 py-24">
      <SectionHead
        eyebrow="04 / How we work"
        title={<>Three calls. <em>That&rsquo;s usually it.</em></>}
        className="mb-12"
      />
      <ol className="border-t border-line">
        {steps.map((s) => (
          <li
            key={s.num}
            className="grid grid-cols-[80px_1fr] md:grid-cols-[120px_1fr] gap-6 md:gap-10 py-10 border-b border-line"
          >
            <span className="font-serif italic text-5xl md:text-6xl text-brand leading-none">
              {s.num}
            </span>
            <div>
              <InlineRichText inline
                contentKey={s.titleKey}
                defaultValue={s.title}
                tag="h3"
                className="font-serif italic text-2xl md:text-3xl mb-3 leading-tight"
                revalidate="/"
              />
              <InlineRichText
                contentKey={s.bodyKey}
                defaultValue={s.body}
                tag="p"
                className="text-ink-dim leading-relaxed max-w-2xl"
                revalidate="/"
              />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
