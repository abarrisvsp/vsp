import type { Subscriber } from '@/lib/types';
import { sendInDailyBatches, sendTestEmails, type SendResult } from './batch-send';
import { greetingFor } from './post-broadcast';
import { emailifyHtml, escapeHtml, loadEmailWording, renderEmailShell, SITE_URL } from './template';
import type { EmailWording } from './wording';

export type BulkEmail = { subject: string; bodyHtml: string };

export async function sendBulkEmail(email: BulkEmail, subscribers: Subscriber[]): Promise<SendResult> {
  const wording = await loadEmailWording();
  return sendInDailyBatches(subscribers, (sub, unsubUrl) => ({
    subject: email.subject,
    html: renderBulkEmailHtml({ bodyHtml: email.bodyHtml, greeting: greetingFor(sub), unsubUrl, wording }),
  }));
}

export async function sendBulkEmailTest(
  email: BulkEmail,
  addresses: string[],
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const wording = await loadEmailWording();
  const html = renderBulkEmailHtml({ bodyHtml: email.bodyHtml, greeting: 'Hi,', unsubUrl: `${SITE_URL}/unsubscribe`, wording });
  return sendTestEmails(addresses, `[Test] ${email.subject}`, html);
}

export async function previewBulkEmailHtml(bodyHtml: string, greeting: string): Promise<string> {
  const wording = await loadEmailWording();
  return renderBulkEmailHtml({ bodyHtml, greeting, unsubUrl: `${SITE_URL}/unsubscribe`, wording });
}

function renderBulkEmailHtml({
  bodyHtml,
  greeting,
  unsubUrl,
  wording,
}: {
  bodyHtml: string;
  greeting: string;
  unsubUrl: string;
  wording: EmailWording;
}): string {
  const contentHtml = `
    <p style="font-size:16px;line-height:1.6;color:#1a1714;margin:0 0 16px;">${escapeHtml(greeting)}</p>
    <div style="margin:0 0 24px;">${emailifyHtml(bodyHtml)}</div>`;
  return renderEmailShell({ contentHtml, wording, unsubUrl });
}
