'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { TiptapEditor } from '@/components/blog/TiptapEditor';
import { previewBulkEmail, sendBulkEmailAction, sendBulkEmailTestAction } from '@/lib/actions/newsletter';

const INPUT = 'w-full bg-bg-soft border border-line rounded px-3 py-2 text-sm text-ink';
const SECONDARY = 'border border-line text-ink-mute text-sm px-4 py-2 rounded hover:text-ink transition-colors disabled:opacity-50';

const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

export function BulkEmailComposer({
  subscriberCount,
  defaultTestAddress,
  dailyLimit,
}: {
  subscriberCount: number;
  defaultTestAddress: string;
  dailyLimit: number;
}) {
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [testAddresses, setTestAddresses] = useState(defaultTestAddress);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  // Bumping this remounts the editor, which is how it gets cleared after a send.
  const [editorKey, setEditorKey] = useState(0);
  const [isPending, startTransition] = useTransition();

  const days = Math.ceil(subscriberCount / dailyLimit);

  function preview() {
    startTransition(async () => {
      try {
        setPreviewHtml(await previewBulkEmail(bodyHtml));
      } catch {
        toast.error('Could not build the preview');
      }
    });
  }

  function sendTest() {
    startTransition(async () => {
      const res = await sendBulkEmailTestAction({ subject, bodyHtml, addresses: testAddresses });
      if (res.ok) toast.success(res.message);
      else toast.error(res.message);
    });
  }

  function sendToAll() {
    const spread = days > 1 ? `\n\nResend sends up to ${dailyLimit} a day, so this goes out over ${days} days.` : '';
    if (!confirm(`Send "${subject.trim()}" to all ${subscriberCount} subscribers?\n\nThis can't be undone.${spread}`)) return;
    startTransition(async () => {
      const res = await sendBulkEmailAction({ subject, bodyHtml });
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      const later = res.scheduled > 0 && res.lastScheduledFor
        ? ` ${res.scheduled} more are scheduled and finish ${longDate(res.lastScheduledFor)}.`
        : '';
      const failed = res.failed > 0 ? ` ${res.failed} failed; check the Resend log.` : '';
      toast.success(`Sent to ${res.sent} subscribers.${later}${failed}`, { duration: 12000 });
      setSubject('');
      setBodyHtml('');
      setEditorKey((k) => k + 1);
    });
  }

  return (
    <div>
      <p className="text-xs font-mono uppercase tracking-widest text-ink-mute mb-3">Send an email</p>
      <div className="border border-line rounded p-5 space-y-4">
        <div>
          <label className="block text-xs text-ink-mute mb-1">Subject</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Spring wedding dates are filling up" className={INPUT} />
        </div>
        <div>
          <label className="block text-xs text-ink-mute mb-1">Message</label>
          <p className="text-xs text-ink-mute mb-2">
            Each person is greeted by first name automatically (&ldquo;Hi Aaron,&rdquo;), so start with your first line.
          </p>
          <TiptapEditor key={editorKey} initialHtml="" starterText="" onChange={setBodyHtml} />
        </div>
        <div>
          <label className="block text-xs text-ink-mute mb-1">Send a test to</label>
          <input value={testAddresses} onChange={(e) => setTestAddresses(e.target.value)} placeholder="you@example.com" className={INPUT} />
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button onClick={preview} disabled={isPending} className={SECONDARY}>
            Preview
          </button>
          <button onClick={sendTest} disabled={isPending} className={SECONDARY}>
            Send test
          </button>
          <button
            onClick={sendToAll}
            disabled={isPending || subscriberCount === 0}
            className="ml-auto bg-brand text-bg text-sm font-medium px-5 py-2 rounded hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? 'Working…' : `Send to ${subscriberCount} subscribers`}
          </button>
        </div>
        {days > 1 && (
          <p className="text-xs text-ink-mute">
            Resend sends up to {dailyLimit} emails a day, so a send to everyone goes out over {days} days. Login codes and
            contact form alerts share that daily limit.
          </p>
        )}
      </div>

      {previewHtml !== null && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6" onClick={() => setPreviewHtml(null)} role="dialog" aria-modal="true">
          <div className="bg-bg-elev border border-line rounded-lg w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-5 py-3 border-b border-line">
              <p className="text-sm text-ink truncate">{subject.trim() || '(no subject yet)'}</p>
              <button onClick={() => setPreviewHtml(null)} className="text-ink-mute hover:text-ink text-2xl leading-none px-1" aria-label="Close">
                ×
              </button>
            </div>
            {/* sandbox with no permissions: shows the email but runs nothing in it */}
            <iframe title="Email preview" sandbox="" srcDoc={previewHtml} className="w-full h-[70vh] bg-white rounded-b-lg" />
          </div>
        </div>
      )}
    </div>
  );
}
