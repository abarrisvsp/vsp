'use server';
import { createServiceClient, createAnonClient } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { GalleryPhoto } from '@/lib/types';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error('Unauthorized');
}

export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('gallery_photos')
    .select('*')
    .eq('active', true)
    .order('sort_order');
  if (error) throw error;
  return (data as GalleryPhoto[]) ?? [];
}

export async function createGalleryPhoto(fields: Partial<GalleryPhoto>): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from('gallery_photos').insert({
    storage_path: fields.storage_path ?? '',
    public_url: fields.public_url ?? '',
    category: fields.category ?? 'general',
    event_tags: fields.event_tags ?? (fields.category ? [fields.category] : []),
    title: fields.title ?? null,
    caption: fields.caption ?? null,
    alt_text: fields.alt_text ?? null,
    sort_order: fields.sort_order ?? 99,
    active: fields.active ?? true,
  });
  if (error) throw error;
  revalidatePath('/gallery');
}

export async function updateGalleryPhoto(id: string, fields: Partial<GalleryPhoto>): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from('gallery_photos').update(fields).eq('id', id);
  if (error) throw error;
  revalidatePath('/gallery');
}

export async function deleteGalleryPhoto(id: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data: existing } = await supabase
    .from('gallery_photos')
    .select('storage_path')
    .eq('id', id)
    .single();
  await supabase.from('gallery_photos').delete().eq('id', id);
  if (existing?.storage_path) {
    await supabase.storage.from('vsp-media').remove([existing.storage_path]);
  }
  revalidatePath('/gallery');
}

export async function reorderGalleryPhotos(orderedIds: string[]): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase.from('gallery_photos').update({ sort_order: i + 1 }).eq('id', orderedIds[i]);
  }
  revalidatePath('/gallery');
}
