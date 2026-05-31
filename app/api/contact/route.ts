import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { sendContactNotification } from '@/lib/email/notification';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Honeypot: a filled hidden field means a bot. Pretend success, save nothing.
    if (typeof body.hp === 'string' && body.hp.trim() !== '') {
      return NextResponse.json({ success: true });
    }

    const full_name = (body.full_name || '').trim();
    const email = (body.email || '').trim();
    if (!full_name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email.' }, { status: 400 });
    }

    // reCAPTCHA v2 verification. Enforced only when RECAPTCHA_SECRET_KEY is set, so
    // the form keeps working before the secret is configured in the environment.
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (recaptchaSecret) {
      const token = typeof body.recaptchaToken === 'string' ? body.recaptchaToken : '';
      if (!token) {
        return NextResponse.json({ error: 'Please complete the reCAPTCHA.' }, { status: 400 });
      }
      try {
        const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ secret: recaptchaSecret, response: token }).toString(),
        });
        const verify = await verifyRes.json();
        if (!verify.success) {
          console.warn('reCAPTCHA failed', verify['error-codes']);
          return NextResponse.json({ error: 'reCAPTCHA check failed. Please try again.' }, { status: 400 });
        }
      } catch (e) {
        // Google unreachable: fail open so a real lead is never lost to an outage.
        // The honeypot still provides a layer of bot protection.
        console.error('reCAPTCHA verify error (allowing submission)', e);
      }
    }

    const submission = {
      full_name,
      email,
      phone: body.phone || null,
      event_type: body.event_type || null,
      services_needed: Array.isArray(body.services_needed) ? body.services_needed : null,
      event_date: body.event_date || null,
      date_flexible: !!body.date_flexible,
      headcount: body.headcount || null,
      venue_city: body.venue_city || null,
      budget_range: body.budget_range || null,
      preferred_contact: body.preferred_contact || null,
      message: body.message || null,
    };

    const supabase = createServiceClient();
    const { error } = await supabase.from('contact_submissions').insert(submission);
    if (error) {
      console.error('DB insert failed', error);
      return NextResponse.json({ error: 'Could not save submission.' }, { status: 500 });
    }

    try {
      await sendContactNotification(submission);
    } catch (e) {
      console.error('Email failed (submission still saved)', e);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 });
  }
}
