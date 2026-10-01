import { NextResponse } from 'next/server';
import { addPublicSubscriber } from '@/lib/subscribers';
import { verifyRecaptcha } from '@/lib/recaptcha';

const SUCCESS = 'Subscribed. Thank you!';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Honeypot: a filled hidden field means a bot. Pretend success, save nothing.
    if (typeof body.hp === 'string' && body.hp.trim() !== '') {
      return NextResponse.json({ success: true, message: SUCCESS });
    }

    const captcha = await verifyRecaptcha(body.recaptchaToken);
    if (captcha === 'missing') {
      return NextResponse.json({ error: "Please confirm you're not a robot." }, { status: 400 });
    }
    if (captcha === 'failed') {
      return NextResponse.json({ error: 'The robot check failed. Please try again.' }, { status: 400 });
    }
    // Unlike the contact form, fail closed: a missed signup costs little, and an
    // unchecked signup is exactly how the fake addresses got in.
    if (captcha === 'unavailable') {
      return NextResponse.json({ error: "We couldn't run the robot check. Please try again in a minute." }, { status: 503 });
    }

    const result = await addPublicSubscriber(body.email, body.first_name, body.last_name);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: result.message });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
