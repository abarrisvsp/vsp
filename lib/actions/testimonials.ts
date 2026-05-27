'use server';
import { createServiceClient, createAnonClient } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { Testimonial } from '@/lib/types';

export async function getTestimonials(): Promise<Testimonial[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('active', true)
    .order('sort_order');
  if (error) throw error;
  return (data as Testimonial[]) ?? [];
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error('Unauthorized');
}

export async function createTestimonial(fields: Partial<Testimonial>): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from('testimonials').insert({
    quote: fields.quote ?? '',
    attribution_name: fields.attribution_name ?? null,
    attribution_context: fields.attribution_context ?? null,
    sort_order: fields.sort_order ?? 99,
    active: fields.active ?? true,
  });
  if (error) throw error;
  revalidatePath('/');
}

export async function updateTestimonial(id: string, fields: Partial<Testimonial>): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('testimonials')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
  revalidatePath('/');
}

export async function deleteTestimonial(id: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from('testimonials').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/');
}
