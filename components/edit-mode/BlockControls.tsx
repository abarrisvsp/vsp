'use client';
import type { BlockStyle, Space, Width } from '@/lib/edit-mode/block-style';

const SPACE_OPTS: Space[] = ['tight', 'normal', 'loose'];
const WIDTH_OPTS: Width[] = ['narrow', 'normal', 'wide'];

export function BlockControls({
  style,
  onChange,
}: {
  style: BlockStyle;
  onChange: (next: BlockStyle) => void;
}) {
  const set = (patch: Partial<BlockStyle>) => onChange({ ...style, ...patch });
  const atMin = style.sizeStep <= -2;
  const atMax = style.sizeStep >= 2;

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 border-t border-line bg-bg-elev text-ink-dim text-xs">
      <span className="uppercase tracking-wider text-ink-mute">Size</span>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => set({ sizeStep: style.sizeStep - 1 })}
        disabled={atMin}
        className="w-6 h-6 rounded bg-bg hover:bg-line disabled:opacity-40"
        title="Smaller"
      >
        −
      </button>
      <span className="w-6 text-center tabular-nums">
        {style.sizeStep > 0 ? `+${style.sizeStep}` : style.sizeStep}
      </span>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => set({ sizeStep: style.sizeStep + 1 })}
        disabled={atMax}
        className="w-6 h-6 rounded bg-bg hover:bg-line disabled:opacity-40"
        title="Bigger"
      >
        +
      </button>

      <span className="w-px h-5 bg-line mx-1" />

      <span className="uppercase tracking-wider text-ink-mute">Spacing</span>
      <select
        value={style.space}
        onMouseDown={(e) => e.stopPropagation()}
        onChange={(e) => set({ space: e.target.value as Space })}
        className="bg-bg border border-line rounded px-1 py-0.5"
      >
        {SPACE_OPTS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <span className="uppercase tracking-wider text-ink-mute">Width</span>
      <select
        value={style.width}
        onMouseDown={(e) => e.stopPropagation()}
        onChange={(e) => set({ width: e.target.value as Width })}
        className="bg-bg border border-line rounded px-1 py-0.5"
      >
        {WIDTH_OPTS.map((w) => (
          <option key={w} value={w}>{w}</option>
        ))}
      </select>
    </div>
  );
}
