'use server';
import { createServiceClient } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import type { Subscriber } from '@/lib/types';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error('Unauthorized');
}

export async function subscribeEmail(
  email: string,
  firstName?: string,
  lastName?: string
): Promise<{ success: boolean; message: string }> {
  email = (email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: 'Please enter a valid email.' };
  }
  const supabase = createServiceClient();
  // Check if already exists
  const { data: existing } = await supabase
    .from('subscribers')
    .select('id, active')
    .eq('email', email)
    .maybeSingle();
  if (existing) {
    if (existing.active) {
      return { success: true, message: "You're already subscribed — thanks!" };
    }
    // Reactivate
    await supabase
      .from('subscribers')
      .update({ active: true, unsubscribed_at: null })
      .eq('id', existing.id);
    return { success: true, message: 'Welcome back — re-subscribed.' };
  }
  const { error } = await supabase.from('subscribers').insert({
    email,
    first_name: firstName || null,
    last_name: lastName || null,
    active: true,
    source: 'website_signup',
  });
  if (error) {
    console.error('subscribe insert failed', error);
    return { success: false, message: 'Something went wrong. Try again?' };
  }
  return { success: true, message: 'Subscribed — thank you!' };
}

export async function unsubscribeByToken(
  token: string
): Promise<{ success: boolean; email?: string }> {
  if (!token || !/^[a-f0-9-]{36}$/.test(token)) return { success: false };
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('subscribers')
    .update({ active: false, unsubscribed_at: new Date().toISOString() })
    .eq('unsubscribe_token', token)
    .select('email')
    .maybeSingle();
  if (error || !data) return { success: false };
  return { success: true, email: data.email };
}

export async function getSubscriberCount(): Promise<number> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { count } = await supabase
    .from('subscribers')
    .select('*', { count: 'exact', head: true })
    .eq('active', true);
  return count ?? 0;
}

export async function getActiveSubscribers(): Promise<Subscriber[]> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('subscribers')
    .select('*')
    .eq('active', true)
    .order('subscribed_at', { ascending: false });
  if (error) throw error;
  return (data as Subscriber[]) ?? [];
}
