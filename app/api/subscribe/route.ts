import { NextResponse } from 'next/server';
import { subscribeEmail } from '@/lib/actions/subscribers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await subscribeEmail(body.email, body.first_name, body.last_name);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: result.message });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
