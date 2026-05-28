// lib/actions/faqs.ts
'use server';
import { createServiceClient, createAnonClient } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { Faq } from '@/lib/types';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error('Unauthorized');
}

/** Public — used by service pages */
export async function getFaqsByPage(page: string): Promise<Faq[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('page', page)
    .eq('active', true)
    .order('sort_order');
  if (error) return [];
  return (data as Faq[]) ?? [];
}

/** Admin — all FAQs for a page (including inactive) */
export async function getAllFaqsByPage(page: string): Promise<Faq[]> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('page', page)
    .order('sort_order');
  if (error) throw error;
  return (data as Faq[]) ?? [];
}

export async function createFaq(fields: {
  page: string;
  question: string;
  answer: string;
  sort_order: number;
}): Promise<Faq> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('faqs')
    .insert({ ...fields, active: true, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  revalidatePath(`/${fields.page === 'general' ? '' : fields.page}`);
  return data as Faq;
}

export async function updateFaq(id: string, fields: Partial<Faq>): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('faqs')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteFaq(id: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from('faqs').delete().eq('id', id);
  if (error) throw error;
}

export async function reorderFaqs(page: string, orderedIds: string[]): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  await Promise.all(
    orderedIds.map((id, i) =>
      supabase.from('faqs').update({ sort_order: i }).eq('id', id)
    )
  );
  revalidatePath(`/${page === 'general' ? '' : page}`);
}
