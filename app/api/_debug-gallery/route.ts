import { NextResponse } from 'next/server';
import { createAnonClient, createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const anon = createAnonClient();
  const service = createServiceClient();
  const anonResult = await anon.from('gallery_photos').select('id, active, category').limit(10);
  const serviceResult = await service.from('gallery_photos').select('id, active, category').limit(10);
  return NextResponse.json({
    env: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKeyPrefix: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').slice(0, 20),
      serviceKeyPrefix: (process.env.SUPABASE_SERVICE_ROLE_KEY || '').slice(0, 20),
    },
    anon: { data: anonResult.data, error: anonResult.error },
    service: { data: serviceResult.data, error: serviceResult.error },
  });
}
