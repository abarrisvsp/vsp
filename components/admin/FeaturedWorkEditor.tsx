'use client';

import { useState, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { TiptapEditor } from '@/components/blog/TiptapEditor';
import { createFeaturedWork, updateFeaturedWork } from '@/lib/actions/featured-work';
import { uploadImage } from '@/lib/actions/upload';
import { toast } from 'sonner';
import type { FeaturedWork } from '@/lib/types';

const EVENT_TYPES = ['Wedding', 'Corporate', 'Mitzvah', 'Other'];

const INPUT = 'w-full bg-bg-soft border border-line rounded px-3 py-2 text-sm text-ink';
const LABEL = 'block text-xs text-ink-mute mb-1';

export function FeaturedWorkEditor({ initial }: { initial?: FeaturedWork }) {
  const router = useRouter();
  const [headline, setHeadline] = useState(initial?.headline ?? '');
  const [eventType, setEventType] = useState(initial?.event_type ?? '');
  const [clientName, setClientName] = useState(initial?.client_name ?? '');
  const [venue, setVenue] = useState(initial?.venue ?? '');
  const [eventDate, setEventDate] = useState(initial?.event_date ?? '');
  const [guestCount, setGuestCount] = useState(initial?.guest_count?.toString() ?? '');
  const [coverUrl, setCoverUrl] = useState(initial?.cover_image_url ?? '');
  const [coverPath, setCoverPath] = useState(initial?.cover_storage_path ?? '');
  const [body, setBody] = useState(initial?.body_html ?? '');
  const [published, setPublished] = useState(initial?.published ?? false);
  const [isPending, startTransition] = useTransition();

  const onCoverDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'featured-work');
    try {
      const { publicUrl, path } = await uploadImage(fd);
      setCoverUrl(publicUrl);
      setCoverPath(path);
      toast.success('Cover uploaded');
    } catch {
      toast.error('Upload failed');
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onCoverDrop,
    accept: { 'image/*': [] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  function save(publish: boolean) {
    startTransition(async () => {
      const fields: Partial<FeaturedWork> = {
        headline: headline.trim() || 'Untitled',
        event_type: eventType || null,
        client_name: clientName || null,
        venue: venue || null,
        event_date: eventDate || null,
        guest_count: guestCount ? parseInt(guestCount) : null,
        cover_image_url: coverUrl || null,
        cover_storage_path: coverPath || null,
        body_html: body,
        published: publish,
      };
      try {
        if (initial) {
          await updateFeaturedWork(initial.id, { ...fields, published: publish });
          toast.success(publish ? 'Published' : 'Saved as draft');
        } else {
          const created = await createFeaturedWork(fields);
          toast.success('Created');
          router.push(`/admin/featured-work/${created.id}`);
        }
        setPublished(publish);
      } catch {
        toast.error('Save failed');
      }
    });
  }

  return (
    <div className="grid md:grid-cols-[1fr_240px] gap-6">
      {/* Main editor */}
      <div className="space-y-5">
        <div>
          <label className={LABEL}>Headline</label>
          <input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className={INPUT}
            placeholder="Rosenthal Bar Mitzvah — Grand Hyatt NYC"
          />
          {initial && (
            <p className="text-xs text-ink-mute mt-1">
              Slug: <span className="font-mono">{initial.slug}</span> (not editable)
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Event Type</label>
            <select value={eventType} onChange={(e) => setEventType(e.target.value)} className={INPUT}>
              <option value="">Select…</option>
              {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL}>Client Name (optional)</label>
            <input value={clientName} onChange={(e) => setClientName(e.target.value)} className={INPUT} placeholder="Smith Family" />
          </div>
          <div>
            <label className={LABEL}>Venue</label>
            <input value={venue} onChange={(e) => setVenue(e.target.value)} className={INPUT} placeholder="Cipriani 42nd St" />
          </div>
          <div>
            <label className={LABEL}>Event Date</label>
            <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Guest Count</label>
            <input type="number" value={guestCount} onChange={(e) => setGuestCount(e.target.value)} className={INPUT} placeholder="250" />
          </div>
        </div>

        {/* Cover image */}
        <div>
          <label className={LABEL}>Cover Image</label>
          {coverUrl ? (
            <div className="relative border border-line rounded overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverUrl} alt="Cover" className="w-full h-40 object-cover" />
              <button
                onClick={() => { setCoverUrl(''); setCoverPath(''); }}
                className="absolute top-2 right-2 bg-bg/80 text-xs text-ink-mute px-2 py-1 rounded"
              >
                Remove
              </button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className="border border-dashed border-line rounded p-8 text-center text-sm text-ink-mute cursor-pointer hover:border-amber transition-colors"
            >
              <input {...getInputProps()} />
              Click or drag to upload cover image
            </div>
          )}
        </div>

        {/* Write-up */}
        <div>
          <label className={LABEL}>Write-up</label>
          <div className="border border-line rounded overflow-hidden">
            <TiptapEditor initialHtml={body} onChange={setBody} />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <div className="border border-line bg-bg-elev rounded p-4">
          <p className="text-xs font-mono uppercase tracking-wider text-ink-mute mb-4">Publish</p>
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs px-2 py-0.5 rounded ${published ? 'bg-green-900/30 text-green-400' : 'bg-bg-soft text-ink-mute'}`}>
              {published ? 'Published' : 'Draft'}
            </span>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => save(true)}
              disabled={isPending}
              className="w-full bg-amber text-bg text-sm font-medium py-2 rounded hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? 'Saving…' : 'Publish'}
            </button>
            <button
              onClick={() => save(false)}
              disabled={isPending}
              className="w-full border border-line text-ink-mute text-sm py-2 rounded hover:text-ink disabled:opacity-50"
            >
              Save as Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
