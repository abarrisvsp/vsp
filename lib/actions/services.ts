'use server';
import { createServiceClient, createAnonClient } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { Service } from '@/lib/types';

export async function getServices(): Promise<Service[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('sort_order');
  if (error) throw error;
  return (data as Service[]) ?? [];
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error('Unauthorized');
}

export async function createService(fields: Partial<Service>): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from('services').insert({
    letter: fields.letter ?? null,
    title: fields.title ?? 'Untitled',
    description: fields.description ?? null,
    url: fields.url ?? null,
    sort_order: fields.sort_order ?? 99,
    active: fields.active ?? true,
  });
  if (error) throw error;
  revalidatePath('/');
}

export async function updateService(id: string, fields: Partial<Service>): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('services')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
  revalidatePath('/');
}

export async function deleteService(id: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/');
}
