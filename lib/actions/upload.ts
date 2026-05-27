'use server';
import { createServiceClient } from '@/lib/supabase';
import { auth } from '@/lib/auth';

export async function uploadImage(formData: FormData): Promise<{ publicUrl: string; path: string }> {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error('Unauthorized');

  const file = formData.get('file') as File | null;
  const folder = (formData.get('folder') as string) || 'misc';
  if (!file) throw new Error('No file provided');
  if (file.size > 10 * 1024 * 1024) throw new Error('File too large (>10MB)');

  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `${folder.replace(/^\/+|\/+$/g, '')}/${filename}`;

  const supabase = createServiceClient();
  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from('vsp-media')
    .upload(path, arrayBuffer, { contentType: file.type, cacheControl: '31536000' });
  if (uploadError) throw uploadError;

  const { data: pub } = supabase.storage.from('vsp-media').getPublicUrl(path);
  return { publicUrl: pub.publicUrl, path };
}
