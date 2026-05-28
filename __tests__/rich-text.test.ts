// __tests__/rich-text.test.ts
import { describe, it, expect } from 'vitest';
import { toHtml, stripOuterParagraph, resolveDisplayHtml } from '@/components/edit-mode/rich-text';

describe('toHtml', () => {
  it('wraps plain text in a single <p> in inline mode', () => {
    expect(toHtml('Hello', true)).toBe('<p>Hello</p>');
  });

  it('wraps each paragraph in block mode', () => {
    expect(toHtml('A\n\nB', false)).toBe('<p>A</p><p>B</p>');
  });

  it('returns empty string for empty block value', () => {
    expect(toHtml('', false)).toBe('');
  });
});

describe('stripOuterParagraph', () => {
  it('removes a single wrapping <p>', () => {
    expect(stripOuterParagraph('<p>foo <strong>bar</strong></p>')).toBe('foo <strong>bar</strong>');
  });

  it('leaves multi-paragraph / nested-block html untouched', () => {
    expect(stripOuterParagraph('<p>a</p><p>b</p>')).toBe('<p>a</p><p>b</p>');
  });
});

describe('resolveDisplayHtml', () => {
  // The regression: a block <p> must never be placed inside a text-level wrapper,
  // or it nests <p> inside <p>/<h1> and breaks hydration.
  it('strips the wrapping <p> when the wrapper is a <p>', () => {
    expect(resolveDisplayHtml('<p>Hello world</p>', { inline: false, tag: 'p' })).toBe('Hello world');
  });

  it('strips the wrapping <p> for heading wrappers', () => {
    expect(resolveDisplayHtml('<p>Headline</p>', { inline: false, tag: 'h1' })).toBe('Headline');
    expect(resolveDisplayHtml('<p>Sub</p>', { inline: false, tag: 'h2' })).toBe('Sub');
  });

  it('keeps the block <p> when the wrapper is a <div>', () => {
    expect(resolveDisplayHtml('<p>Body</p>', { inline: false, tag: 'div' })).toBe('<p>Body</p>');
    expect(resolveDisplayHtml('<p>a</p><p>b</p>', { inline: false, tag: 'div' })).toBe('<p>a</p><p>b</p>');
  });

  it('strips in inline mode regardless of tag', () => {
    expect(resolveDisplayHtml('<p>x</p>', { inline: true, tag: 'span' })).toBe('x');
  });

  it('produces no nested <p> for the hero subheadline case', () => {
    const html = toHtml('Visionary Sound Productions is a full-service event production company.', false);
    const display = resolveDisplayHtml(html, { inline: false, tag: 'p' });
    expect(display.startsWith('<p')).toBe(false);
  });
});
