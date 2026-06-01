export type Space = 'tight' | 'normal' | 'loose';
export type Width = 'narrow' | 'normal' | 'wide';

export interface BlockStyle {
  sizeStep: number; // clamped to [-2, 2]; 0 = designed size
  space: Space;
  width: Width;
}

export const DEFAULT_BLOCK_STYLE: BlockStyle = {
  sizeStep: 0,
  space: 'normal',
  width: 'normal',
};

const SPACES: Space[] = ['tight', 'normal', 'loose'];
const WIDTHS: Width[] = ['narrow', 'normal', 'wide'];

const clampStep = (n: number) => Math.max(-2, Math.min(2, Math.round(n)));

export function parseList(value: string | undefined | null): string[] {
  if (!value) return [];
  return value
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function serializeList(items: string[]): string {
  return items.map((s) => s.trim()).filter((s) => s.length > 0).join('\n');
}

export function parseBlockStyle(value: string | undefined | null): BlockStyle {
  if (!value) return { ...DEFAULT_BLOCK_STYLE };
  let raw: unknown;
  try {
    raw = JSON.parse(value);
  } catch {
    return { ...DEFAULT_BLOCK_STYLE };
  }
  if (typeof raw !== 'object' || raw === null) return { ...DEFAULT_BLOCK_STYLE };
  const o = raw as Record<string, unknown>;
  return {
    sizeStep: typeof o.sizeStep === 'number' ? clampStep(o.sizeStep) : 0,
    space: SPACES.includes(o.space as Space) ? (o.space as Space) : 'normal',
    width: WIDTHS.includes(o.width as Width) ? (o.width as Width) : 'normal',
  };
}

export function serializeBlockStyle(style: BlockStyle): string {
  return JSON.stringify({
    sizeStep: clampStep(style.sizeStep),
    space: style.space,
    width: style.width,
  });
}

// Tailwind font-size scale, smallest -> largest.
export const TEXT_SCALE = [
  'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl',
  'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl',
  'text-7xl', 'text-8xl', 'text-9xl',
] as const;

type ScaleToken = (typeof TEXT_SCALE)[number];
const SIZE_SET = new Set<string>(TEXT_SCALE);

// Matches an optional responsive/state prefix (e.g. "md:") + a text-<size> token,
// but ONLY when <size> is a real font size (so text-ink-dim is left alone).
const SIZE_TOKEN_RE = /(^|\s)((?:[a-z-]+:)?)(text-(?:xs|sm|base|lg|xl|\dxl))(?=\s|$)/g;

export function shiftFontSize(className: string, step: number): string {
  if (!step) return className;
  return className.replace(SIZE_TOKEN_RE, (match, lead, prefix, sizeToken) => {
    if (!SIZE_SET.has(sizeToken)) return match;
    const idx = TEXT_SCALE.indexOf(sizeToken as ScaleToken);
    const next = TEXT_SCALE[Math.max(0, Math.min(TEXT_SCALE.length - 1, idx + step))];
    return `${lead}${prefix}${next}`;
  });
}

export const SPACE_CLASS: Record<Space, string> = {
  tight: 'my-2',
  normal: '', // designed default — add nothing
  loose: 'my-12',
};

export const WIDTH_CLASS: Record<Width, string> = {
  narrow: 'max-w-md',
  normal: '', // designed default — add nothing
  wide: 'max-w-4xl',
};

/**
 * The className to actually render for a block, given its base (designed) className
 * and the saved BlockStyle.
 * opts.heroClampMax: if set, caps the resulting *unprefixed* size token on small
 * screens via a `max-sm:` class, so big sizes don't crowd phones.
 */
export function applyBlockStyle(
  baseClassName: string,
  style: BlockStyle,
  opts: { heroClampMax?: string } = {},
): string {
  let cls = shiftFontSize(baseClassName, style.sizeStep);

  if (opts.heroClampMax) {
    const m = cls.match(/(^|\s)(text-(?:xs|sm|base|lg|xl|\dxl))(?=\s|$)/);
    if (m) {
      const current = m[2];
      const clampIdx = TEXT_SCALE.indexOf(opts.heroClampMax as ScaleToken);
      const currentIdx = TEXT_SCALE.indexOf(current as ScaleToken);
      if (clampIdx >= 0 && currentIdx > clampIdx) {
        cls += ` max-sm:${opts.heroClampMax}`;
      }
    }
  }

  const extra = [SPACE_CLASS[style.space], WIDTH_CLASS[style.width]].filter(Boolean).join(' ');
  return extra ? `${cls} ${extra}` : cls;
}

export function withStyleKeys(keys: string[]): string[] {
  return [...keys, ...keys.map((k) => `${k}__style`)];
}
