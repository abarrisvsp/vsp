// components/admin/MediaLibrary.tsx
'use client';

import { useState, useCallback, useTransition } from 'react';
import { useDropzone } from 'react-dropzone';
import { deleteMedia } from '@/lib/actions/media';
import { uploadImageFile, uploadErrorMessage, MAX_SOURCE_BYTES } from '@/lib/upload-client';
import { toast } from 'sonner';
import type { MediaFile } from '@/lib/types';
import { MediaModal } from './MediaModal';

const CATEGORIES = ['All', 'gallery', 'blog', 'services', 'featured-work', 'seo', 'misc'];

interface Props {
  initialFiles: MediaFile[];
}

export function MediaLibrary({ initialFiles }: Props) {
  const [files, setFiles] = useState(initialFiles);
  const [selected, setSelected] = useState<MediaFile | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [eventTag, setEventTag] = useState('All');
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filtered = files.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || f.category === category;
    const matchTag = eventTag === 'All' || f.eventTags.some((t) => t.toLowerCase() === eventTag.toLowerCase());
    return matchSearch && matchCat && matchTag;
  });

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);
  const totalMB = (totalSize / (1024 * 1024)).toFixed(1);

  // The real categories actually in use across the library, de-duped case-insensitively
  // (keeping the most common spelling). This — not a fixed invented list — drives the
  // filter dropdown and the chips in the tag modal.
  const categoriesInUse = (() => {
    const counts = new Map<string, number>();
    files.forEach((f) => f.eventTags.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1)));
    const byLower = new Map<string, { label: string; n: number }>();
    counts.forEach((n, label) => {
      const key = label.toLowerCase();
      const cur = byLower.get(key);
      if (!cur || n > cur.n) byLower.set(key, { label, n });
    });
    return Array.from(byLower.values())
      .map((v) => v.label)
      .sort((a, b) => a.localeCompare(b));
  })();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    for (const file of acceptedFiles) {
      const folder = category === 'All' ? 'misc' : category;
      const toastId = toast.loading(`Uploading ${file.name}…`);
      try {
        const { publicUrl, path, size, width, height } = await uploadImageFile(file, folder);
        if (!publicUrl) throw new Error('Upload succeeded but no public URL returned');
        const newFile: MediaFile = {
          name: path.split('/').pop() ?? file.name,
          path,
          publicUrl,
          size,
          width: width || null,
          height: height || null,
          category: folder,
          createdAt: new Date().toISOString(),
          onSite: false,
          eventTags: [],
        };
        setFiles((prev) => [newFile, ...prev]);
        toast.success(`Uploaded ${file.name}`, { id: toastId });
      } catch (err) {
        toast.error(`${file.name}: ${uploadErrorMessage(err)}`, { id: toastId });
      }
    }
    setUploading(false);
  }, [category]);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    // Rejections used to be dropped silently, so oversized files just vanished.
    onDropRejected: (rejections) =>
      rejections.forEach((r) => toast.error(`${r.file.name}: ${r.errors[0]?.message ?? 'not accepted'}`)),
    accept: { 'image/*': [] },
    maxSize: MAX_SOURCE_BYTES,
    noClick: true,
  });

  function deleteFile(file: MediaFile) {
    if (!confirm(`Delete ${file.name}?`)) return;
    startTransition(async () => {
      try {
        await deleteMedia(file.path);
        setFiles((prev) => prev.filter((f) => f.path !== file.path));
        setSelected(null);
        toast.success('Deleted');
      } catch {
        toast.error('Delete failed');
      }
    });
  }

  return (
    <div {...getRootProps()} className="outline-none">
      <input {...getInputProps()} />

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button
          onClick={open}
          className="bg-brand text-bg text-sm font-medium px-4 py-2 rounded hover:opacity-90"
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
            <option key={c} value={c}>{c === 'All' ? 'All folders' : c}</option>
          ))}
        </select>
        <select
          value={eventTag}
          onChange={(e) => setEventTag(e.target.value)}
          className="bg-bg-elev border border-line text-ink text-sm rounded px-3 py-2"
        >
          <option value="All">All categories</option>
          {categoriesInUse.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <span className="ml-auto text-xs text-ink-mute">
          {files.length} images · {totalMB} MB used
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-4">
        {filtered.map((f) => (
          <button
            key={f.path}
            onClick={() => setSelected(f)}
            className={`relative aspect-square rounded overflow-hidden border-2 transition-colors ${
              selected?.path === f.path ? 'border-brand' : 'border-transparent hover:border-line'
            }`}
            title={f.onSite ? 'On the public gallery' : undefined}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.publicUrl} alt={f.name} className="w-full h-full object-cover" />
            {f.onSite && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-brand ring-2 ring-black/50" aria-label="Published" />
            )}
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 sm:col-span-4 md:col-span-6 py-16 text-center text-sm text-ink-mute border border-dashed border-line rounded">
            No images found. Click Upload or drag files here.
          </div>
        )}
      </div>

      {/* Enlarge + tag modal */}
      {selected && (
        <MediaModal
          file={selected}
          categories={categoriesInUse}
          isDeleting={isPending}
          onClose={() => setSelected(null)}
          onSaved={(updated) => {
            setFiles((prev) => prev.map((f) => (f.path === updated.path ? updated : f)));
            setSelected(updated);
          }}
          onDelete={deleteFile}
        />
      )}
    </div>
  );
}
