import { describe, it, expect } from 'vitest';
import { EVENT_TAGS, normalizeTags, labelForTag } from '@/lib/event-tags';

describe('EVENT_TAGS', () => {
  it('has the 7 agreed event types in order', () => {
    expect(EVENT_TAGS.map((t) => t.slug)).toEqual([
      'weddings', 'corporate', 'school-events', 'mitzvahs', 'concerts-live', 'galas', 'av-installation',
    ]);
  });
});

describe('normalizeTags', () => {
  it('returns [] for an empty list', () => {
    expect(normalizeTags([])).toEqual([]);
  });
  it('keeps valid slugs and drops unknown ones', () => {
    expect(normalizeTags(['weddings', 'bogus', 'galas'])).toEqual(['weddings', 'galas']);
  });
  it('de-dupes and normalizes to EVENT_TAGS order', () => {
    expect(normalizeTags(['galas', 'weddings', 'galas'])).toEqual(['weddings', 'galas']);
  });
});

describe('labelForTag', () => {
  it('returns the display label for a known slug', () => {
    expect(labelForTag('concerts-live')).toBe('Concerts / Live');
  });
  it('falls back to the raw value for an unknown slug (legacy categories)', () => {
    expect(labelForTag('general')).toBe('general');
  });
});
