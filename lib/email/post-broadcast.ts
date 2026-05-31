import { Resend } from 'resend';
import type { BlogPost, Subscriber } from '@/lib/types';

const FROM = process.env.RESEND_FROM || 'Visionary Sound Productions <onboarding@resend.dev>';
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://visionarysoundproductions.com';

interface SendResult {
  sent: number;        // queued for immediate delivery (today)
  scheduled: number;   // queued for future delivery (later days)
  failed: number;
  errors: string[];
  /** ISO timestamp of the latest scheduled batch (or null if all immediate). */
  lastScheduledFor: string | null;
}

/**
 * Resend free tier = 100 emails/day. We chunk into batches just under that
 * (default 95) and schedule each subsequent chunk +24h later via Resend's
 * scheduled_at, so a list of 195 subscribers becomes:
 *   chunk 1 (95) → now
 *   chunk 2 (95) → +24h
 *   chunk 3 (5)  → +48h
 * Override via RESEND_DAILY_LIMIT env var if you upgrade Resend's quota.
 */
export async function sendPostBroadcast(
  post: BlogPost,
  subscribers: Subscriber[]
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: 0, scheduled: 0, failed: subscribers.length, errors: ['RESEND_API_KEY not set'], lastScheduledFor: null };
  }
  const resend = new Resend(apiKey);
  const postUrl = `${SITE_URL}/blog/${post.slug}`;

  // Daily limit. Default 95 (5-email buffer under Resend's 100/day free quota).
  // Set RESEND_DAILY_LIMIT=2950 (or whatever) once you upgrade to paid.
  const DAILY_LIMIT = Math.max(1, Number(process.env.RESEND_DAILY_LIMIT || 95));
  // Resend /emails/batch still caps at 100 per HTTP call regardless of quota.
  const CHUNK_SIZE = Math.min(DAILY_LIMIT, 100);

  const result: SendResult = { sent: 0, scheduled: 0, failed: 0, errors: [], lastScheduledFor: null };

  for (let chunkIdx = 0, i = 0; i < subscribers.length; i += CHUNK_SIZE, chunkIdx++) {
    const batch = subscribers.slice(i, i + CHUNK_SIZE);
    // Day 0 → immediate; day N → schedule N*24h in the future.
    const scheduledAt = chunkIdx === 0
      ? null
      : new Date(Date.now() + chunkIdx * 24 * 60 * 60 * 1000).toISOString();
    const emails = batch.map((sub) => {
      const unsubUrl = `${SITE_URL}/unsubscribe?token=${sub.unsubscribe_token}`;
      const greeting = sub.first_name ? `Hi ${sub.first_name},` : 'Hi,';
      const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f5f1ea;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1714;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <p style="margin:0 0 18px;font-size:13px;text-transform:uppercase;letter-spacing:0.1em;color:#7a7468;">New from VSP · Journal</p>
    ${post.cover_image_url ? `<a href="${postUrl}" style="text-decoration:none;"><img src="${post.cover_image_url}" alt="" style="width:100%;height:auto;display:block;margin:0 0 24px;border-radius:4px;" /></a>` : ''}
    <h1 style="font-family:'Times New Roman',serif;font-style:italic;font-weight:normal;font-size:32px;line-height:1.15;margin:0 0 16px;color:#1a1714;">
      <a href="${postUrl}" style="text-decoration:none;color:#1a1714;">${escapeHtml(post.title)}</a>
    </h1>
    ${post.excerpt ? `<p style="font-size:16px;line-height:1.55;color:#3a342b;margin:0 0 24px;">${escapeHtml(post.excerpt)}</p>` : ''}
    <p style="margin:0 0 32px;">
      <a href="${postUrl}" style="display:inline-block;background:#1a1714;color:#f5f1ea;padding:12px 22px;text-decoration:none;font-size:14px;font-weight:500;">Read the full post →</a>
    </p>
    <p style="font-size:14px;color:#1a1714;margin:24px 0 4px;">${greeting}</p>
    <p style="font-size:14px;color:#3a342b;margin:0 0 32px;line-height:1.5;">You're getting this because you've subscribed to updates from Visionary Sound Productions.</p>
    <hr style="border:none;border-top:1px solid #d9d2c5;margin:24px 0;" />
    <p style="font-size:12px;color:#7a7468;margin:0;line-height:1.6;">
      Visionary Sound Productions · Commerce Township, MI<br/>
      <a href="${unsubUrl}" style="color:#7a7468;">Unsubscribe</a> · <a href="${SITE_URL}" style="color:#7a7468;">visionarysoundproductions.com</a>
    </p>
  </div>
</body></html>`;

      const email: Record<string, unknown> = {
        from: FROM,
        to: [sub.email],
        subject: `${post.title} — Visionary Sound Productions`,
        html,
        headers: {
          'List-Unsubscribe': `<${unsubUrl}>, <mailto:${process.env.ADMIN_EMAIL}?subject=Unsubscribe>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      };
      if (scheduledAt) email.scheduled_at = scheduledAt;
      return email;
    });

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await resend.batch.send(emails as any);
      if (scheduledAt) {
        result.scheduled += batch.length;
        result.lastScheduledFor = scheduledAt;
      } else {
        result.sent += batch.length;
      }
    } catch (e) {
      result.failed += batch.length;
      result.errors.push(String(e));
      console.error('Resend batch failed', { chunkIdx, scheduledAt, error: e });
    }
  }

  return result;
}

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)
  );
}
