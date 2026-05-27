'use client';
import { useState } from 'react';
import { updateBlogPost } from '@/lib/actions/blog';
import { toast } from 'sonner';

export function PublishedToggle({ postId, initial }: { postId: string; initial: boolean }) {
  const [published, setPublished] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function handle() {
    setSaving(true);
    try {
      await updateBlogPost(postId, { published: !published });
      setPublished(!published);
      toast.success(!published ? 'Published' : 'Reverted to draft');
    } catch {
      toast.error('Failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      onClick={handle}
      disabled={saving}
      className={`px-3 py-1 text-xs uppercase tracking-wider rounded ${published ? 'bg-green-700 text-white' : 'bg-neutral-700 text-ink-dim'}`}
    >
      {saving ? '…' : published ? 'Published' : 'Draft'}
    </button>
  );
}
