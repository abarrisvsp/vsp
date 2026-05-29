// lib/event-tags.ts
// The fixed set of event types used to tag media and drive the public gallery filter.
// One source of truth for both the admin Media Library chips and the /gallery tabs.

export const EVENT_TAGS = [
  { slug: 'weddings', label: 'Weddings' },
  { slug: 'corporate', label: 'Corporate' },
  { slug: 'school-events', label: 'School Events' },
  { slug: 'mitzvahs', label: 'Mitzvahs' },
  { slug: 'concerts-live', label: 'Concerts / Live' },
  { slug: 'galas', label: 'Galas' },
  { slug: 'av-installation', label: 'AV Installation' },
] as const;

export type EventTagSlug = (typeof EVENT_TAGS)[number]['slug'];

const VALID = new Set<string>(EVENT_TAGS.map((t) => t.slug));

/** Keep only valid slugs, de-dupe, and return them in EVENT_TAGS order. */
export function normalizeTags(tags: string[]): EventTagSlug[] {
  const wanted = new Set(tags);
  return EVENT_TAGS.map((t) => t.slug).filter((slug) => wanted.has(slug));
}

/** Display label for a slug; falls back to the raw value for legacy free-text categories. */
export function labelForTag(slug: string): string {
  return EVENT_TAGS.find((t) => t.slug === slug)?.label ?? slug;
}

/**
 * Canonicalize a tag/category value read from the DB so casing and whitespace
 * variants collapse into one value. Known event types (matched case-insensitively
 * by slug or label) fold to their canonical slug; anything else is trimmed,
 * whitespace-collapsed, and Title-Cased. This is what keeps "corporate" and
 * "Corporate" from rendering as two separate gallery filter chips.
 */
export function canonicalizeTag(value: string): string {
  const s = value.trim().replace(/\s+/g, ' ');
  const hit = EVENT_TAGS.find(
    (t) => t.slug.toLowerCase() === s.toLowerCase() || t.label.toLowerCase() === s.toLowerCase()
  );
  if (hit) return hit.slug;
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function isEventTag(value: string): value is EventTagSlug {
  return VALID.has(value);
}
