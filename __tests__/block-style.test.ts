// __tests__/block-style.test.ts
import { describe, it, expect } from 'vitest';
import {
  parseList,
  serializeList,
  parseBlockStyle,
  serializeBlockStyle,
  DEFAULT_BLOCK_STYLE,
  shiftFontSize,
  applyBlockStyle,
  withStyleKeys,
} from '@/lib/edit-mode/block-style';

describe('parseList / serializeList', () => {
  it('splits on newlines and trims, dropping empties', () => {
    expect(parseList('A\n  B \n\n C\n')).toEqual(['A', 'B', 'C']);
  });
  it('round-trips', () => {
    expect(parseList(serializeList(['A', 'B']))).toEqual(['A', 'B']);
  });
  it('empty string -> empty array', () => {
    expect(parseList('')).toEqual([]);
  });
});

describe('parseBlockStyle', () => {
  it('empty/undefined -> defaults', () => {
    expect(parseBlockStyle('')).toEqual(DEFAULT_BLOCK_STYLE);
    expect(parseBlockStyle(undefined)).toEqual(DEFAULT_BLOCK_STYLE);
  });
  it('malformed JSON -> defaults', () => {
    expect(parseBlockStyle('{not json')).toEqual(DEFAULT_BLOCK_STYLE);
  });
  it('clamps sizeStep to [-2, 2]', () => {
    expect(parseBlockStyle('{"sizeStep":9}').sizeStep).toBe(2);
    expect(parseBlockStyle('{"sizeStep":-9}').sizeStep).toBe(-2);
  });
  it('rejects unknown space/width per-field', () => {
    const s = parseBlockStyle('{"space":"huge","width":"wide"}');
    expect(s.space).toBe('normal');
    expect(s.width).toBe('wide');
  });
  it('round-trips via serializeBlockStyle', () => {
    const s = { sizeStep: 1, space: 'loose' as const, width: 'narrow' as const };
    expect(parseBlockStyle(serializeBlockStyle(s))).toEqual(s);
  });
});

describe('shiftFontSize', () => {
  it('step 0 returns className unchanged', () => {
    expect(shiftFontSize('font-serif text-6xl mt-4', 0)).toBe('font-serif text-6xl mt-4');
  });
  it('shifts a plain text size up', () => {
    expect(shiftFontSize('text-lg', 1)).toBe('text-xl');
    expect(shiftFontSize('text-lg', 2)).toBe('text-2xl');
  });
  it('shifts down', () => {
    expect(shiftFontSize('text-6xl', -1)).toBe('text-5xl');
  });
  it('clamps at the top of the scale', () => {
    expect(shiftFontSize('text-9xl', 2)).toBe('text-9xl');
  });
  it('clamps at the bottom of the scale', () => {
    expect(shiftFontSize('text-xs', -2)).toBe('text-xs');
  });
  it('preserves responsive prefixes and shifts each token', () => {
    expect(shiftFontSize('text-3xl md:text-6xl', 1)).toBe('text-4xl md:text-7xl');
  });
  it('leaves non-size text-* classes (e.g. colors) alone', () => {
    expect(shiftFontSize('text-ink-dim text-lg', 1)).toBe('text-ink-dim text-xl');
  });
});

describe('applyBlockStyle', () => {
  it('adds nothing for the default style', () => {
    expect(applyBlockStyle('text-lg', DEFAULT_BLOCK_STYLE)).toBe('text-lg');
  });
  it('shifts size and appends space + width classes', () => {
    const out = applyBlockStyle('text-lg', { sizeStep: 1, space: 'loose', width: 'wide' });
    expect(out).toContain('text-xl');
    expect(out).toContain('my-12');
    expect(out).toContain('max-w-4xl');
  });
  it('mobile clamp caps the largest unprefixed token on small screens', () => {
    const out = applyBlockStyle(
      'text-6xl',
      { sizeStep: 2, space: 'normal', width: 'normal' },
      { heroClampMax: 'text-7xl' },
    );
    expect(out).toContain('text-8xl'); // desktop shift target (6xl + 2)
    expect(out).toContain('max-sm:text-7xl'); // mobile clamp
  });
  it('mobile clamp does nothing when the size is already below the cap', () => {
    const out = applyBlockStyle(
      'text-3xl',
      { sizeStep: 1, space: 'normal', width: 'normal' },
      { heroClampMax: 'text-7xl' },
    );
    expect(out).not.toContain('max-sm:');
  });
});

describe('withStyleKeys', () => {
  it('appends __style companions', () => {
    expect(withStyleKeys(['a', 'b'])).toEqual(['a', 'b', 'a__style', 'b__style']);
  });
});
