// lib/actions/media.ts
'use server';
import { createServiceClient } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { normalizeTags } from '@/lib/event-tags';
import type { MediaFile } from '@/lib/types';

const BUCKET = 'vsp-media';
const FOLDERS = ['gallery', 'blog', 'services', 'featured-work', 'seo', 'misc'];

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error('Unauthorized');
}

export async function getMediaFiles(): Promise<MediaFile[]> {
  await requireAdmin();
  const supabase = createServiceClient();

  const results = await Promise.all(
    FOLDERS.map((folder) =>
      supabase.storage
        .from(BUCKET)
        .list(folder, { limit: 500, sortBy: { column: 'created_at', order: 'desc' } })
        .then(({ data, error }) => ({ folder, data, error }))
    )
  );

  const files: MediaFile[] = [];
  for (const { folder, data, error } of results) {
    if (error || !data) continue;

    for (const item of data) {
      // Supabase Storage .list() returns sub-folders as entries with id === null and no
      // metadata. Skip them (and trailing-slash names) so folders don't render as broken images.
      if (!item.name || item.name.endsWith('/') || item.id === null) continue;
      const path = `${folder}/${item.name}`;
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const meta = item.metadata as { size?: number; width?: number; height?: number; category?: string } | undefined;
      files.push({
        name: item.name,
        path,
        publicUrl: pub.publicUrl,
        size: meta?.size ?? 0,
        width: meta?.width ?? null,
        height: meta?.height ?? null,
        category: meta?.category ?? folder,
        createdAt: item.created_at ?? '',
        onSite: false,
        eventTags: [],
      });
    }
  }

  // Merge each file's publication state from the public gallery table.
  const paths = files.map((f) => f.path);
  if (paths.length) {
    const { data: rows } = await supabase
      .from('gallery_photos')
      .select('storage_path, active, event_tags')
      .in('storage_path', paths);

    const byPath = new Map<string, { active: boolean; event_tags: string[] }>();
    for (const row of rows ?? []) {
      byPath.set(row.storage_path, { active: !!row.active, event_tags: row.event_tags ?? [] });
    }
    for (const f of files) {
      const row = byPath.get(f.path);
      if (row) {
        f.onSite = row.active;
        f.eventTags = row.event_tags;
      }
    }
  }

  return files;
}

export async function deleteMedia(storagePath: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);
  if (error) throw error;
}

/**
 * Publish/unpublish a media file to the public gallery and set its event-type tags.
 * onSite=true upserts an active gallery_photos row; onSite=false hides it (keeps caption/order).
 */
export async function setMediaPublication(
  file: { path: string; publicUrl: string },
  opts: { onSite: boolean; eventTags: string[] },
): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const tags = normalizeTags(opts.eventTags);

  const { data: existing } = await supabase
    .from('gallery_photos')
    .select('id')
    .eq('storage_path', file.path)
    .maybeSingle();

  if (opts.onSite) {
    const category = tags[0] ?? 'general'; // category column is NOT NULL; tags are the source of truth
    if (existing?.id) {
      const { error } = await supabase
        .from('gallery_photos')
        .update({ event_tags: tags, category, active: true })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('gallery_photos').insert({
        storage_path: file.path,
        public_url: file.publicUrl,
        category,
        event_tags: tags,
        active: true,
        sort_order: 99,
      });
      if (error) throw error;
    }
  } else if (existing?.id) {
    const { error } = await supabase
      .from('gallery_photos')
      .update({ active: false })
      .eq('id', existing.id);
    if (error) throw error;
  }

  revalidatePath('/gallery');
  revalidatePath('/admin/media');
}
