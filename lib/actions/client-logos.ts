'use server';
import { createServiceClient, createAnonClient } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { ClientLogo } from '@/lib/types';

export async function getClientLogos(): Promise<ClientLogo[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('client_logos')
    .select('*')
    .eq('active', true)
    .order('sort_order');
  // Soft-fail: if the 005_client_logos migration has not been applied yet, the
  // table is missing. Return [] so the homepage still renders (the section
  // hides itself when empty) instead of throwing.
  if (error) {
    console.warn('[client-logos] getClientLogos:', error.message);
    return [];
  }
  return (data as ClientLogo[]) ?? [];
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error('Unauthorized');
}

export async function createClientLogo(fields: Partial<ClientLogo>): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from('client_logos').insert({
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

export async function updateClientLogo(id: string, fields: Partial<ClientLogo>): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from('client_logos').update(fields).eq('id', id);
  if (error) throw error;
  revalidatePath('/');
}

export async function deleteClientLogo(id: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from('client_logos').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/');
}
