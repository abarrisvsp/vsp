'use server';
import { createServiceClient } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import type { Subscriber } from '@/lib/types';
import { fetchAllActiveSubscribers } from '@/lib/subscribers';

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

export async function getAllActiveSubscribersForAdmin(): Promise<Subscriber[]> {
  await requireAdmin();
  return fetchAllActiveSubscribers();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (v: string | undefined) => (v ?? '').trim() || null;

export type AddSubscriberResult =
  | { status: 'added'; subscriber: Subscriber }
  | { status: 'exists' }
  | { status: 'unsubscribed'; unsubscribedAt: string | null }
  | { status: 'error'; message: string };

/**
 * Adds someone to the list by hand. A person who previously unsubscribed is
 * only re-added when `resubscribe` is set, so the admin has to confirm they
 * actually asked to rejoin. Errors are returned, not thrown, because thrown
 * server action messages are hidden in production.
 */
export async function addSubscriberByAdmin(input: {
  email: string;
  firstName?: string;
  lastName?: string;
  resubscribe?: boolean;
}): Promise<AddSubscriberResult> {
  await requireAdmin();
  const email = (input.email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { status: 'error', message: 'That email address doesn\'t look valid.' };
  const firstName = clean(input.firstName);
  const lastName = clean(input.lastName);

  const supabase = createServiceClient();
  const { data: existing } = await supabase
    .from('subscribers')
    .select('id, active, unsubscribed_at')
    .eq('email', email)
    .maybeSingle();

  if (existing?.active) return { status: 'exists' };
  if (existing && !input.resubscribe) {
    return { status: 'unsubscribed', unsubscribedAt: existing.unsubscribed_at ?? null };
  }

  const query = existing
    ? supabase
        .from('subscribers')
        .update({ active: true, unsubscribed_at: null, first_name: firstName, last_name: lastName })
        .eq('id', existing.id)
    : supabase
        .from('subscribers')
        .insert({ email, first_name: firstName, last_name: lastName, active: true, source: 'admin' });
  const { data, error } = await query.select('*').single();
  if (error || !data) {
    console.error('addSubscriberByAdmin failed', error);
    return { status: 'error', message: 'Could not save that subscriber. Try again?' };
  }
  return { status: 'added', subscriber: data as Subscriber };
}

export async function updateSubscriberByAdmin(
  id: string,
  input: { email: string; firstName?: string; lastName?: string },
): Promise<{ ok: true; subscriber: Subscriber } | { ok: false; message: string }> {
  await requireAdmin();
  const email = (input.email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false, message: 'That email address doesn\'t look valid.' };

  const supabase = createServiceClient();
  const { data: clash } = await supabase
    .from('subscribers')
    .select('id')
    .eq('email', email)
    .neq('id', id)
    .maybeSingle();
  if (clash) return { ok: false, message: 'Another subscriber already uses that email.' };

  const { data, error } = await supabase
    .from('subscribers')
    .update({ email, first_name: clean(input.firstName), last_name: clean(input.lastName) })
    .eq('id', id)
    .select('*')
    .single();
  if (error || !data) {
    console.error('updateSubscriberByAdmin failed', error);
    return { ok: false, message: 'Could not save those changes. Try again?' };
  }
  return { ok: true, subscriber: data as Subscriber };
}

export async function getSubscribersThisMonth(): Promise<number> {
  await requireAdmin();
  const supabase = createServiceClient();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const { count } = await supabase
    .from('subscribers')
    .select('*', { count: 'exact', head: true })
    .eq('active', true)
    .gte('subscribed_at', startOfMonth.toISOString());
  return count ?? 0;
}

export async function deleteSubscriberByAdmin(id: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('subscribers')
    .update({ active: false, unsubscribed_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function exportSubscribersCSV(): Promise<string> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('subscribers')
    .select('email, first_name, last_name, subscribed_at, source')
    .eq('active', true)
    .order('subscribed_at', { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as Pick<Subscriber, 'email' | 'first_name' | 'last_name' | 'subscribed_at' | 'source'>[];
  const header = 'email,first_name,last_name,subscribed_at,source';
  const lines = rows.map((r) =>
    [r.email, r.first_name ?? '', r.last_name ?? '', r.subscribed_at, r.source ?? '']
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  );
  return [header, ...lines].join('\n');
}

export async function saveNewsletterSettings(fields: {
  headline: string;
  subtext: string;
  showHomepage: boolean;
  showBlog: boolean;
}): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const updates = [
    { key: 'newsletter_headline', value: fields.headline },
    { key: 'newsletter_subtext', value: fields.subtext },
    { key: 'newsletter_show_homepage', value: fields.showHomepage ? 'true' : 'false' },
    { key: 'newsletter_show_blog', value: fields.showBlog ? 'true' : 'false' },
  ];
  await Promise.all(
    updates.map(({ key, value }) =>
      supabase
        .from('site_content')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    )
  );
}
