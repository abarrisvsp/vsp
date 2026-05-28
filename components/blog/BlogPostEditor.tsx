'use client';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { TiptapEditor } from './TiptapEditor';
import { createBlogPost, updateBlogPost, deleteBlogPost } from '@/lib/actions/blog';
import { getSubscriberCount } from '@/lib/actions/subscribers';
import { uploadImage } from '@/lib/actions/upload';
import { toast } from 'sonner';
import type { BlogPost } from '@/lib/types';

type BroadcastSummary = {
  sent: number;
  scheduled: number;
  lastScheduledFor: string | null;
};

type PublishStatus = 'draft' | 'published' | 'scheduled';

function showBroadcastToast(b: BroadcastSummary | undefined) {
  if (!b) return;
  const { sent, scheduled, lastScheduledFor } = b;
  if (!sent && !scheduled) return;
  const parts: string[] = [];
  if (sent) parts.push(`${sent} sent now`);
  if (scheduled && lastScheduledFor) {
    const last = new Date(lastScheduledFor);
    const dateStr = last.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    parts.push(`${scheduled} scheduled through ${dateStr} (Resend daily limit)`);
  } else if (scheduled) {
    parts.push(`${scheduled} scheduled`);
  }
  toast.success(`Emailing subscribers: ${parts.join(' · ')}`);
}

export function BlogPostEditor({ initial }: { initial?: BlogPost }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title || '');
  const [date, setDate] = useState(initial?.date || new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState(initial?.category_tag || '');
  const [excerpt, setExcerpt] = useState(initial?.excerpt || '');
  const [readTime, setReadTime] = useState(initial?.read_time_minutes || 0);
  const [coverUrl, setCoverUrl] = useState(initial?.cover_image_url || '');
  const [coverPath, setCoverPath] = useState(initial?.cover_storage_path || '');
  const [body, setBody] = useState(initial?.body_html || '');
  const [emailSubs, setEmailSubs] = useState(initial?.email_subscribers ?? true);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishStatus, setPublishStatus] = useState<PublishStatus>(
    initial?.published ? 'published'
    : initial?.published_at ? 'scheduled'
    : 'draft'
  );
  const [scheduleDate, setScheduleDate] = useState(
    initial?.published_at
      ? new Date(initial.published_at).toISOString().slice(0, 10)
      : new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  );
  const [scheduleTime, setScheduleTime] = useState(
    initial?.published_at
      ? new Date(initial.published_at).toTimeString().slice(0, 5)
      : '09:00'
  );

  const alreadyEmailed = !!initial?.subscribers_emailed_at;

  useEffect(() => {
    getSubscriberCount()
      .then(setSubscriberCount)
      .catch(() => setSubscriberCount(null));
  }, []);

  const onCoverDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'blog/covers');
    try {
      const { publicUrl, path } = await uploadImage(fd);
      setCoverUrl(publicUrl);
      setCoverPath(path);
      toast.success('Cover uploaded');
    } catch {
      toast.error('Upload failed');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onCoverDrop,
    accept: { 'image/*': [] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  async function save() {
    setSaving(true);
    try {
      const isPublished = publishStatus === 'published';
      const isScheduled = publishStatus === 'scheduled';

      const publishedAt = isScheduled
        ? new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString()
        : null;

      const fields = {
        title,
        date,
        category_tag: category || null,
        cover_image_url: coverUrl || null,
        cover_storage_path: coverPath || null,
        body_html: body,
        excerpt: excerpt || null,
        read_time_minutes: readTime || null,
        published: isPublished,
        published_at: publishedAt,
        email_subscribers: emailSubs,
      };

      if (initial) {
        const result = await updateBlogPost(initial.id, fields);
        showBroadcastToast(result.broadcast);
        toast.success(isPublished ? 'Published' : isScheduled ? 'Scheduled' : 'Draft saved');
      } else {
        const result = await createBlogPost(fields);
        showBroadcastToast(result.broadcast);
        router.push(`/admin/blog/${result.id}`);
      }
    } catch (e) {
      console.error(e);
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!initial || !confirm('Delete this post permanently?')) return;
    await deleteBlogPost(initial.id);
    toast.success('Deleted');
    router.push('/blog');
  }

  const input = 'w-full bg-bg-elev border border-line rounded px-3 py-2 text-ink focus:outline-none focus:border-amber';
  const label = 'block text-xs uppercase tracking-wider text-ink-mute mb-1';

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-6">
      <h1 className="font-serif italic text-3xl">{initial ? 'Edit post' : 'New post'}</h1>

      <div>
        <label className={label}>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={input} />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className={label}>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={input} />
        </div>
        <div>
          <label className={label}>Category</label>
          <input value={category} onChange={(e) => setCategory(e.target.value)} className={input} placeholder="Case study, Press, etc." />
        </div>
        <div>
          <label className={label}>Read time (min)</label>
          <input type="number" value={readTime} onChange={(e) => setReadTime(Number(e.target.value))} className={input} />
        </div>
      </div>

      <div>
        <label className={label}>Excerpt</label>
        <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className={input} />
      </div>

      <div>
        <label className={label}>Cover image</label>
        {coverUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={coverUrl} alt="" className="w-full max-h-60 object-cover rounded mb-2" />
        )}
        <div {...getRootProps()} className={`border-2 border-dashed rounded p-6 text-center cursor-pointer ${isDragActive ? 'border-amber' : 'border-line'}`}>
          <input {...getInputProps()} />
          <p className="text-ink-dim text-sm">Drop or click to upload</p>
        </div>
      </div>

      <div>
        <label className={label}>Body</label>
        <TiptapEditor initialHtml={body} onChange={setBody} />
      </div>

      <div className="pt-4 border-t border-line">
        <label className="flex items-start gap-2 cursor-pointer text-sm text-ink-dim">
          <input
            type="checkbox"
            checked={emailSubs}
            disabled={alreadyEmailed}
            onChange={(e) => setEmailSubs(e.target.checked)}
            className="mt-1"
          />
          <span>
            📧 Email subscribers when published
            {subscriberCount !== null && (
              <span className="text-ink-mute"> ({subscriberCount} active)</span>
            )}
            {alreadyEmailed && (
              <span className="block text-xs text-ink-mute mt-0.5">
                Already sent on {new Date(initial!.subscribers_emailed_at!).toLocaleDateString()} — won&apos;t re-send.
              </span>
            )}
          </span>
        </label>
      </div>

      <div className="pt-4 border-t border-line space-y-3">
        {/* Status dropdown */}
        <div>
          <label className={label}>Publish Status</label>
          <select
            value={publishStatus}
            onChange={(e) => setPublishStatus(e.target.value as PublishStatus)}
            className={input}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>

        {/* Schedule date/time pickers — only shown when status = scheduled */}
        {publishStatus === 'scheduled' && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Publish Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className={input}
                />
              </div>
              <div>
                <label className={label}>Publish Time</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className={input}
                />
              </div>
            </div>
            {scheduleDate && scheduleTime && (
              <div className="bg-green-900/20 border border-green-900/40 rounded p-2 text-xs text-green-400">
                🗓 Will go live on{' '}
                {new Date(`${scheduleDate}T${scheduleTime}:00`).toLocaleString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          {initial ? (
            <button onClick={handleDelete} className="text-red-400 text-sm hover:text-red-300">Delete post</button>
          ) : <span />}
          <button
            onClick={save}
            disabled={saving}
            className="px-5 py-2 bg-amber text-bg text-sm font-medium rounded hover:opacity-90 disabled:opacity-50"
          >
            {saving
              ? 'Saving…'
              : publishStatus === 'published'
              ? 'Publish'
              : publishStatus === 'scheduled'
              ? 'Schedule Post'
              : 'Save Draft'}
          </button>
        </div>
      </div>
    </div>
  );
}
