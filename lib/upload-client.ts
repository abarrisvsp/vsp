'use client';

import { uploadImage } from '@/lib/actions/upload';
import { prepareImageForUpload } from '@/lib/image-resize';

/** Must stay at or below `serverActions.bodySizeLimit` in next.config.mjs. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const mb = (bytes: number) => (bytes / 1024 / 1024).toFixed(1);

/**
 * Shrinks an image in the browser, then uploads it. Every admin upload path goes
 * through here so the size handling and error messages stay identical.
 */
export async function uploadImageFile(
  file: File,
  folder: string,
): Promise<{ publicUrl: string; path: string; size: number; width: number; height: number }> {
  const prepared = await prepareImageForUpload(file, MAX_UPLOAD_BYTES);
  if (prepared.file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `Still ${mb(prepared.file.size)} MB after resizing — the limit is ${mb(MAX_UPLOAD_BYTES)} MB. Try saving it as a JPEG first.`,
    );
  }
  const fd = new FormData();
  fd.append('file', prepared.file);
  fd.append('folder', folder);
  const { publicUrl, path } = await uploadImage(fd);
  return { publicUrl, path, size: prepared.file.size, width: prepared.width, height: prepared.height };
}

/** Pre-resize ceiling for file pickers. Anything larger is unlikely to be a web photo. */
export const MAX_SOURCE_BYTES = 50 * 1024 * 1024;

/** Message to show the user when an upload fails. */
export function uploadErrorMessage(err: unknown): string {
  return err instanceof Error && err.message ? err.message : 'Upload failed';
}
