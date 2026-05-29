import { Resend } from 'resend';

// Use the unrestricted dev address until the user verifies visionarysoundproductions.com in Resend.
// Override at any time by setting RESEND_FROM in env.
const FROM = process.env.RESEND_FROM || 'VSP Website <onboarding@resend.dev>';

export async function sendContactNotification(data: {
  full_name: string;
  email: string;
  phone?: string | null;
  event_type?: string | null;
  services_needed?: string[] | null;
  event_date?: string | null;
  date_flexible?: boolean;
  headcount?: string | null;
  venue_city?: string | null;
  budget_range?: string | null;
  preferred_contact?: string | null;
  message?: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set; skipping email notification.');
    return;
  }
  const to = process.env.ADMIN_EMAIL;
  if (!to) {
    console.warn('ADMIN_EMAIL not set; skipping email notification.');
    return;
  }

  const resend = new Resend(apiKey);

  const row = (label: string, val: unknown) =>
    val
      ? `<tr><td style="padding:6px 14px 6px 0;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:.05em;">${label}</td><td style="padding:6px 0;color:#111;font-size:14px;">${Array.isArray(val) ? val.join(', ') : val}</td></tr>`
      : '';

  const html = `
    <div style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;background:#fff;color:#111;">
      <div style="padding:24px;border-bottom:3px solid #ef4444;">
        <p style="margin:0;font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:#999;">VSP Website Inquiry</p>
        <h1 style="margin:8px 0 0;font-family:serif;font-style:italic;font-size:28px;">${data.full_name}</h1>
      </div>
      <table style="width:100%;padding:24px;border-collapse:collapse;">
        ${row('Email', `<a href="mailto:${data.email}">${data.email}</a>`)}
        ${row('Phone', data.phone ? `<a href="tel:${data.phone}">${data.phone}</a>` : null)}
        ${row('Preferred contact', data.preferred_contact)}
        ${row('Event type', data.event_type)}
        ${row('Services', data.services_needed)}
        ${row('Date', data.event_date ? `${data.event_date}${data.date_flexible ? ' (flexible)' : ''}` : null)}
        ${row('Headcount', data.headcount)}
        ${row('Venue / city', data.venue_city)}
        ${row('Budget', data.budget_range)}
        ${data.message ? `<tr><td colspan="2" style="padding:18px 0;border-top:1px solid #eee;"><p style="margin:0 0 6px;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:.05em;">Message</p><p style="margin:0;color:#111;font-size:14px;line-height:1.55;white-space:pre-wrap;">${data.message}</p></td></tr>` : ''}
      </table>
    </div>
  `;

  await resend.emails.send({
    from: FROM,
    to,
    replyTo: data.email,
    subject: `New inquiry: ${data.full_name}${data.event_type ? ` · ${data.event_type}` : ''}`,
    html,
  });
}
