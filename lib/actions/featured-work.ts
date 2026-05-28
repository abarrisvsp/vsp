'use server';
import { createServiceClient, createAnonClient } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { slugify } from '@/lib/slugify';
import type { FeaturedWork } from '@/lib/types';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error('Unauthorized');
}

export async function getAllFeaturedWork(): Promise<FeaturedWork[]> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('featured_work')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return (data as FeaturedWork[]) ?? [];
}

export async function getPublishedFeaturedWork(): Promise<FeaturedWork[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('featured_work')
    .select('*')
    .eq('published', true)
    .order('sort_order');
  if (error) return [];
  return (data as FeaturedWork[]) ?? [];
}

export async function getFeaturedWorkBySlug(slug: string): Promise<FeaturedWork | null> {
  const supabase = createAnonClient();
  const { data } = await supabase
    .from('featured_work')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();
  return (data as FeaturedWork | null) ?? null;
}

export async function getFeaturedWorkById(id: string): Promise<FeaturedWork | null> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('featured_work')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return (data as FeaturedWork | null) ?? null;
}

async function generateUniqueSlug(headline: string, supabase: ReturnType<typeof createServiceClient>): Promise<string> {
  const base = slugify(headline);
  let candidate = base;
  let suffix = 2;
  while (true) {
    const { data } = await supabase
      .from('featured_work')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${suffix++}`;
  }
}

export async function createFeaturedWork(fields: Partial<FeaturedWork>): Promise<FeaturedWork> {
  await requireAdmin();
  const supabase = createServiceClient();
  const slug = await generateUniqueSlug(fields.headline ?? 'untitled', supabase);
  const { data: last } = await supabase
    .from('featured_work')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = ((last as { sort_order: number } | null)?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from('featured_work')
    .insert({
      slug,
      headline: fields.headline ?? 'Untitled',
      event_type: fields.event_type ?? null,
      client_name: fields.client_name ?? null,
      venue: fields.venue ?? null,
      event_date: fields.event_date ?? null,
      guest_count: fields.guest_count ?? null,
      cover_image_url: fields.cover_image_url ?? null,
      cover_storage_path: fields.cover_storage_path ?? null,
      body_html: fields.body_html ?? '',
      gallery_photo_ids: fields.gallery_photo_ids ?? [],
      sort_order,
      published: fields.published ?? false,
    })
    .select()
    .single();
  if (error) throw error;
  revalidatePath('/portfolio');
  return data as FeaturedWork;
}

export async function updateFeaturedWork(id: string, fields: Partial<FeaturedWork>): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  // Capture slug before stripping (slug is immutable — not written to DB, but needed for cache revalidation)
  const existingSlug = fields.slug;
  const { slug: _slug, ...safeFields } = fields;
  const { error } = await supabase
    .from('featured_work')
    .update({ ...safeFields, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
  revalidatePath('/portfolio');
  if (existingSlug) revalidatePath(`/portfolio/${existingSlug}`);
}

export async function deleteFeaturedWork(id: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from('featured_work').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/portfolio');
}

export async function reorderFeaturedWork(orderedIds: string[]): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  await Promise.all(
    orderedIds.map((id, i) =>
      supabase.from('featured_work').update({ sort_order: i }).eq('id', id)
    )
  );
  revalidatePath('/portfolio');
}
