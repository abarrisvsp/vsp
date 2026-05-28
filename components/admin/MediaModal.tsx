// components/admin/MediaModal.tsx
'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { setMediaPublication } from '@/lib/actions/media';
import { EVENT_TAGS, normalizeTags } from '@/lib/event-tags';
import type { MediaFile } from '@/lib/types';

interface Props {
  file: MediaFile;
  onClose: () => void;
  onSaved: (updated: MediaFile) => void;
  onDelete: (file: MediaFile) => void;
  isDeleting: boolean;
}

export function MediaModal({ file, onClose, onSaved, onDelete, isDeleting }: Props) {
  const [onSite, setOnSite] = useState(file.onSite);
  const [tags, setTags] = useState<string[]>(file.eventTags);
  const [isSaving, startSave] = useTransition();

  function toggleTag(slug: string) {
    setTags((prev) => (prev.includes(slug) ? prev.filter((t) => t !== slug) : [...prev, slug]));
  }

  function save() {
    const normalized = normalizeTags(tags);
    startSave(async () => {
      try {
        await setMediaPublication(
          { path: file.path, publicUrl: file.publicUrl },
          { onSite, eventTags: normalized },
        );
        onSaved({ ...file, onSite, eventTags: normalized });
        toast.success(onSite ? 'Saved — live on the gallery' : 'Saved');
      } catch {
        toast.error('Save failed');
      }
    });
  }

  function copyUrl() {
    navigator.clipboard.writeText(file.publicUrl);
    toast.success('URL copied');
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-bg-elev border border-line rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-3 border-b border-line">
          <p className="text-sm font-medium text-ink truncate">{file.name}</p>
          <button onClick={onClose} className="text-ink-mute hover:text-ink text-2xl leading-none px-1" aria-label="Close">
            ×
          </button>
        </div>

        {/* Enlarged preview */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={file.publicUrl} alt={file.name} className="w-full max-h-[50vh] object-contain bg-black" />

        <div className="px-5 py-4 space-y-5">
          <p className="text-xs text-ink-mute">
            {file.width && file.height ? `${file.width}×${file.height} · ` : ''}
            {(file.size / 1024).toFixed(0)} KB
            {file.createdAt ? ` · Uploaded ${new Date(file.createdAt).toLocaleDateString()}` : ''}
            {' · '}<span className="text-ink-dim">{file.path}</span>
          </p>

          {/* Show on website */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <button
              type="button"
              onClick={() => setOnSite((v) => !v)}
              className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${onSite ? 'bg-brand' : 'bg-line'}`}
              role="switch"
              aria-checked={onSite}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${onSite ? 'translate-x-4' : ''}`} />
            </button>
            <span className="text-sm text-ink">Show on public gallery</span>
          </label>

          {/* Event type tags */}
          <div className={onSite ? '' : 'opacity-40 pointer-events-none'}>
            <p className="text-xs text-ink-mute mb-2">Event type{onSite ? '' : ' (turn on “Show on public gallery” to tag)'}</p>
            <div className="flex flex-wrap gap-2">
              {EVENT_TAGS.map((t) => {
                const active = tags.includes(t.slug);
                return (
                  <button
                    key={t.slug}
                    type="button"
                    onClick={() => toggleTag(t.slug)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      active ? 'bg-brand text-bg border-brand' : 'border-line text-ink-mute hover:text-ink'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={save}
              disabled={isSaving}
              className="bg-brand text-bg text-sm font-medium px-4 py-2 rounded hover:opacity-90 disabled:opacity-50"
            >
              {isSaving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={copyUrl} className="border border-line text-ink-mute text-xs px-3 py-2 rounded hover:text-ink">
              Copy URL
            </button>
            <button
              onClick={() => onDelete(file)}
              disabled={isDeleting}
              className="border border-line text-red-400 text-xs px-3 py-2 rounded hover:border-red-400 disabled:opacity-50 ml-auto"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
