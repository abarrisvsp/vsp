'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { TiptapEditor } from './TiptapEditor';
import { createBlogPost, updateBlogPost, deleteBlogPost } from '@/lib/actions/blog';
import { uploadImage } from '@/lib/actions/upload';
import { toast } from 'sonner';
import type { BlogPost } from '@/lib/types';

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
  const [saving, setSaving] = useState(false);

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

  async function save(publish: boolean) {
    setSaving(true);
    try {
      if (initial) {
        await updateBlogPost(initial.id, {
          title, date, category_tag: category, excerpt, read_time_minutes: readTime,
          cover_image_url: coverUrl, cover_storage_path: coverPath, body_html: body,
          published: publish,
        });
        toast.success(publish ? 'Published' : 'Saved');
      } else {
        const id = await createBlogPost({
          title, date, category_tag: category, excerpt, read_time_minutes: readTime,
          cover_image_url: coverUrl, cover_storage_path: coverPath, body_html: body,
          published: publish,
        });
        toast.success(publish ? 'Published' : 'Draft saved');
        router.push(`/admin/blog/${id}`);
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

      <div className="flex items-center justify-between pt-4 border-t border-line">
        {initial ? (
          <button onClick={handleDelete} className="text-red-400 text-sm hover:text-red-300">Delete post</button>
        ) : <span />}
        <div className="flex gap-2">
          <button onClick={() => save(false)} disabled={saving} className="px-4 py-2 bg-neutral-700 text-white rounded text-sm">{saving ? '…' : 'Save draft'}</button>
          <button onClick={() => save(true)} disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded text-sm">{saving ? '…' : 'Publish'}</button>
        </div>
      </div>
    </div>
  );
}
