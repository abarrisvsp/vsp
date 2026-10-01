'use client';

/** Long-edge cap for uploads — comfortably above any size the site displays. */
const MAX_EDGE = 2400;
/** Images already within MAX_EDGE and under this size are uploaded untouched. */
const RECODE_FLOOR = 900 * 1024;
/** Vector and animated formats would be destroyed by a canvas round-trip. */
const PASSTHROUGH = new Set(['image/svg+xml', 'image/gif']);

export type PreparedImage = { file: File; width: number; height: number };

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  // `from-image` applies the EXIF orientation tag. Without it the canvas draws the raw
  // sensor pixels and portrait phone photos come out sideways.
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return img;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

/**
 * Downscales an image in the browser and reports its final dimensions.
 *
 * Needed because an upload travels through a Next.js server action, whose request body
 * is capped (1 MB by default, ~4.5 MB on Vercel regardless of config). Raw camera and
 * phone photos run 3–15 MB, so without this step they fail before reaching the server.
 */
export async function prepareImageForUpload(file: File, maxBytes?: number): Promise<PreparedImage> {
  if (PASSTHROUGH.has(file.type)) return { file, width: 0, height: 0 };

  const source = await decode(file);
  const srcW = 'naturalWidth' in source ? source.naturalWidth : source.width;
  const srcH = 'naturalHeight' in source ? source.naturalHeight : source.height;

  const scale = Math.min(1, MAX_EDGE / Math.max(srcW, srcH));
  const width = Math.round(srcW * scale);
  const height = Math.round(srcH * scale);
  const release = () => {
    if ('close' in source) source.close();
  };

  if (scale === 1 && file.size <= RECODE_FLOOR) {
    release();
    return { file, width, height };
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    release();
    throw new Error('This browser could not process the image');
  }
  ctx.drawImage(source as CanvasImageSource, 0, 0, width, height);
  release();

  // WebP keeps transparency for logos and PNG exports; photos stay JPEG.
  const type = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/webp';
  const encode = (quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

  let blob = await encode(type === 'image/jpeg' ? 0.85 : 0.9);
  // Very fine-detailed images still land near the cap at normal quality, so drop
  // quality once rather than failing the upload outright.
  if (blob && maxBytes && blob.size > maxBytes * 0.9) blob = await encode(0.7);
  if (!blob) throw new Error('This browser could not process the image');

  // Re-encoding a small, already-optimized file can make it bigger.
  if (blob.size >= file.size && scale === 1) return { file, width, height };

  const ext = type === 'image/jpeg' ? 'jpg' : 'webp';
  const name = `${file.name.replace(/\.[^.]+$/, '')}.${ext}`;
  return { file: new File([blob], name, { type }), width, height };
}
