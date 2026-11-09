import { InlineRichText } from '@/components/edit-mode/InlineRichText';

export type MiniStat = { value: string; label: string; valueKey: string; labelKey: string };

export function MiniStats({
  stats,
  revalidate,
  className = '',
}: {
  stats: MiniStat[];
  revalidate: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-end gap-x-12 gap-y-6 ${className}`}>
      {stats.map((s) => (
        <div key={s.valueKey}>
          <InlineRichText inline
            contentKey={s.valueKey}
            defaultValue={s.value}
            tag="div"
            className="font-serif italic text-4xl md:text-5xl leading-none text-brand"
            revalidate={revalidate}
          />
          <InlineRichText inline
            contentKey={s.labelKey}
            defaultValue={s.label}
            tag="div"
            className="text-xs uppercase tracking-wider text-ink-mute mt-2"
            revalidate={revalidate}
          />
        </div>
      ))}
    </div>
  );
}
