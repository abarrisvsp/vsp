'use client';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadImage } from '@/lib/actions/upload';
import { toast } from 'sonner';

interface ImageUploadModalProps {
  open: boolean;
  onClose: () => void;
  onUploaded: (publicUrl: string, storagePath: string) => void;
  folder: string;
}

export function ImageUploadModal({ open, onClose, onUploaded, folder }: ImageUploadModalProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  async function handleConfirm() {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', folder);
      const { publicUrl, path } = await uploadImage(fd);
      onUploaded(publicUrl, path);
      toast.success('Image uploaded');
      reset();
      onClose();
    } catch (e: unknown) {
      console.error(e);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function reset() {
    setFile(null);
    setPreview(null);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10001] bg-black/70 flex items-center justify-center p-4"
      onClick={() => { reset(); onClose(); }}
    >
      <div
        className="bg-bg-elev border border-line rounded-lg max-w-lg w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-serif italic text-2xl mb-4">Replace image</h3>

        {preview ? (
          <div className="space-y-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="w-full rounded border border-line" />
            <div className="flex gap-2 justify-end">
              <button
                onClick={reset}
                className="px-4 py-2 text-sm bg-neutral-700 text-white rounded hover:bg-neutral-600"
                disabled={uploading}
              >
                Choose different
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-500 disabled:opacity-50"
                disabled={uploading}
              >
                {uploading ? 'Uploading…' : 'Use this image'}
              </button>
            </div>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-brand bg-brand/10' : 'border-line hover:border-brand/50'
            }`}
          >
            <input {...getInputProps()} />
            <p className="text-ink-dim text-sm">
              {isDragActive ? 'Drop the image here…' : 'Drag & drop, or click to browse'}
            </p>
            <p className="text-ink-mute text-xs mt-2">JPG, PNG, WebP · Max 10MB</p>
          </div>
        )}

        <button
          onClick={() => { reset(); onClose(); }}
          className="mt-4 text-sm text-ink-mute hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
