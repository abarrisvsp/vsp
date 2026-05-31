import { Resend } from 'resend';

const FROM = process.env.RESEND_FROM || 'Visionary Sound Productions <onboarding@resend.dev>';

/**
 * Emails Aaron a one-time 6-digit sign-in code. Failures are logged, not thrown:
 * the login form always shows the same neutral "check your email" message, so we
 * never reveal whether a send succeeded.
 */
export async function sendLoginCode(to: string, code: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[auth] RESEND_API_KEY not set; cannot send login code');
    return;
  }
  const resend = new Resend(apiKey);

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;background:#0f0e0c;padding:32px;color:#efe9dd;">
    <div style="max-width:440px;margin:0 auto;">
      <h1 style="font-family:Georgia,serif;font-style:italic;font-size:22px;margin:0 0 24px;color:#efe9dd;">Visionary Sound Productions</h1>
      <p style="margin:0 0 8px;color:#b8b1a3;font-size:14px;">Your sign-in code:</p>
      <div style="font-size:40px;font-weight:600;letter-spacing:10px;color:#efe9dd;margin:0 0 24px;">${code}</div>
      <p style="margin:0;color:#7a7468;font-size:13px;line-height:1.5;">
        Enter this code on the sign-in page. It expires in 10 minutes and can be used once.
        If you didn't request it, you can ignore this email.
      </p>
    </div>
  </div>`;

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: 'Your Visionary Sound Productions sign-in code',
    html,
    text: `Your Visionary Sound Productions sign-in code is ${code}. It expires in 10 minutes and can be used once.`,
  });

  if (error) console.error('[auth] sendLoginCode:', error);
}
