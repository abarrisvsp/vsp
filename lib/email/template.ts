import { createServiceClient } from '@/lib/supabase';
import { DEFAULT_EMAIL_WORDING, EMAIL_WORDING_FIELDS, EMAIL_WORDING_KEYS, type EmailWording } from './wording';

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://visionarysoundproductions.com';

/** Saved wording, with the default used for any field left blank. */
export async function loadEmailWording(): Promise<EmailWording> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('site_content')
    .select('key, value')
    .in('key', Object.values(EMAIL_WORDING_KEYS));
  const saved = new Map((data ?? []).map((r) => [r.key as string, String(r.value ?? '').trim()]));
  const wording = { ...DEFAULT_EMAIL_WORDING };
  for (const field of EMAIL_WORDING_FIELDS) {
    const value = saved.get(EMAIL_WORDING_KEYS[field]);
    if (value) wording[field] = value;
  }
  return wording;
}

export function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!),
  );
}

/** The frame every email shares: optional label, content, why-line, footer. */
export function renderEmailShell({
  eyebrow,
  contentHtml,
  wording,
  unsubUrl,
}: {
  eyebrow?: string;
  contentHtml: string;
  wording: EmailWording;
  unsubUrl: string;
}): string {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f5f1ea;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1714;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    ${eyebrow ? `<p style="margin:0 0 18px;font-size:13px;text-transform:uppercase;letter-spacing:0.1em;color:#7a7468;">${escapeHtml(eyebrow)}</p>` : ''}
    ${contentHtml}
    <p style="font-size:14px;color:#3a342b;margin:0 0 32px;line-height:1.5;">${escapeHtml(wording.intro)}</p>
    <hr style="border:none;border-top:1px solid #d9d2c5;margin:24px 0;" />
    <p style="font-size:12px;color:#7a7468;margin:0;line-height:1.6;">
      ${escapeHtml(wording.footer)}<br/>
      <a href="${unsubUrl}" style="color:#7a7468;">Unsubscribe</a> · <a href="${SITE_URL}" style="color:#7a7468;">visionarysoundproductions.com</a>
    </p>
  </div>
</body></html>`;
}

const BODY_STYLES: Record<string, string> = {
  p: 'font-size:16px;line-height:1.6;color:#3a342b;margin:0 0 16px;',
  h2: "font-family:'Times New Roman',serif;font-style:italic;font-weight:normal;font-size:26px;line-height:1.2;color:#1a1714;margin:28px 0 12px;",
  h3: "font-family:'Times New Roman',serif;font-style:italic;font-weight:normal;font-size:21px;line-height:1.25;color:#1a1714;margin:24px 0 10px;",
  ul: 'margin:0 0 16px;padding-left:22px;color:#3a342b;',
  ol: 'margin:0 0 16px;padding-left:22px;color:#3a342b;',
  li: 'font-size:16px;line-height:1.6;margin:0 0 6px;',
  blockquote: 'margin:0 0 16px;padding:4px 0 4px 16px;border-left:3px solid #d9d2c5;color:#5a5348;font-style:italic;',
  a: 'color:#b91c1c;text-decoration:underline;',
  img: 'display:block;max-width:100%;height:auto;margin:8px 0 20px;border-radius:4px;',
  hr: 'border:none;border-top:1px solid #d9d2c5;margin:24px 0;',
};

/**
 * Turns editor HTML into something email clients render properly. Gmail and
 * Outlook drop <style> blocks, so every element needs its styling inline.
 */
export function emailifyHtml(html: string): string {
  return (
    html
      .replace(
        /<(p|h2|h3|ul|ol|li|blockquote|a|img|hr)(\s[^>]*?)?(\/?)>/gi,
        (_m, tag: string, attrs = '', selfClose: string) => {
          const t = tag.toLowerCase();
          const kept = String(attrs).replace(/\sstyle="[^"]*"/gi, '').replace(/\s+$/, '');
          return `<${t}${kept} style="${BODY_STYLES[t]}"${selfClose ? ' /' : ''}>`;
        },
      )
      // The editor wraps list items in <p>; without this they get paragraph gaps.
      .replace(/(<li[^>]*>)<p style="[^"]*">/gi, '$1<p style="font-size:16px;line-height:1.6;color:#3a342b;margin:0;">')
      // Empty paragraphs are deliberate blank lines, which collapse to nothing in email.
      .replace(/(<p style="[^"]*">)<\/p>/gi, '$1&nbsp;</p>')
  );
}

/** True when the editor holds real text or a photo, not just empty paragraphs. */
export function hasEmailContent(html: string): boolean {
  if (/<img\s/i.test(html)) return true;
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length > 0;
}
