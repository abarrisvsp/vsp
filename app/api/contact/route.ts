import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { sendContactNotification } from '@/lib/email/notification';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const full_name = (body.full_name || '').trim();
    const email = (body.email || '').trim();
    if (!full_name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email.' }, { status: 400 });
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
