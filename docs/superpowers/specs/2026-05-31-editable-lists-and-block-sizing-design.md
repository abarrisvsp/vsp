# Editable "Selected Work" lists + block sizing controls

**Date:** 2026-05-31
**Status:** Approved (pending spec review)

## Problem

Two things the site owner (Aaron) cannot do today through the inline edit system:

1. **The "Selected work" / "Selected venues" lists are not editable.** They are hardcoded
   string arrays baked into the service page code, so edit mode skips over them entirely.
   - `app/event-production/page.tsx:123-139` — heading "Selected work", 8 client names.
   - `app/weddings/page.tsx:123-137` — heading "Selected venues", 6 venue names.

2. **No sizing control on editable blocks.** The inline editor (`InlineText` /
   `InlineRichText`) lets Aaron change the *words* in a block, but not the *size* of the
   text or the box/spacing it sits in. Example he pointed at: the event-production hero
   headline "Production from napkin sketch to load-out — and every piece in between."

The chosen direction is **preset-based controls** (not free-form drag resize): Aaron gets
real control over size/spacing/width, but every choice is a pre-approved value that stays
on-brand and survives the responsive/mobile layout.

**Important:** nothing is resized by default. Every block keeps its current designed look.
This work only *gives Aaron the controls* to change sizes himself.

## Existing architecture (what we build on)

- `site_content` is a flat `key → value` (string) table.
  - Read: `getSiteContent(keys: string[])` → `Record<key, value>` (server, anon).
  - Write: `updateSiteContent(key, value, path?)` → admin-guarded upsert, then
    `revalidatePath(path)` + `revalidatePath('/', 'layout')`. (`lib/actions/content.ts`)
- `InlineText` (plain text) and `InlineRichText` (Tiptap rich text) are client components
  that render a normal element for visitors and become editable when
  `editMode && isAdmin`. Both receive `contentKey`, `defaultValue`, `className`,
  `revalidate`. The Tailwind size lives inside `className` (e.g. `text-6xl`, `text-lg`).
- Pages fetch their keys server-side via `getSiteContent([...KEYS])` and pass values down
  as `defaultValue`. `dynamic = 'force-dynamic'`, `fetchCache = 'force-no-store'`.
- Edit mode state lives in `EditModeProvider` (`useEditMode()` → `editMode`, `isAdmin`,
  `setIsEditing`).

## Part 1 — Editable lists (`InlineList`)

New client component `components/edit-mode/InlineList.tsx`.

**Data model** — one `site_content` key per list, value is newline-separated lines:

| Key | Holds | Default seed |
|-----|-------|--------------|
| `event_production_selected_work` | client names, one per line | the current 8 names |
| `event_production_selected_work_title` | the heading | "Selected work" |
| `weddings_selected_venues` | venue names, one per line | the current 6 names |
| `weddings_selected_venues_title` | the heading | "Selected venues" |

Parsing: `value.split('\n').map(trim).filter(Boolean)`. Save: `lines.join('\n')`.

**Props:** `contentKey`, `defaultValue` (newline string), `revalidate`, plus class hooks
for the `<ul>` / `<li>` so the rendered markup is byte-for-byte the current grid
(`grid sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3 text-ink-dim`, items
`border-l border-line pl-3 leading-snug`).

**Visitor render:** identical `<ul>`/`<li>` grid as today. No visual change.

**Edit mode (admin):**
- Each line is click-to-edit inline text (reuse the `InlineText` interaction feel).
- **＋ Add** button appended after the list adds a blank editable line.
- **✕** on each line removes it.
- **↑ / ↓** on each line reorders it (arrows, per decision — not drag).
- One **Save** persists the whole list to the single key; **Cancel** reverts.

The heading is a separate `InlineText` (or `InlineRichText inline`) bound to the
`*_title` key — same as other editable labels on the page.

## Part 2 — Block sizing controls

**Data model** — a companion key per block: for content key `X`, styling lives in
`X__style` as a small JSON string. Content values are never touched.

```json
{ "sizeStep": 0, "space": "normal", "width": "normal" }
```

- `sizeStep`: integer, clamped to **[-2, +2]**. 0 = the block's designed size.
- `space`: `"tight" | "normal" | "loose"` → vertical margin preset.
- `width`: `"narrow" | "normal" | "wide"` → max-width preset.

Missing/empty `X__style` ⇒ all defaults ⇒ block renders exactly as today.

**Applying `sizeStep` (relative, responsive-safe):**
- Tailwind text scale as an ordered array:
  `['text-xs','text-sm','text-base','text-lg','text-xl','text-2xl', … ,'text-9xl']`.
- A helper `shiftFontSize(className, step)`:
  - Finds every `text-<size>` token in `className`, including responsive-prefixed ones
    (`md:text-6xl`), preserving the prefix.
  - Shifts each token's index by `step`, clamped within the scale array bounds.
  - Returns the rewritten className. `step === 0` returns className unchanged.
- This keeps sizing **proportional to the designed size** and **preserves responsive
  variants**, so a bump on desktop still scales down sensibly on mobile.
- **Hero-headline clamp:** the overlaid hero headline gets a slightly tighter upper clamp
  on small screens so a large `sizeStep` can't crowd a phone. (Implementation: cap the
  resulting mobile token; desktop unaffected.)

**Applying `space` / `width`:** map each preset to a fixed Tailwind class appended to the
block (e.g. space → `my-2` / `my-6` / `my-12`; width → `max-w-md` / no cap / `max-w-4xl`).
Exact tokens finalized during implementation; values are curated, not arbitrary.

**Reading styles on the server:** styles must apply to *all visitors*, so they are
SSR'd, not fetched client-side. Pages fetch the companion keys alongside content. To
avoid hand-maintaining two parallel key lists, add a helper:

```ts
withStyleKeys(keys) // → [...keys, ...keys.map(k => `${k}__style`)]
```

Pages call `getSiteContent(withStyleKeys(KEYS))`, and each Inline block is passed one
extra prop, `styleValue={c[`${key}__style`]}`. Components parse it (with safe fallback to
defaults on malformed JSON) and apply the size/space/width transforms before render.

**Edit-mode UI:** extend the existing toolbars with a "Block" control group:
- `InlineRichText`: append a row to its Tiptap toolbar — `Size − / +`, a Spacing
  select, a Width select.
- `InlineText`: it currently has only Save/Cancel; add the same small control group to
  its action popover.
- Changing a control updates a live preview; **Save** writes the JSON to `X__style` via
  `updateSiteContent(`${X}__style`, json, revalidate)` (reusing the existing action and
  revalidation). No new server action needed.

## Rollout scope (first build)

1. Build `InlineList` and wire up the two lists + their headings.
2. Add `sizeStep` / `space` / `width` support into `InlineText` and `InlineRichText`,
   plus the `shiftFontSize` / `withStyleKeys` helpers.
3. **Enable sizing on the 5 service pages** (event-production, weddings, rentals,
   mitzvahs, av-installation) by switching their `getSiteContent` calls to
   `withStyleKeys(...)` and passing `styleValue` to each inline block.

Other pages (home, about, services index, contact, gallery) are **out of scope for the
first build** but become trivial to enable later — pass the same one extra prop per block.
No schema change is needed to extend coverage.

## Non-goals (YAGNI)

- No free-form drag/resize. No arbitrary pixel sizes or arbitrary box dragging.
- No new database tables/columns — everything rides on the existing `site_content`
  key/value table.
- No color/theme changes beyond what the rich-text editor already offers.
- No pre-applied resizing of any existing block.

## Risks & mitigations

- **Mobile overflow from large sizes** → relative `sizeStep`, hard clamp to [-2,+2],
  tighter clamp on the hero headline.
- **Tailwind class-override ambiguity** → don't append a competing size class; rewrite the
  existing `text-*` token in place via `shiftFontSize` (deterministic).
- **Malformed `__style` JSON** → parse defensively, fall back to defaults.
- **Two-key drift (content vs style)** → `withStyleKeys` derives style keys from content
  keys so they can't fall out of sync.

## Testing

- `shiftFontSize`: unit-test token rewriting incl. responsive prefixes, clamping at scale
  ends, and `step === 0` no-op.
- `InlineList`: add / remove / edit / reorder / save round-trip; visitor render matches
  the current grid markup.
- Manual: in edit mode on `/event-production`, resize the napkin headline, set spacing and
  width, save, reload as a visitor and confirm it persists; verify mobile layout at a
  small viewport.
