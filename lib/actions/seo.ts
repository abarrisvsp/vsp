// lib/actions/seo.ts
'use server';
import { createServiceClient, createAnonClient } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { SeoSettings } from '@/lib/types';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error('Unauthorized');
}

export async function getSeoSettings(route: string): Promise<SeoSettings | null> {
  const supabase = createAnonClient();
  const { data } = await supabase
    .from('seo_settings')
    .select('*')
    .eq('route', route)
    .maybeSingle();
  return (data as SeoSettings | null) ?? null;
}

export async function getAllSeoSettings(): Promise<SeoSettings[]> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('seo_settings')
    .select('*')
    .order('route');
  if (error) throw error;
  return (data as SeoSettings[]) ?? [];
}

export async function updateSeoSettings(
  route: string,
  fields: Partial<Omit<SeoSettings, 'route' | 'updated_at'>>
): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('seo_settings')
    .upsert(
      { route, ...fields, updated_at: new Date().toISOString() },
      { onConflict: 'route' }
    );
  if (error) throw error;
  revalidatePath(route);
}

export async function deleteSeoSettings(route: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from('seo_settings').delete().eq('route', route);
  if (error) throw error;
  revalidatePath(route);
}
