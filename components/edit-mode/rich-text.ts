// Pure helpers for InlineRichText — kept framework-free so they can be unit-tested
// without pulling in Tiptap/React.

export type DisplayTag = 'div' | 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4';

// Wrappers that can only contain phrasing content — a block <p> nested inside one
// is invalid HTML. The browser silently strips the inner <p>, which then breaks
// React hydration (server DOM ends up empty, client vdom still has the <p>).
const TEXT_LEVEL_TAGS = new Set<string>(['p', 'span', 'h1', 'h2', 'h3', 'h4']);

export function looksLikeHtml(s: string): boolean {
  // Treat as already-HTML if it contains tags OR HTML entities (&nbsp; &amp; &#x…; etc.)
  // so values like "&nbsp;Aaron Barris" are passed through as-is instead of being
  // re-escaped by escapeHtml() into the literal string "&amp;nbsp;Aaron Barris".
  return /<(p|br|h[1-6]|ul|ol|li|strong|em|u|span|blockquote)\b/i.test(s)
    || /&(?:[a-z]{2,8}|#\d{1,6}|#x[\da-f]{1,6});/i.test(s);
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Build the HTML the Tiptap editor + display layer consumes.
 * Inline mode emits a single <p>...</p> regardless of input.
 * Block mode splits on blank lines and emits one <p> per paragraph.
 */
export function toHtml(value: string, inline: boolean): string {
  if (!value) return inline ? '<p></p>' : '';
  if (looksLikeHtml(value)) {
    // Already HTML — Tiptap requires a wrapping paragraph in inline mode so
    // if the saved value was inline-only (e.g. "<strong>foo</strong> bar"), wrap it.
    if (inline && !/^<(p|h[1-6]|ul|ol|blockquote)\b/i.test(value)) {
      return `<p>${value}</p>`;
    }
    return value;
  }
  if (inline) {
    return `<p>${escapeHtml(value)}</p>`;
  }
  return value
    .split(/\n{2,}/)
    .map((para) => `<p>${escapeHtml(para).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

/**
 * Strip the outer wrapping <p>...</p> from Tiptap's HTML so the saved/displayed
 * content is pure inline markup ("foo <strong>bar</strong>"). Leaves the input
 * untouched if it isn't a single <p> or if it contains nested block tags.
 */
export function stripOuterParagraph(html: string): string {
  const m = html.match(/^\s*<p[^>]*>([\s\S]*)<\/p>\s*$/i);
  if (!m) return html;
  // If there are nested block tags inside this paragraph, leave them alone.
  if (/<(p|h[1-6]|ul|ol|li|blockquote)\b/i.test(m[1])) return html;
  return m[1];
}

/**
 * Decide the HTML to paint into the display element. The wrapping <p> must be
 * stripped whenever the display element is text-level (p, span, h1–h4) — otherwise
 * we nest a <p> inside a <p>/<h1>/etc., which is invalid and breaks hydration.
 * Inline mode always strips too (its wrapper defaults to <span>).
 */
export function resolveDisplayHtml(
  html: string,
  opts: { inline: boolean; tag: string },
): string {
  if (opts.inline || TEXT_LEVEL_TAGS.has(opts.tag)) {
    return stripOuterParagraph(html);
  }
  return html;
}
