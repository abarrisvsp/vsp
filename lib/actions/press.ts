'use server';
import { createServiceClient, createAnonClient } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { PressLogo } from '@/lib/types';

export async function getPressLogos(): Promise<PressLogo[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('press_logos')
    .select('*')
    .eq('active', true)
    .order('sort_order');
  if (error) throw error;
  return (data as PressLogo[]) ?? [];
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error('Unauthorized');
}

export async function createPressLogo(fields: Partial<PressLogo>): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from('press_logos').insert({
    name: fields.name ?? 'Untitled',
    logo_url: fields.logo_url ?? null,
    storage_path: fields.storage_path ?? null,
    link_url: fields.link_url ?? null,
    sort_order: fields.sort_order ?? 99,
    active: fields.active ?? true,
  });
  if (error) throw error;
  revalidatePath('/');
}

export async function updatePressLogo(id: string, fields: Partial<PressLogo>): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from('press_logos').update(fields).eq('id', id);
  if (error) throw error;
  revalidatePath('/');
}

export async function deletePressLogo(id: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from('press_logos').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/');
}
