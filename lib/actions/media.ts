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
  const files: MediaFile[] = [];

  for (const folder of FOLDERS) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(folder, { limit: 500, sortBy: { column: 'created_at', order: 'desc' } });

    if (error || !data) continue;

    for (const item of data) {
      if (!item.name || item.name.endsWith('/')) continue; // skip folders
      const path = `${folder}/${item.name}`;
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      files.push({
        name: item.name,
        path,
        publicUrl: pub.publicUrl,
        size: (item.metadata as any)?.size ?? 0,
        width: (item.metadata as any)?.width ?? null,
        height: (item.metadata as any)?.height ?? null,
        category: (item.metadata as any)?.category ?? folder,
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
