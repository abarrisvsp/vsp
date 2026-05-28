'use client';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadImage } from '@/lib/actions/upload';
import { createGalleryPhoto } from '@/lib/actions/gallery';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

export function GalleryUploader({ categories }: { categories: string[] }) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (accepted: File[]) => {
    setUploading(true);
    try {
      for (const file of accepted) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('folder', 'gallery');
        const { publicUrl, path } = await uploadImage(fd);
        await createGalleryPhoto({
          public_url: publicUrl,
          storage_path: path,
          category: categories[0] || 'general',
          title: file.name.replace(/\.[^.]+$/, ''),
          sort_order: 999,
          active: true,
        });
      }
      toast.success(`Uploaded ${accepted.length} photo(s)`);
      setOpen(false);
    } catch (e) {
      console.error(e);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  }, [categories]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] },
    maxSize: 10 * 1024 * 1024,
    multiple: true,
  });

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-brand text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label="Upload photos"
      >
        <Plus className="w-6 h-6" />
      </button>
      {open && (
        <div className="fixed inset-0 z-[10001] bg-black/70 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-bg-elev border border-line rounded-lg max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif italic text-2xl mb-4">Upload photos</h3>
            <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${isDragActive ? 'border-brand bg-brand/10' : 'border-line hover:border-brand/50'}`}>
              <input {...getInputProps()} />
              <p className="text-ink-dim text-sm">{isDragActive ? 'Drop the photos…' : 'Drag & drop multiple photos, or click to browse'}</p>
              <p className="text-ink-mute text-xs mt-2">JPG, PNG, WebP · Max 10MB each</p>
              {uploading && <p className="text-brand text-sm mt-4">Uploading…</p>}
            </div>
            <button onClick={() => setOpen(false)} className="mt-4 text-sm text-ink-mute hover:text-ink">Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}
