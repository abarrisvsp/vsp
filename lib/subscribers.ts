import { createServiceClient } from '@/lib/supabase';
import type { Subscriber } from '@/lib/types';

/**
 * Every active subscriber. Supabase returns at most 1,000 rows per request, so
 * this reads in pages instead of trusting a single select to get them all.
 *
 * Deliberately NOT in a 'use server' file: anything exported from one becomes a
 * publicly callable endpoint. Callers must check admin access themselves.
 */
export async function fetchAllActiveSubscribers(): Promise<Subscriber[]> {
  const supabase = createServiceClient();
  const pageSize = 1000;
  const all: Subscriber[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .eq('active', true)
      .order('subscribed_at', { ascending: false })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    const rows = (data as Subscriber[]) ?? [];
    all.push(...rows);
    if (rows.length < pageSize) return all;
  }
}

/**
 * Public newsletter signup. Lives here rather than in a 'use server' file so it
 * can only be reached through /api/subscribe, which runs the bot checks first.
 */
export async function addPublicSubscriber(
  emailRaw: string,
  firstName?: string,
  lastName?: string,
): Promise<{ success: boolean; message: string }> {
  const email = (emailRaw || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: 'Please enter a valid email.' };
  }
  const supabase = createServiceClient();
  const { data: existing } = await supabase
    .from('subscribers')
    .select('id, active')
    .eq('email', email)
    .maybeSingle();
  if (existing?.active) return { success: true, message: "You're already subscribed. Thanks!" };
  if (existing) {
    await supabase.from('subscribers').update({ active: true, unsubscribed_at: null }).eq('id', existing.id);
    return { success: true, message: "Welcome back, you're subscribed again." };
  }
  const { error } = await supabase.from('subscribers').insert({
    email,
    first_name: firstName?.trim() || null,
    last_name: lastName?.trim() || null,
    active: true,
    source: 'website_signup',
  });
  if (error) {
    console.error('subscribe insert failed', error);
    return { success: false, message: 'Something went wrong. Try again?' };
  }
  return { success: true, message: 'Subscribed. Thank you!' };
}
