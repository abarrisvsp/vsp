// components/admin/NewsletterAdmin.tsx
'use client';

import { useState, useTransition } from 'react';
import { deleteSubscriberByAdmin, exportSubscribersCSV, saveNewsletterSettings } from '@/lib/actions/subscribers';
import { toast } from 'sonner';
import type { Subscriber } from '@/lib/types';

interface Props {
  initialSubscribers: Subscriber[];
  total: number;
  thisMonth: number;
  initialHeadline: string;
  initialSubtext: string;
  initialShowHomepage: boolean;
  initialShowBlog: boolean;
}

export function NewsletterAdmin({
  initialSubscribers,
  total,
  thisMonth,
  initialHeadline,
  initialSubtext,
  initialShowHomepage,
  initialShowBlog,
}: Props) {
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [currentTotal, setCurrentTotal] = useState(total);
  const [headline, setHeadline] = useState(initialHeadline);
  const [subtext, setSubtext] = useState(initialSubtext);
  const [showHomepage, setShowHomepage] = useState(initialShowHomepage);
  const [showBlog, setShowBlog] = useState(initialShowBlog);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string, email: string) {
    if (!confirm(`Delete ${email}?`)) return;
    startTransition(async () => {
      try {
        await deleteSubscriberByAdmin(id);
        setSubscribers((prev) => prev.filter((s) => s.id !== id));
        setCurrentTotal((prev) => Math.max(0, prev - 1));
        toast.success('Subscriber deleted');
      } catch {
        toast.error('Delete failed');
      }
    });
  }

  async function handleExport() {
    try {
      const csv = await exportSubscribersCSV();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Export failed');
    }
  }

  function saveSettings() {
    startTransition(async () => {
      try {
        await saveNewsletterSettings({ headline, subtext, showHomepage, showBlog });
        toast.success('Settings saved');
      } catch {
        toast.error('Save failed');
      }
    });
  }

  const INPUT = 'w-full bg-bg-soft border border-line rounded px-3 py-2 text-sm text-ink';

  return (
    <div className="space-y-10">
      {/* Stats + actions */}
      <div className="flex items-center gap-8 border border-line bg-bg-elev rounded px-6 py-5">
        <div>
          <p className="text-3xl font-serif italic text-amber">{currentTotal}</p>
          <p className="text-xs text-ink-mute mt-0.5">Subscribers</p>
        </div>
        <div>
          <p className="text-3xl font-serif italic text-amber">{thisMonth}</p>
          <p className="text-xs text-ink-mute mt-0.5">This month</p>
        </div>
        <div className="ml-auto flex gap-3">
          <button
            onClick={handleExport}
            className="border border-line text-ink-mute text-sm px-4 py-2 rounded hover:text-ink transition-colors"
          >
            Export CSV
          </button>
          <button
            disabled
            title="Coming soon — Mailchimp sync will be added in a future update"
            className="border border-line text-ink-mute/40 text-sm px-4 py-2 rounded cursor-not-allowed"
          >
            Connect Mailchimp
          </button>
        </div>
      </div>

      {/* Subscriber list */}
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-ink-mute mb-3">
          Subscribers ({currentTotal})
        </p>
        <div className="border border-line rounded overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_auto] gap-4 px-4 py-2 bg-bg-soft text-[10px] uppercase tracking-widest text-ink-mute border-b border-line">
            <span>Email</span>
            <span>Subscribed</span>
            <span />
          </div>
          {subscribers.length === 0 ? (
            <div className="px-4 py-8 text-sm text-ink-mute text-center">No subscribers yet.</div>
          ) : (
            subscribers.map((s) => (
              <div
                key={s.id}
                className="grid grid-cols-[1fr_1fr_auto] gap-4 px-4 py-3 border-b border-line last:border-b-0 items-center text-sm"
              >
                <span className="text-ink truncate">{s.email}</span>
                <span className="text-ink-mute text-xs">
                  {new Date(s.subscribed_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <button
                  onClick={() => handleDelete(s.id, s.email)}
                  disabled={isPending}
                  className="text-red-400 text-xs hover:text-red-300 disabled:opacity-50"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
        {currentTotal > subscribers.length && (
          <p className="text-xs text-ink-mute mt-2 text-right">
            Showing first {subscribers.length} of {currentTotal}
          </p>
        )}
      </div>

      {/* Form settings */}
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-ink-mute mb-4">
          Opt-in Form Settings
        </p>
        <div className="border border-line rounded p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-ink-mute mb-1">Headline</label>
              <input value={headline} onChange={(e) => setHeadline(e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className="block text-xs text-ink-mute mb-1">Subtext</label>
              <input value={subtext} onChange={(e) => setSubtext(e.target.value)} className={INPUT} />
            </div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-ink-dim cursor-pointer">
              <button
                type="button"
                onClick={() => setShowHomepage(!showHomepage)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${showHomepage ? 'bg-green-600' : 'bg-bg-soft border border-line'}`}
              >
                <span className={`inline-block h-3 w-3 rounded-full bg-white transform transition-transform ${showHomepage ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
              Show on homepage
            </label>
            <label className="flex items-center gap-2 text-sm text-ink-dim cursor-pointer">
              <button
                type="button"
                onClick={() => setShowBlog(!showBlog)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${showBlog ? 'bg-green-600' : 'bg-bg-soft border border-line'}`}
              >
                <span className={`inline-block h-3 w-3 rounded-full bg-white transform transition-transform ${showBlog ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
              Show on blog pages
            </label>
          </div>
          <div className="flex justify-end">
            <button
              onClick={saveSettings}
              disabled={isPending}
              className="bg-amber text-bg text-sm font-medium px-5 py-2 rounded hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
