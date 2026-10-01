'use server';
import { auth } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase';
import { fetchAllActiveSubscribers } from '@/lib/subscribers';
import { EMAIL_WORDING_FIELDS, EMAIL_WORDING_KEYS, type EmailWording } from '@/lib/email/wording';
import { hasEmailContent } from '@/lib/email/template';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error('Unauthorized');
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Blank fields are stored blank, which means "use the default". */
export async function saveEmailWording(wording: EmailWording): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const now = new Date().toISOString();
  const rows = EMAIL_WORDING_FIELDS.map((field) => ({
    key: EMAIL_WORDING_KEYS[field],
    value: String(wording[field] ?? '').trim().slice(0, 500),
    updated_at: now,
  }));
  const { error } = await supabase.from('site_content').upsert(rows, { onConflict: 'key' });
  if (error) throw error;
}

type Draft = { subject: string; bodyHtml: string };

function validateDraft(draft: Draft): string | null {
  if (!draft.subject?.trim()) return 'Add a subject line first.';
  if (draft.subject.length > 200) return 'That subject line is too long.';
  if (!hasEmailContent(draft.bodyHtml || '')) return 'The email body is empty.';
  return null;
}

export async function previewBulkEmail(bodyHtml: string): Promise<string> {
  await requireAdmin();
  const { previewBulkEmailHtml } = await import('@/lib/email/bulk-email');
  return previewBulkEmailHtml(bodyHtml || '', 'Hi Aaron,');
}

export async function sendBulkEmailTestAction(
  draft: Draft & { addresses: string },
): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  const problem = validateDraft(draft);
  if (problem) return { ok: false, message: problem };

  // Hard cap, so the test box can never be used to blast a list.
  const addresses = Array.from(
    new Set(
      (draft.addresses || '')
        .split(/[\s,;]+/)
        .map((e) => e.trim().toLowerCase())
        .filter((e) => EMAIL_RE.test(e)),
    ),
  ).slice(0, 10);
  if (addresses.length === 0) return { ok: false, message: 'Enter at least one valid test address.' };

  const { sendBulkEmailTest } = await import('@/lib/email/bulk-email');
  const res = await sendBulkEmailTest({ subject: draft.subject.trim(), bodyHtml: draft.bodyHtml }, addresses);
  if (res.failed > 0) return { ok: false, message: `Test failed: ${res.errors[0] ?? 'unknown error'}` };
  return { ok: true, message: `Test sent to ${addresses.join(', ')}` };
}

export type BulkSendSummary =
  | { ok: true; sent: number; scheduled: number; failed: number; lastScheduledFor: string | null }
  | { ok: false; message: string };

export async function sendBulkEmailAction(draft: Draft): Promise<BulkSendSummary> {
  await requireAdmin();
  const problem = validateDraft(draft);
  if (problem) return { ok: false, message: problem };

  const subscribers = await fetchAllActiveSubscribers();
  if (subscribers.length === 0) return { ok: false, message: 'There are no active subscribers to send to.' };

  const { sendBulkEmail } = await import('@/lib/email/bulk-email');
  const res = await sendBulkEmail({ subject: draft.subject.trim(), bodyHtml: draft.bodyHtml }, subscribers);
  if (res.sent === 0 && res.scheduled === 0) {
    return { ok: false, message: `Nothing was sent: ${res.errors[0] ?? 'unknown error'}` };
  }
  return { ok: true, sent: res.sent, scheduled: res.scheduled, failed: res.failed, lastScheduledFor: res.lastScheduledFor };
}
