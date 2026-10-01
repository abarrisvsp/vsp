import { describe, it, expect, vi } from 'vitest';

const savedRows: { key: string; value: string }[] = [];
vi.mock('@/lib/supabase', () => ({
  createServiceClient: () => ({
    from: () => ({ select: () => ({ in: () => Promise.resolve({ data: savedRows }) }) }),
  }),
}));

import { emailifyHtml, hasEmailContent, loadEmailWording, renderEmailShell } from '@/lib/email/template';
import { previewBulkEmailHtml } from '@/lib/email/bulk-email';
import { DEFAULT_EMAIL_WORDING } from '@/lib/email/wording';

describe('emailifyHtml', () => {
  it('inlines styles on block tags and leaves inline formatting alone', () => {
    const out = emailifyHtml('<p>Hello <strong>there</strong> <em>you</em></p>');
    expect(out).toMatch(/^<p style="[^"]+">Hello <strong>there<\/strong> <em>you<\/em><\/p>$/);
  });

  it('replaces an existing style attribute instead of adding a second one', () => {
    const out = emailifyHtml('<p style="color:red">x</p>');
    expect(out.match(/style=/g)).toHaveLength(1);
    expect(out).not.toContain('color:red');
  });

  it('keeps link targets intact, including URLs ending in a slash', () => {
    const out = emailifyHtml('<p><a target="_blank" rel="noopener" href="https://example.com/">go</a></p>');
    expect(out).toContain('href="https://example.com/"');
    expect(out).toContain('target="_blank"');
    expect(out).toMatch(/<a [^>]*style="[^"]+">go<\/a>/);
  });

  it('handles self-closing and plain image tags without mangling them', () => {
    expect(emailifyHtml('<img src="https://x.co/a.jpg" alt="a" />')).toMatch(/^<img src="https:\/\/x\.co\/a\.jpg" alt="a" style="[^"]+" \/>$/);
    expect(emailifyHtml('<img src="https://x.co/a.jpg">')).toMatch(/^<img src="https:\/\/x\.co\/a\.jpg" style="[^"]+">$/);
  });

  it('does not touch tags that merely start with the same letters', () => {
    const html = '<pre>code</pre><abbr title="t">A</abbr><hr2>';
    expect(emailifyHtml(html)).toBe(html);
  });

  it('removes paragraph gaps inside list items', () => {
    const out = emailifyHtml('<ul><li><p>one</p></li></ul>');
    expect(out).toMatch(/<li style="[^"]+"><p style="[^"]*margin:0;">one<\/p>/);
  });

  it('keeps deliberate blank lines from collapsing', () => {
    expect(emailifyHtml('<p></p>')).toMatch(/^<p style="[^"]+">&nbsp;<\/p>$/);
  });
});

describe('hasEmailContent', () => {
  it('treats empty editor output as empty', () => {
    expect(hasEmailContent('')).toBe(false);
    expect(hasEmailContent('<p></p>')).toBe(false);
    expect(hasEmailContent('<p>&nbsp;</p><p> </p>')).toBe(false);
  });

  it('counts real text or a photo as content', () => {
    expect(hasEmailContent('<p>Hi</p>')).toBe(true);
    expect(hasEmailContent('<p><img src="https://x.co/a.jpg"></p>')).toBe(true);
  });
});

describe('email wording', () => {
  it('uses saved wording and falls back to the default for blank fields', async () => {
    savedRows.splice(0, savedRows.length,
      { key: 'email_template_footer', value: 'VSP · PO Box 1, Commerce Township, MI 48382' },
      { key: 'email_template_intro', value: '   ' },
    );
    const w = await loadEmailWording();
    expect(w.footer).toBe('VSP · PO Box 1, Commerce Township, MI 48382');
    expect(w.intro).toBe(DEFAULT_EMAIL_WORDING.intro);
    expect(w.eyebrow).toBe(DEFAULT_EMAIL_WORDING.eyebrow);
  });

  it('escapes wording so a stray tag cannot break the email', () => {
    const html = renderEmailShell({
      contentHtml: '',
      wording: { ...DEFAULT_EMAIL_WORDING, footer: '<script>x</script> & co' },
      unsubUrl: 'https://vsp.test/unsubscribe',
    });
    expect(html).toContain('&lt;script&gt;x&lt;/script&gt; &amp; co');
    expect(html).not.toContain('<script>');
  });
});

describe('bulk email rendering', () => {
  it('escapes the greeting, since names come from the public signup form', async () => {
    savedRows.splice(0, savedRows.length);
    const html = await previewBulkEmailHtml('<p>Body</p>', 'Hi <img src=x onerror=alert(1)>,');
    expect(html).toContain('Hi &lt;img src=x onerror=alert(1)&gt;,');
    expect(html).not.toContain('<img src=x');
  });

  it('includes the body, the why-line, and an unsubscribe link', async () => {
    savedRows.splice(0, savedRows.length);
    const html = await previewBulkEmailHtml('<p>Spring dates are open.</p>', 'Hi Aaron,');
    expect(html).toContain('Spring dates are open.');
    expect(html).toContain(DEFAULT_EMAIL_WORDING.intro.replace(/'/g, '&#39;'));
    expect(html).toMatch(/<a href="[^"]*\/unsubscribe"[^>]*>Unsubscribe<\/a>/);
  });
});
