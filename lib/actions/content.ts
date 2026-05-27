'use server';
import { createAnonClient, createServiceClient } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Public read — fetches multiple site_content keys.
 * Returns a map of key → value (missing keys map to empty string).
 */
export async function getSiteContent(keys: string[]): Promise<Record<string, string>> {
  const supabase = createAnonClient();
  const { data, error } = await supabase.from('site_content').select('key, value').in('key', keys);
  if (error) throw error;
  const map: Record<string, string> = {};
  for (const key of keys) map[key] = '';
  for (const row of data ?? []) {
    map[row.key] = row.value ?? '';
  }
  return map;
}

/**
 * Auth-guarded upsert.
 * @param path optional pathname to revalidate after save
 */
export async function updateSiteContent(key: string, value: string, path?: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error('Unauthorized');

  const supabase = createServiceClient();
  const { error } = await supabase
    .from('site_content')
    .upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;

  if (path) revalidatePath(path);
  // Always revalidate root since content keys may be used on any page
  revalidatePath('/');
}
