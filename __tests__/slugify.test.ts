// __tests__/slugify.test.ts
import { describe, it, expect } from 'vitest';
import { slugify } from '@/lib/slugify';

describe('slugify', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('strips special characters', () => {
    expect(slugify('Rosenthal Bar Mitzvah — Grand Hyatt NYC')).toBe(
      'rosenthal-bar-mitzvah-grand-hyatt-nyc'
    );
  });

  it('collapses multiple hyphens', () => {
    expect(slugify('A  B---C')).toBe('a-b-c');
  });

  it('trims leading/trailing hyphens', () => {
    expect(slugify('  hello  ')).toBe('hello');
  });
});
