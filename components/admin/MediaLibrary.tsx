// components/admin/MediaLibrary.tsx
'use client';

import { useState, useCallback, useTransition } from 'react';
import { useDropzone } from 'react-dropzone';
import { deleteMedia } from '@/lib/actions/media';
import { uploadImage } from '@/lib/actions/upload';
import { toast } from 'sonner';
import type { MediaFile } from '@/lib/types';

const CATEGORIES = ['All', 'gallery', 'blog', 'services', 'featured-work', 'seo', 'misc'];

interface Props {
  initialFiles: MediaFile[];
}

export function MediaLibrary({ initialFiles }: Props) {
  const [files, setFiles] = useState(initialFiles);
  const [selected, setSelected] = useState<MediaFile | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filtered = files.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || f.category === category;
    return matchSearch && matchCat;
  });

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);
  const totalMB = (totalSize / (1024 * 1024)).toFixed(1);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    for (const file of acceptedFiles) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', category === 'All' ? 'misc' : category);
      try {
        const { publicUrl, path } = await uploadImage(fd);
        if (!publicUrl) throw new Error('Upload succeeded but no public URL returned');
        const newFile: MediaFile = {
          name: path.split('/').pop() ?? file.name,
          path,
          publicUrl,
          size: file.size,
          width: null,
          height: null,
          category: category === 'All' ? 'misc' : category,
          createdAt: new Date().toISOString(),
        };
        setFiles((prev) => [newFile, ...prev]);
        toast.success(`Uploaded ${file.name}`);
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    setUploading(false);
  }, [category]);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxSize: 10 * 1024 * 1024,
    noClick: true,
  });

  function handleDelete() {
    if (!selected) return;
    if (!confirm(`Delete ${selected.name}?`)) return;
    startTransition(async () => {
      try {
        await deleteMedia(selected.path);
        setFiles((prev) => prev.filter((f) => f.path !== selected.path));
        setSelected(null);
        toast.success('Deleted');
      } catch {
        toast.error('Delete failed');
      }
    });
  }

  function copyUrl() {
    if (!selected) return;
    navigator.clipboard.writeText(selected.publicUrl);
    toast.success('URL copied');
  }

  return (
    <div {...getRootProps()} className="outline-none">
      <input {...getInputProps()} />

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button
          onClick={open}
          className="bg-amber text-bg text-sm font-medium px-4 py-2 rounded hover:opacity-90"
        >
          {uploading ? 'Uploading…' : '+ Upload'}
        </button>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search images…"
          className="bg-bg-elev border border-line rounded px-3 py-2 text-sm text-ink w-44"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-bg-elev border border-line text-ink text-sm rounded px-3 py-2"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <span className="ml-auto text-xs text-ink-mute">
          {files.length} images · {totalMB} MB used
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-6 gap-2 mb-4">
        {filtered.map((f) => (
          <button
            key={f.path}
            onClick={() => setSelected(f)}
            className={`aspect-square rounded overflow-hidden border-2 transition-colors ${
              selected?.path === f.path ? 'border-amber' : 'border-transparent hover:border-line'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.publicUrl} alt={f.name} className="w-full h-full object-cover" />
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-6 py-16 text-center text-sm text-ink-mute border border-dashed border-line rounded">
            No images found. Click Upload or drag files here.
          </div>
        )}
      </div>

      {/* Selected panel */}
      {selected && (
        <div className="border-t border-line pt-4 flex gap-4 items-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selected.publicUrl}
            alt={selected.name}
            className="w-16 h-16 object-cover rounded flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink truncate">{selected.name}</p>
            <p className="text-xs text-ink-mute mt-0.5">
              {selected.width && selected.height
                ? `${selected.width}×${selected.height} · `
                : ''}
              {(selected.size / 1024).toFixed(0)} KB
              {selected.createdAt
                ? ` · Uploaded ${new Date(selected.createdAt).toLocaleDateString()}`
                : ''}
            </p>
            <p className="text-xs text-ink-mute mt-0.5">
              Category: <span className="text-amber">{selected.category}</span>
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={copyUrl}
                className="border border-line text-ink-mute text-xs px-3 py-1.5 rounded hover:text-ink"
              >
                Copy URL
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="border border-line text-red-400 text-xs px-3 py-1.5 rounded hover:border-red-400 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
