// lib/actions/media.ts
'use server';
import { createServiceClient } from '@/lib/supabase';
import { auth } from '@/lib/auth';
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
      if (!item.name || item.name.endsWith('/')) continue;
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
      });
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
