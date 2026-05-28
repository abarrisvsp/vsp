export type MiniStat = { value: string; label: string };

export function MiniStats({ stats, className = '' }: { stats: MiniStat[]; className?: string }) {
  return (
    <div className={`flex flex-wrap items-end gap-x-12 gap-y-6 ${className}`}>
      {stats.map((s, i) => (
        <div key={i}>
          <div className="font-serif italic text-4xl md:text-5xl leading-none text-brand">{s.value}</div>
          <div className="text-xs uppercase tracking-wider text-ink-mute mt-2">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
