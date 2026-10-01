'use server';
import { createServiceClient } from '@/lib/supabase';
import { auth } from '@/lib/auth';

export async function uploadImage(formData: FormData): Promise<{ publicUrl: string; path: string }> {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error('Unauthorized');

  const file = formData.get('file') as File | null;
  const folder = (formData.get('folder') as string) || 'misc';
  if (!file) throw new Error('No file provided');
  // Callers downscale in the browser and check the size first (lib/upload-client.ts).
  // This mirrors serverActions.bodySizeLimit as a backstop for any direct call.
  if (file.size > 4 * 1024 * 1024) throw new Error('File too large (>4MB)');

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
