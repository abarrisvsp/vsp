import { getSiteContent } from '@/lib/actions/content';
import { InlineText } from '@/components/edit-mode/InlineText';

export async function StatsSection() {
  const c = await getSiteContent([
    'stat_1_value', 'stat_1_label',
    'stat_2_value', 'stat_2_label',
    'stat_3_value', 'stat_3_label',
    'stat_4_value', 'stat_4_label',
  ]);
  const stats = [1, 2, 3, 4].map((n) => ({
    value: c[`stat_${n}_value`],
    label: c[`stat_${n}_label`],
    valueKey: `stat_${n}_value`,
    labelKey: `stat_${n}_label`,
  }));

  return (
    <section className="bg-bg-elev py-24">
      <div className="max-w-container mx-auto px-10 grid md:grid-cols-4 gap-8 text-center">
        {stats.map((s) => (
          <div key={s.valueKey}>
            <InlineText
              contentKey={s.valueKey}
              defaultValue={s.value}
              tag="div"
              className="font-serif italic text-[clamp(56px,7vw,96px)] leading-none mb-3 text-amber"
              revalidate="/"
            />
            <InlineText
              contentKey={s.labelKey}
              defaultValue={s.label}
              tag="div"
              className="text-xs uppercase tracking-wider text-ink-dim"
              revalidate="/"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
