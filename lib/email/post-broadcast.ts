import type { BlogPost, Subscriber } from '@/lib/types';
import { sendInDailyBatches, sendTestEmails, type SendResult } from './batch-send';
import { escapeHtml, loadEmailWording, renderEmailShell, SITE_URL } from './template';
import type { EmailWording } from './wording';

export async function sendPostBroadcast(post: BlogPost, subscribers: Subscriber[]): Promise<SendResult> {
  const wording = await loadEmailWording();
  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  return sendInDailyBatches(subscribers, (sub, unsubUrl) => ({
    subject: `${post.title} — Visionary Sound Productions`,
    html: renderPostEmailHtml({ post, postUrl, greeting: greetingFor(sub), unsubUrl, wording }),
  }));
}

/**
 * Sends the post email to a handful of explicit addresses. Does NOT touch the
 * subscriber list or mark the post as emailed; the subject is prefixed [Test].
 */
export async function sendTestPostBroadcast(
  post: BlogPost,
  emails: string[],
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const wording = await loadEmailWording();
  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  // No real subscriber, so no per-recipient unsubscribe token.
  const html = renderPostEmailHtml({ post, postUrl, greeting: 'Hi,', unsubUrl: `${SITE_URL}/unsubscribe`, wording });
  return sendTestEmails(emails, `[Test] ${post.title} — Visionary Sound Productions`, html);
}

export function greetingFor(sub: Pick<Subscriber, 'first_name'>): string {
  return sub.first_name ? `Hi ${sub.first_name},` : 'Hi,';
}

function renderPostEmailHtml({
  post,
  postUrl,
  greeting,
  unsubUrl,
  wording,
}: {
  post: BlogPost;
  postUrl: string;
  greeting: string;
  unsubUrl: string;
  wording: EmailWording;
}): string {
  const contentHtml = `
    ${post.cover_image_url ? `<a href="${postUrl}" style="text-decoration:none;"><img src="${post.cover_image_url}" alt="" style="width:100%;height:auto;display:block;margin:0 0 24px;border-radius:4px;" /></a>` : ''}
    <h1 style="font-family:'Times New Roman',serif;font-style:italic;font-weight:normal;font-size:32px;line-height:1.15;margin:0 0 16px;color:#1a1714;">
      <a href="${postUrl}" style="text-decoration:none;color:#1a1714;">${escapeHtml(post.title)}</a>
    </h1>
    ${post.excerpt ? `<p style="font-size:16px;line-height:1.55;color:#3a342b;margin:0 0 24px;">${escapeHtml(post.excerpt)}</p>` : ''}
    <p style="margin:0 0 32px;">
      <a href="${postUrl}" style="display:inline-block;background:#1a1714;color:#f5f1ea;padding:12px 22px;text-decoration:none;font-size:14px;font-weight:500;">${escapeHtml(wording.button)}</a>
    </p>
    <p style="font-size:14px;color:#1a1714;margin:24px 0 4px;">${escapeHtml(greeting)}</p>`;
  return renderEmailShell({ eyebrow: wording.eyebrow, contentHtml, wording, unsubUrl });
}
