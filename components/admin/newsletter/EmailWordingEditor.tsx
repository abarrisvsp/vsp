'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { saveEmailWording } from '@/lib/actions/newsletter';
import { DEFAULT_EMAIL_WORDING, type EmailWording } from '@/lib/email/wording';

const INPUT = 'w-full bg-bg-soft border border-line rounded px-3 py-2 text-sm text-ink';

const FIELDS: { field: keyof EmailWording; label: string; hint?: string }[] = [
  { field: 'eyebrow', label: 'Top label', hint: 'Blog post emails only.' },
  { field: 'button', label: 'Button text', hint: 'Blog post emails only.' },
  { field: 'intro', label: "Why they're getting this", hint: 'Near the bottom of every email.' },
  {
    field: 'footer',
    label: 'Footer',
    hint: 'Every email. Marketing emails should include a full mailing address; a PO box is fine.',
  },
];

export function EmailWordingEditor({ initialWording }: { initialWording: EmailWording }) {
  const [wording, setWording] = useState(initialWording);
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      try {
        await saveEmailWording(wording);
        // Blank fields fall back to the default, so show what will actually be used.
        setWording((w) => {
          const next = { ...w };
          for (const { field } of FIELDS) if (!next[field].trim()) next[field] = DEFAULT_EMAIL_WORDING[field];
          return next;
        });
        toast.success('Email wording saved');
      } catch {
        toast.error('Save failed');
      }
    });
  }

  return (
    <div>
      <p className="text-xs font-mono uppercase tracking-widest text-ink-mute mb-3">Email wording</p>
      <div className="border border-line rounded p-5 space-y-4">
        <p className="text-xs text-ink-mute">
          Used in blog post emails and emails you send from this page. Clear a field to go back to the default.
        </p>
        {FIELDS.map(({ field, label, hint }) => (
          <div key={field}>
            <label className="block text-xs text-ink-mute mb-1">{label}</label>
            <input
              value={wording[field]}
              onChange={(e) => setWording({ ...wording, [field]: e.target.value })}
              placeholder={DEFAULT_EMAIL_WORDING[field]}
              className={INPUT}
            />
            {hint && <p className="text-[11px] text-ink-mute mt-1">{hint}</p>}
          </div>
        ))}
        <div className="flex justify-end">
          <button onClick={save} disabled={isPending} className="bg-brand text-bg text-sm font-medium px-5 py-2 rounded hover:opacity-90 disabled:opacity-50">
            {isPending ? 'Saving…' : 'Save wording'}
          </button>
        </div>
      </div>
    </div>
  );
}
