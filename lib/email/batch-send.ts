import { Resend } from 'resend';
import type { Subscriber } from '@/lib/types';
import { SITE_URL } from './template';

export const FROM = process.env.RESEND_FROM || 'Visionary Sound Productions <onboarding@resend.dev>';

export interface SendResult {
  sent: number;        // queued for immediate delivery (today)
  scheduled: number;   // queued for future delivery (later days)
  failed: number;
  errors: string[];
  /** ISO timestamp of the latest scheduled batch (or null if all immediate). */
  lastScheduledFor: string | null;
}

/**
 * Emails a day before sending spills over to the next day. Resend's free tier
 * allows 100/day; the default keeps a 5-email buffer for login codes and
 * contact-form alerts. Set RESEND_DAILY_LIMIT after upgrading Resend.
 */
export function dailyEmailLimit(): number {
  return Math.max(1, Number(process.env.RESEND_DAILY_LIMIT || 95));
}

/**
 * Sends one email per subscriber, at most the daily limit per day. The first
 * day goes now and each later day is scheduled 24h after the previous one via
 * Resend's scheduled_at, so 195 subscribers at 95/day becomes 95 now, 95 at
 * +24h and 5 at +48h.
 */
export async function sendInDailyBatches(
  subscribers: Subscriber[],
  build: (sub: Subscriber, unsubUrl: string) => { subject: string; html: string },
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: 0, scheduled: 0, failed: subscribers.length, errors: ['RESEND_API_KEY not set'], lastScheduledFor: null };
  }
  const resend = new Resend(apiKey);
  const perDay = dailyEmailLimit();
  const result: SendResult = { sent: 0, scheduled: 0, failed: 0, errors: [], lastScheduledFor: null };

  // Group by day first, then split each day into requests of 100 (Resend's
  // per-call cap). Grouping by request instead would push everything past the
  // first 100 to tomorrow, even on a paid plan with a much higher daily quota.
  for (let day = 0, dayStart = 0; dayStart < subscribers.length; dayStart += perDay, day++) {
    const scheduledAt = day === 0 ? null : new Date(Date.now() + day * 24 * 60 * 60 * 1000).toISOString();
    const dayBatch = subscribers.slice(dayStart, dayStart + perDay);

    for (let i = 0; i < dayBatch.length; i += 100) {
      const batch = dayBatch.slice(i, i + 100);
      const emails = batch.map((sub) => {
        const unsubUrl = `${SITE_URL}/unsubscribe?token=${sub.unsubscribe_token}`;
        const { subject, html } = build(sub, unsubUrl);
        const email: Record<string, unknown> = {
          from: FROM,
          to: [sub.email],
          subject,
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
        console.error('Resend batch failed', { day, scheduledAt, error: e });
      }
    }
  }

  return result;
}

/** Sends identical test emails to a few explicit addresses, outside the list. */
export async function sendTestEmails(
  emails: string[],
  subject: string,
  html: string,
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: 0, failed: emails.length, errors: ['RESEND_API_KEY not set'] };
  const resend = new Resend(apiKey);
  const messages = emails.map((email) => ({ from: FROM, to: [email], subject, html }));
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await resend.batch.send(messages as any);
    return { sent: emails.length, failed: 0, errors: [] };
  } catch (e) {
    console.error('Resend test batch failed', e);
    return { sent: 0, failed: emails.length, errors: [String(e)] };
  }
}
