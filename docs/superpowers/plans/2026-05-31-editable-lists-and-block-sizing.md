# Editable "Selected Work" Lists + Block Sizing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the site owner edit the hardcoded "Selected work" / "Selected venues" lists (add/remove/edit/reorder), and give every editable text block preset Size / Spacing / Width controls in edit mode — with nothing resized by default.

**Architecture:** Build on the existing `site_content` key→value table and the `updateSiteContent` server action. Sizing rides on a companion key `<contentKey>__style` holding tiny JSON, applied server-side so it shows to all visitors. Pure logic (font-size token shifting, style/list parsing) lives in a framework-free helper module unit-tested with Vitest; the React editing UI is verified in the live preview.

**Tech Stack:** Next.js 14 (App Router, RSC), React 18, TypeScript, Tailwind CSS v3, Tiptap 3 (existing rich-text editor), Vitest (already configured: jsdom, `globals: true`, `@`→repo-root alias, tests in `__tests__/`, run via `npm run test:run`). `lucide-react` is already a dependency.

**Spec:** `docs/superpowers/specs/2026-05-31-editable-lists-and-block-sizing-design.md`

---

## File Structure

**Create:**
- `lib/edit-mode/block-style.ts` — pure helpers + types: `BlockStyle`, `Space`, `Width`, `DEFAULT_BLOCK_STYLE`, `TEXT_SCALE`, `shiftFontSize`, `parseBlockStyle`, `serializeBlockStyle`, `SPACE_CLASS`, `WIDTH_CLASS`, `applyBlockStyle`, `withStyleKeys`, `parseList`, `serializeList`.
- `__tests__/block-style.test.ts` — Vitest unit tests for the above.
- `components/edit-mode/BlockControls.tsx` — shared edit-mode control group (Size −/+, Spacing, Width).
- `components/edit-mode/InlineList.tsx` — editable list component.

**Modify:**
- `components/edit-mode/InlineText.tsx` — accept `styleValue` + `clampMobileSize`, apply block style, render `BlockControls`, save style key.
- `components/edit-mode/InlineRichText.tsx` — same.
- `app/event-production/page.tsx` — `InlineList` for the list + editable heading; `withStyleKeys`; pass `styleValue` to inline blocks.
- `app/weddings/page.tsx` — same (heading "Selected venues").
- `app/rentals/page.tsx`, `app/mitzvahs/page.tsx`, `app/av-installation/page.tsx` — sizing rollout + convert any existing hardcoded list (verbatim).

**Data keys introduced** (all in existing `site_content`):
- Lists: `event_production_selected_work`, `event_production_selected_work_title`, `weddings_selected_venues`, `weddings_selected_venues_title` (+ analogous `<prefix>_selected_work` / `<prefix>_selected_work_title` for the other pages **if** they have a list).
- Styles: `<contentKey>__style` for any block we enable sizing on.

---

## Task 1: `block-style.ts` types + list parse/serialize (TDD)

**Files:**
- Create: `lib/edit-mode/block-style.ts`
- Create: `__tests__/block-style.test.ts`

- [ ] **Step 1: Write failing tests for list + style parsing**

Create `__tests__/block-style.test.ts`:
```ts
// __tests__/block-style.test.ts
import { describe, it, expect } from 'vitest';
import {
  parseList,
  serializeList,
  parseBlockStyle,
  serializeBlockStyle,
  DEFAULT_BLOCK_STYLE,
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
```

- [ ] **Step 2: Run tests, verify they fail**

Run: `npm run test:run -- block-style`
Expected: FAIL — cannot resolve `@/lib/edit-mode/block-style` (module not created yet).

- [ ] **Step 3: Implement the types + parsers**

Create `lib/edit-mode/block-style.ts`:
```ts
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
```

- [ ] **Step 4: Run tests, verify they pass**

Run: `npm run test:run -- block-style`
Expected: PASS (all cases in this file).

- [ ] **Step 5: Commit**

```bash
git add lib/edit-mode/block-style.ts __tests__/block-style.test.ts
git commit -m "feat(edit): block-style types + list/style parsers"
```

---

## Task 2: `shiftFontSize` + `applyBlockStyle` + `withStyleKeys` (TDD)

**Files:**
- Modify: `lib/edit-mode/block-style.ts`
- Modify: `__tests__/block-style.test.ts`

- [ ] **Step 1: Append failing tests**

Add to `__tests__/block-style.test.ts`:
```ts
import { shiftFontSize, applyBlockStyle, withStyleKeys } from '@/lib/edit-mode/block-style';

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
```

- [ ] **Step 2: Run tests, verify the new ones fail**

Run: `npm run test:run -- block-style`
Expected: FAIL — `shiftFontSize` / `applyBlockStyle` / `withStyleKeys` not exported.

- [ ] **Step 3: Implement**

Append to `lib/edit-mode/block-style.ts`:
```ts
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
```

- [ ] **Step 4: Run tests, verify all pass**

Run: `npm run test:run -- block-style`
Expected: PASS (entire file).

- [ ] **Step 5: Commit**

```bash
git add lib/edit-mode/block-style.ts __tests__/block-style.test.ts
git commit -m "feat(edit): font-size shifting + applyBlockStyle + withStyleKeys"
```

---

## Task 3: `BlockControls` shared UI component

**Files:**
- Create: `components/edit-mode/BlockControls.tsx`

Presentational only: takes the current `BlockStyle` + an `onChange`, renders Size −/+, Spacing, Width. Both inline editors reuse it.

- [ ] **Step 1: Create the component**

```tsx
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
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors from `BlockControls.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/edit-mode/BlockControls.tsx
git commit -m "feat(edit): BlockControls (size/spacing/width) UI"
```

---

## Task 4: Wire block sizing into `InlineRichText`

**Files:**
- Modify: `components/edit-mode/InlineRichText.tsx`

Add optional `styleValue` + `clampMobileSize` props, apply the saved style to the **display** className only (the editing surface keeps the raw className so it stays stable), render `BlockControls` in the editor panel, and persist the style JSON on Save alongside content.

- [ ] **Step 1: Add imports + props**

Merge `useMemo` into the existing `react` import (line 2 currently imports `useState, useEffect, useCallback`). Then add after the existing imports:
```tsx
import {
  parseBlockStyle,
  serializeBlockStyle,
  applyBlockStyle,
  type BlockStyle,
} from '@/lib/edit-mode/block-style';
import { BlockControls } from './BlockControls';
```

In `InlineRichTextProps`, add:
```tsx
  /** JSON from `${contentKey}__style`; controls size/spacing/width. */
  styleValue?: string;
  /** Cap the rendered size on small screens (e.g. 'text-7xl' for hero headlines). */
  clampMobileSize?: string;
```

Add the two new params to the destructured function signature (default `styleValue` and `clampMobileSize` to `undefined`).

- [ ] **Step 2: Style state + derived className**

After the existing `html` state/effect block, add:
```tsx
  const [style, setStyle] = useState<BlockStyle>(() => parseBlockStyle(styleValue));
  useEffect(() => {
    if (!editing) setStyle(parseBlockStyle(styleValue));
  }, [styleValue, editing]);

  const styledClassName = useMemo(
    () => applyBlockStyle(className, style, { heroClampMax: clampMobileSize }),
    [className, style, clampMobileSize],
  );
```

Change the display wrapper class (currently
`const wrapperClass = \`inline-rich-display ${inline ? 'inline-rich-inline' : ''} ${className}\`.trim();`)
to use `styledClassName`:
```tsx
  const wrapperClass = `inline-rich-display ${inline ? 'inline-rich-inline' : ''} ${styledClassName}`.trim();
```
Leave the Tiptap `editorProps.attributes.class` and the `<EditorContent ... className={`p-3 ${className}`} />` using the raw `className`.

- [ ] **Step 3: Persist style on Save**

Replace `handleSave` with:
```tsx
  const handleSave = useCallback(async () => {
    if (!editor) return;
    let next = editor.getHTML();
    if (inline) next = stripOuterParagraph(next);
    const contentChanged = !(next === html || next === stripOuterParagraph(html));
    const savedStyle = parseBlockStyle(styleValue);
    const styleChanged = serializeBlockStyle(style) !== serializeBlockStyle(savedStyle);
    if (!contentChanged && !styleChanged) {
      exitEdit();
      return;
    }
    setSaving(true);
    try {
      if (contentChanged) {
        await updateSiteContent(contentKey, next, revalidate);
        setHtml(inline ? toHtml(next, true) : next);
      }
      if (styleChanged) {
        await updateSiteContent(`${contentKey}__style`, serializeBlockStyle(style), revalidate);
      }
      toast.success('Saved');
      exitEdit();
    } catch (e) {
      console.error(e);
      toast.error('Save failed — try again');
    } finally {
      setSaving(false);
    }
  }, [editor, inline, html, contentKey, revalidate, exitEdit, style, styleValue]);
```

Update `handleCancel` to also reset style:
```tsx
  const handleCancel = useCallback(() => {
    if (editor) editor.commands.setContent(html || '<p></p>', { emitUpdate: false });
    setStyle(parseBlockStyle(styleValue));
    exitEdit();
  }, [editor, html, exitEdit, styleValue]);
```

- [ ] **Step 4: Render `BlockControls` in the editor panel**

In the editing-mode JSX, insert `BlockControls` between `<EditorContent .../>` and the Save/Cancel footer `<span>`:
```tsx
      <EditorContent editor={editor} className={`p-3 ${className}`} />
      <BlockControls style={style} onChange={setStyle} />
      <span className="flex items-center justify-end gap-2 border-t border-line p-2 bg-bg-elev rounded-b">
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add components/edit-mode/InlineRichText.tsx
git commit -m "feat(edit): block sizing controls in InlineRichText"
```

---

## Task 5: Wire block sizing into `InlineText`

**Files:**
- Modify: `components/edit-mode/InlineText.tsx`

Mirror Task 4 for the plain-text editor. Add `BlockControls` to its actions popover and style the display element.

- [ ] **Step 1: Add imports + props**

Merge `useMemo` into the existing `react` import (line 2: `useRef, useState, useCallback, useEffect`). Add after existing imports:
```tsx
import {
  parseBlockStyle,
  serializeBlockStyle,
  applyBlockStyle,
  type BlockStyle,
} from '@/lib/edit-mode/block-style';
import { BlockControls } from './BlockControls';
```

In `InlineTextProps`, add:
```tsx
  styleValue?: string;
  clampMobileSize?: string;
```
Add both to the destructured signature (default `undefined`).

- [ ] **Step 2: Style state + display className**

After the existing `value` state, add:
```tsx
  const [style, setStyle] = useState<BlockStyle>(() => parseBlockStyle(styleValue));
  useEffect(() => {
    if (!editing) setStyle(parseBlockStyle(styleValue));
  }, [styleValue, editing]);
  const styledClassName = useMemo(
    () => applyBlockStyle(className, style, { heroClampMax: clampMobileSize }),
    [className, style, clampMobileSize],
  );
```

In the non-admin / non-edit-mode branch, render with `styledClassName`:
```tsx
  if (!isAdmin || !editMode) {
    const Tag = tag as keyof JSX.IntrinsicElements;
    return <Tag className={styledClassName}>{value}</Tag>;
  }
```

- [ ] **Step 3: Persist style on Save**

Replace `handleSave` with:
```tsx
  const handleSave = useCallback(async () => {
    const newValue = (ref.current ? extractPlainText(ref.current) : value).trim();
    const contentChanged = newValue !== originalRef.current;
    const savedStyle = parseBlockStyle(styleValue);
    const styleChanged = serializeBlockStyle(style) !== serializeBlockStyle(savedStyle);
    if (!contentChanged && !styleChanged) {
      exitEdit();
      return;
    }
    setSaving(true);
    try {
      if (contentChanged) {
        await updateSiteContent(contentKey, newValue, revalidate);
        setValue(newValue);
        originalRef.current = newValue;
      }
      if (styleChanged) {
        await updateSiteContent(`${contentKey}__style`, serializeBlockStyle(style), revalidate);
      }
      toast.success('Saved');
      exitEdit();
    } catch (e) {
      console.error(e);
      toast.error('Save failed — try again');
    } finally {
      setSaving(false);
    }
  }, [contentKey, value, revalidate, exitEdit, style, styleValue]);
```

Update `handleCancel` to also reset style:
```tsx
  const handleCancel = useCallback(() => {
    if (ref.current) ref.current.textContent = originalRef.current;
    setValue(originalRef.current);
    setStyle(parseBlockStyle(styleValue));
    exitEdit();
  }, [exitEdit, styleValue]);
```

- [ ] **Step 4: Render `BlockControls` in the actions popover**

The actions popover is currently a flex **row** of Save/Cancel. Change it to a column and add `BlockControls` above the buttons. Replace the opening of the `{editing && (...)}` block's `<span data-inline-text-actions ...>` with:
```tsx
        <span
          data-inline-text-actions
          className="absolute left-0 top-full mt-1 flex flex-col gap-1 z-[10000] bg-bg-elev border border-line rounded shadow-lg p-1 max-md:fixed max-md:left-0 max-md:right-0 max-md:bottom-0 max-md:top-auto max-md:rounded-none max-md:mt-0 max-md:p-3"
          contentEditable={false}
        >
          <BlockControls style={style} onChange={setStyle} />
          <span className="flex gap-1 justify-end">
```
and add a matching closing `</span>` after the existing Cancel button (so the Save+Cancel buttons are wrapped in the inner row `<span>`).

Note: the existing `onBlur` handler cancels when focus leaves but ignores focus moving into `[data-inline-text-actions]`; `BlockControls` lives inside that wrapper, so interacting with it won't trigger a cancel. Verify in preview (Task 8).

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add components/edit-mode/InlineText.tsx
git commit -m "feat(edit): block sizing controls in InlineText"
```

---

## Task 6: `InlineList` editable list component

**Files:**
- Create: `components/edit-mode/InlineList.tsx`

Renders the same `<ul>`/`<li>` grid for visitors. In edit mode (admin), each item is an editable input with ✕ remove and ↑ ↓ reorder, plus ＋ Add, and a single Save/Cancel. Saves the whole list as a newline string to `contentKey`.

- [ ] **Step 1: Create the component**

```tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useEditMode } from './EditModeProvider';
import { updateSiteContent } from '@/lib/actions/content';
import { parseList, serializeList } from '@/lib/edit-mode/block-style';
import { toast } from 'sonner';
import { Plus, X, ChevronUp, ChevronDown, Pencil } from 'lucide-react';

interface InlineListProps {
  contentKey: string;
  defaultValue: string; // newline-separated
  revalidate?: string;
  ulClassName?: string;
  liClassName?: string;
}

export function InlineList({
  contentKey,
  defaultValue,
  revalidate,
  ulClassName = 'grid sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3 text-ink-dim',
  liClassName = 'border-l border-line pl-3 leading-snug',
}: InlineListProps) {
  const { editMode, isAdmin, setIsEditing: setGlobalEditing } = useEditMode();
  const [items, setItems] = useState<string[]>(() => parseList(defaultValue));
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) setItems(parseList(defaultValue));
  }, [defaultValue, editing]);

  const enterEdit = useCallback(() => {
    if (!editMode || editing) return;
    setEditing(true);
    setGlobalEditing(true);
  }, [editMode, editing, setGlobalEditing]);

  const exitEdit = useCallback(() => {
    setEditing(false);
    setGlobalEditing(false);
  }, [setGlobalEditing]);

  const handleCancel = useCallback(() => {
    setItems(parseList(defaultValue));
    exitEdit();
  }, [defaultValue, exitEdit]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await updateSiteContent(contentKey, serializeList(items), revalidate);
      toast.success('Saved');
      exitEdit();
    } catch (e) {
      console.error(e);
      toast.error('Save failed — try again');
    } finally {
      setSaving(false);
    }
  }, [contentKey, items, revalidate, exitEdit]);

  const setItem = (i: number, v: string) =>
    setItems((arr) => arr.map((x, idx) => (idx === i ? v : x)));
  const removeItem = (i: number) => setItems((arr) => arr.filter((_, idx) => idx !== i));
  const addItem = () => setItems((arr) => [...arr, '']);
  const move = (i: number, dir: -1 | 1) =>
    setItems((arr) => {
      const j = i + dir;
      if (j < 0 || j >= arr.length) return arr;
      const copy = [...arr];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  // Visitor / non-edit render
  if (!isAdmin || !editMode) {
    return (
      <ul className={ulClassName}>
        {items.map((name, i) => (
          <li key={`${name}-${i}`} className={liClassName}>{name}</li>
        ))}
      </ul>
    );
  }

  if (!editing) {
    return (
      <div className="relative group">
        <ul className={`${ulClassName} rounded outline-1 outline-dashed outline-brand outline-offset-4`}>
          {items.map((name, i) => (
            <li key={`${name}-${i}`} className={liClassName}>{name}</li>
          ))}
        </ul>
        <button
          type="button"
          onClick={enterEdit}
          className="absolute -top-2 -right-2 bg-brand text-white text-[10px] px-1.5 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10"
        >
          <Pencil className="w-3 h-3" /> Edit list
        </button>
      </div>
    );
  }

  return (
    <div className="border border-brand rounded bg-bg shadow-lg p-3">
      <ul className="flex flex-col gap-2">
        {items.map((name, i) => (
          <li key={i} className="flex items-center gap-2">
            <input
              value={name}
              onChange={(e) => setItem(i, e.target.value)}
              className="flex-1 bg-bg-elev border border-line rounded px-2 py-1 text-sm text-ink"
              placeholder="Name…"
            />
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} title="Move up" className="p-1 rounded hover:bg-line disabled:opacity-30">
              <ChevronUp className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} title="Move down" className="p-1 rounded hover:bg-line disabled:opacity-30">
              <ChevronDown className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => removeItem(i)} title="Remove" className="p-1 rounded hover:bg-line text-brand">
              <X className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={addItem} className="mt-2 flex items-center gap-1 text-xs text-ink-dim hover:text-ink">
        <Plus className="w-3.5 h-3.5" /> Add
      </button>
      <div className="flex items-center justify-end gap-2 border-t border-line mt-3 pt-2">
        <button type="button" onClick={handleSave} disabled={saving} className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-500 disabled:opacity-50">
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={handleCancel} disabled={saving} className="px-3 py-1 text-xs bg-neutral-600 text-white rounded hover:bg-neutral-500">
          Cancel
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors. (`lucide-react` is already a dependency.)

- [ ] **Step 3: Commit**

```bash
git add components/edit-mode/InlineList.tsx
git commit -m "feat(edit): InlineList editable list component"
```

---

## Task 7: Wire up the Event Production page

**Files:**
- Modify: `app/event-production/page.tsx`

Convert the hardcoded "Selected work" list (currently `app/event-production/page.tsx:123-139`) to an editable heading + `InlineList`, switch fetching to `withStyleKeys`, and pass `styleValue` to the page's inline blocks. The hero headline gets `clampMobileSize="text-7xl"`.

- [ ] **Step 1: Add imports**

Add near the existing edit-mode imports:
```tsx
import { InlineText } from '@/components/edit-mode/InlineText';
import { InlineList } from '@/components/edit-mode/InlineList';
import { withStyleKeys } from '@/lib/edit-mode/block-style';
```

- [ ] **Step 2: Add list keys to `KEYS`**

```tsx
const KEYS = [
  `${PREFIX}_hero_image`,
  `${PREFIX}_eyebrow`,
  `${PREFIX}_headline`,
  `${PREFIX}_subhead`,
  `${PREFIX}_body`,
  `${PREFIX}_selected_work_title`,
  `${PREFIX}_selected_work`,
];
```

- [ ] **Step 3: Add list defaults to `DEFAULTS`** (names copied verbatim from the current file)

```tsx
  event_production_selected_work_title: 'Selected work',
  event_production_selected_work: [
    'Detroit Institute of Arts (Fash Bash)',
    'Neiman Marcus',
    'Mars (Super Bowl LIV through LX)',
    'The Grosse Pointe Academy',
    'Brighton High School',
    'University of Michigan, Dearborn',
    "Detroit Children's Fund",
    'Huron Valley Schools',
  ].join('\n'),
```

- [ ] **Step 4: Fetch with style companions**

```tsx
  const [c, faqs] = await Promise.all([
    getSiteContent(withStyleKeys(KEYS)),
    getFaqsByPage('corporate').catch(() => []),
  ]);
```

- [ ] **Step 5: Pass `styleValue` to inline blocks**

Add `styleValue` to each `InlineRichText` in the hero + body sections, and the mobile clamp to the headline:
- eyebrow: `styleValue={c[`${PREFIX}_eyebrow__style`]}`
- headline: `styleValue={c[`${PREFIX}_headline__style`]}` and `clampMobileSize="text-7xl"`
- subhead: `styleValue={c[`${PREFIX}_subhead__style`]}`
- body: `styleValue={c[`${PREFIX}_body__style`]}`

- [ ] **Step 6: Replace the Selected-work section** (lines 123-139)

```tsx
        <section className="max-w-container mx-auto px-10 pb-12">
          <InlineText
            tag="p"
            contentKey={`${PREFIX}_selected_work_title`}
            defaultValue={c[`${PREFIX}_selected_work_title`] || DEFAULTS[`${PREFIX}_selected_work_title`]}
            className="text-xs uppercase tracking-[0.2em] text-ink-mute mb-6"
            revalidate={`/${SLUG}`}
          />
          <InlineList
            contentKey={`${PREFIX}_selected_work`}
            defaultValue={c[`${PREFIX}_selected_work`] || DEFAULTS[`${PREFIX}_selected_work`]}
            revalidate={`/${SLUG}`}
          />
        </section>
```

- [ ] **Step 7: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add app/event-production/page.tsx
git commit -m "feat(event-production): editable Selected Work list + block sizing"
```

---

## Task 8: Verify Event Production in the live preview

**Files:** none (verification only).

- [ ] **Step 1: Start the dev server**, then open `/event-production` (use `preview_start`).

- [ ] **Step 2: Confirm the public render is unchanged.** `preview_snapshot` the Selected-work section → same 8 names, same 3-column grid; headline/body unchanged (no style saved yet).

- [ ] **Step 3: Log in as admin, enable edit mode.** (Existing admin login at `/admin`; toggle the edit-mode switch.) Then:
- Click the headline → editor panel shows the Tiptap toolbar AND the new Size/Spacing/Width row.
- Press Size **+** twice, Save. After revalidation, headline is two notches larger and persists.
- `preview_resize` to a phone width → headline does not overflow (mobile clamp at `text-7xl`).
- Check `preview_console_logs` for errors.

- [ ] **Step 4: Test the list.** Click "Edit list" → add a name, remove a name, reorder with ↑↓, Save. `preview_snapshot` → changes persist in the grid.

- [ ] **Step 5: Reset test edits.** Set Size back to 0 and restore the original 8 names so production data is clean. Confirm via `preview_snapshot`.

- [ ] **Step 6: Capture proof.** `preview_screenshot` for the summary. No commit (verification task).

---

## Task 9: Wire up the Weddings page

**Files:**
- Modify: `app/weddings/page.tsx`

Same pattern as Task 7. List section is `app/weddings/page.tsx:123-137`; heading "Selected venues"; key base `weddings_selected_venues`.

- [ ] **Step 1: Add imports** (same three as Task 7 Step 1).

- [ ] **Step 2: Add to `KEYS`:**
```tsx
  `${PREFIX}_selected_venues_title`,
  `${PREFIX}_selected_venues`,
```

- [ ] **Step 3: Add to `DEFAULTS`** (verbatim from current file):
```tsx
  weddings_selected_venues_title: 'Selected venues',
  weddings_selected_venues: [
    'Shinola Hotel, Detroit',
    'Detroit Institute of Arts',
    'Woodward Ballroom, Detroit',
    'Grosse Pointe country clubs',
    'Bay Harbor & Northern Michigan',
    'Private estates & tented weddings',
  ].join('\n'),
```

- [ ] **Step 4: Fetch with style companions:**
```tsx
  const [c, faqs] = await Promise.all([
    getSiteContent(withStyleKeys(KEYS)),
    getFaqsByPage('weddings').catch(() => []),
  ]);
```

- [ ] **Step 5: Pass `styleValue`** to eyebrow / headline (`clampMobileSize="text-7xl"`) / subhead / body (same as Task 7 Step 5).

- [ ] **Step 6: Replace the Selected-venues section** (lines 123-137):
```tsx
        <section className="max-w-container mx-auto px-10 pb-12">
          <InlineText
            tag="p"
            contentKey={`${PREFIX}_selected_venues_title`}
            defaultValue={c[`${PREFIX}_selected_venues_title`] || DEFAULTS[`${PREFIX}_selected_venues_title`]}
            className="text-xs uppercase tracking-[0.2em] text-ink-mute mb-6"
            revalidate={`/${SLUG}`}
          />
          <InlineList
            contentKey={`${PREFIX}_selected_venues`}
            defaultValue={c[`${PREFIX}_selected_venues`] || DEFAULTS[`${PREFIX}_selected_venues`]}
            revalidate={`/${SLUG}`}
          />
        </section>
```

- [ ] **Step 7: Type-check.** Run: `npx tsc --noEmit` → no errors.

- [ ] **Step 8: Commit**
```bash
git add app/weddings/page.tsx
git commit -m "feat(weddings): editable Selected Venues list + block sizing"
```

---

## Task 10: Roll out to rentals, mitzvahs, av-installation

**Files:**
- Modify: `app/rentals/page.tsx`
- Modify: `app/mitzvahs/page.tsx`
- Modify: `app/av-installation/page.tsx`

These follow the same service-page structure (`SLUG`, `PREFIX`, `KEYS`, `DEFAULTS`, hero eyebrow/headline, subhead/body grid, then `StartProjectButton`).

> **IMPORTANT — no fabrication:** Read each file first (`grep -n "border-l border-line pl-3\|text-ink-mute mb-6\|PREFIX =" app/<page>/page.tsx`). If the page has a hardcoded list section, copy its **existing** heading and array **verbatim** into the new `*_title` / `*_selected_work` DEFAULTS — do not invent or change any names. If the page has **no** list section, skip Steps c & e for that page (do only the sizing wiring in Steps b, d).

Per page:

- [ ] **Step a — Read + locate.** Note the page's literal `PREFIX`, whether a list section exists, and (if so) its heading text + exact name array.

- [ ] **Step b — Imports + style fetch.** Add `InlineText`, `InlineList`, `withStyleKeys` imports (drop `InlineList` if no list). Switch `getSiteContent(KEYS)` → `getSiteContent(withStyleKeys(KEYS))`. Add `styleValue={c[`${...}__style`]}` to eyebrow / headline (`clampMobileSize="text-7xl"`) / subhead / body.

- [ ] **Step c — Keys + defaults (only if a list exists).** Add `\`${PREFIX}_selected_work_title\`` and `\`${PREFIX}_selected_work\`` to `KEYS`; add their DEFAULTS using the page's verbatim heading + names:
```tsx
  [`${PREFIX}_selected_work_title`]: '<<existing heading, verbatim>>',
  [`${PREFIX}_selected_work`]: [
    // existing names, verbatim, one per line
  ].join('\n'),
```

- [ ] **Step d — Type-check.** Run: `npx tsc --noEmit` → no errors.

- [ ] **Step e — Replace the list section (only if a list exists)** with the `InlineText` heading + `InlineList` (as Task 7 Step 6, substituting this page's `PREFIX` and `_selected_work*` keys).

- [ ] **Step f — Commit (per page):**
```bash
git add app/<page>/page.tsx
git commit -m "feat(<page>): editable list + block sizing"
```

---

## Task 11: Full verification + lint + build

**Files:** none (verification only).

- [ ] **Step 1: Unit tests.** Run: `npm run test:run` → all green (incl. `block-style`).

- [ ] **Step 2: Type-check.** Run: `npx tsc --noEmit` → no errors.

- [ ] **Step 3: Lint.** Run: `npm run lint` → no new errors in changed files.

- [ ] **Step 4: Production build.** Run: `npm run build` → succeeds; all five service pages compile.

- [ ] **Step 5: Preview smoke test.** Visit `/weddings`, `/rentals`, `/mitzvahs`, `/av-installation`: public list render unchanged; in edit mode each list shows "Edit list" and text blocks show Size/Spacing/Width; no console errors via `preview_console_logs`.

- [ ] **Step 6: Confirm clean production data.** No throwaway test edits remain (sizes at 0, lists at original). Defaults render correctly even with zero `site_content` rows for the new keys, so untouched keys are fine.

---

## Self-Review Notes (for the executor)

- **Spec coverage:** Part 1 (editable lists) → Tasks 6, 7, 9, 10. Part 2 (sizing controls) → Tasks 1–5, 7, 9, 10. Server-side style rendering → `withStyleKeys` + `styleValue` props (Tasks 2, 7, 9, 10). No DB change → companion keys in existing `site_content`. Mobile clamp → `clampMobileSize="text-7xl"` on hero headlines.
- **Naming consistency:** `BlockStyle`, `Space`, `Width`, `parseBlockStyle`, `serializeBlockStyle`, `applyBlockStyle`, `shiftFontSize`, `withStyleKeys`, `parseList`, `serializeList`, `InlineList`, `BlockControls`, props `styleValue` / `clampMobileSize` — used identically across tasks.
- **Default-safe:** every new key has a DEFAULTS fallback, so pages render correctly before any admin edit and before any `site_content` row exists.
- **Test command:** Vitest is already configured (`vitest.config.ts`, jsdom, globals, `@` alias, `__tests__/`). Run subsets with `npm run test:run -- <name>`.
