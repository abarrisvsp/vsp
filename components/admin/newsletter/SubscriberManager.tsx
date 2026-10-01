'use client';

import { useState, useTransition, type Dispatch, type SetStateAction } from 'react';
import { toast } from 'sonner';
import { addSubscriberByAdmin, deleteSubscriberByAdmin, updateSubscriberByAdmin } from '@/lib/actions/subscribers';
import type { Subscriber } from '@/lib/types';

const INPUT = 'w-full bg-bg-soft border border-line rounded px-3 py-2 text-sm text-ink';
const EMPTY = { email: '', firstName: '', lastName: '' };
const COLS = 'grid grid-cols-[1fr_1.4fr_90px_96px] gap-3 items-center';

const fullName = (s: Subscriber) => [s.first_name, s.last_name].filter(Boolean).join(' ');
const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export function SubscriberManager({
  subscribers,
  setSubscribers,
}: {
  subscribers: Subscriber[];
  setSubscribers: Dispatch<SetStateAction<Subscriber[]>>;
}) {
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(EMPTY);
  const [isPending, startTransition] = useTransition();

  const q = query.trim().toLowerCase();
  const visible = q
    ? subscribers.filter((s) => s.email.includes(q) || fullName(s).toLowerCase().includes(q))
    : subscribers;

  function add(resubscribe = false) {
    startTransition(async () => {
      const res = await addSubscriberByAdmin({ ...adding, resubscribe });
      if (res.status === 'added') {
        const added = res.subscriber;
        setSubscribers((prev) => [added, ...prev.filter((s) => s.id !== added.id)]);
        setAdding(EMPTY);
        toast.success(`Added ${added.email}`);
      } else if (res.status === 'exists') {
        toast.error('That email is already on the list.');
      } else if (res.status === 'unsubscribed') {
        const when = res.unsubscribedAt ? ` on ${shortDate(res.unsubscribedAt)}` : '';
        if (confirm(`${adding.email} unsubscribed${when}.\n\nOnly add them back if they asked to rejoin. Add them back?`)) {
          add(true);
        }
      } else {
        toast.error(res.message);
      }
    });
  }

  function startEdit(s: Subscriber) {
    setEditingId(s.id);
    setDraft({ email: s.email, firstName: s.first_name ?? '', lastName: s.last_name ?? '' });
  }

  function saveEdit(id: string) {
    startTransition(async () => {
      const res = await updateSubscriberByAdmin(id, draft);
      if (res.ok) {
        setSubscribers((prev) => prev.map((s) => (s.id === id ? res.subscriber : s)));
        setEditingId(null);
        toast.success('Saved');
      } else {
        toast.error(res.message);
      }
    });
  }

  function remove(s: Subscriber) {
    if (!confirm(`Remove ${s.email} from the list? They won't get any more emails.`)) return;
    startTransition(async () => {
      try {
        await deleteSubscriberByAdmin(s.id);
        setSubscribers((prev) => prev.filter((x) => x.id !== s.id));
        toast.success('Removed');
      } catch {
        toast.error('Remove failed');
      }
    });
  }

  return (
    <div>
      <p className="text-xs font-mono uppercase tracking-widest text-ink-mute mb-3">
        Subscribers ({subscribers.length})
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
        className="grid grid-cols-[1fr_1fr_1.4fr_auto] gap-2 mb-3"
      >
        <input value={adding.firstName} onChange={(e) => setAdding({ ...adding, firstName: e.target.value })} placeholder="First name" className={INPUT} />
        <input value={adding.lastName} onChange={(e) => setAdding({ ...adding, lastName: e.target.value })} placeholder="Last name" className={INPUT} />
        <input type="email" required value={adding.email} onChange={(e) => setAdding({ ...adding, email: e.target.value })} placeholder="Email" className={INPUT} />
        <button type="submit" disabled={isPending} className="bg-brand text-bg text-sm font-medium px-4 py-2 rounded hover:opacity-90 disabled:opacity-50 whitespace-nowrap">
          + Add
        </button>
      </form>

      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or email…" className={`${INPUT} mb-3`} />

      <div className="border border-line rounded overflow-hidden">
        <div className={`${COLS} px-4 py-2 bg-bg-soft text-[10px] uppercase tracking-widest text-ink-mute border-b border-line`}>
          <span>Name</span>
          <span>Email</span>
          <span>Added</span>
          <span />
        </div>
        <div className="max-h-[520px] overflow-y-auto">
          {visible.length === 0 ? (
            <div className="px-4 py-8 text-sm text-ink-mute text-center">
              {q ? 'Nobody matches that search.' : 'No subscribers yet.'}
            </div>
          ) : (
            visible.map((s) =>
              editingId === s.id ? (
                <div key={s.id} className="px-4 py-3 border-b border-line last:border-b-0 bg-bg-elev space-y-2">
                  <div className="grid grid-cols-[1fr_1fr_1.4fr] gap-2">
                    <input value={draft.firstName} onChange={(e) => setDraft({ ...draft, firstName: e.target.value })} placeholder="First name" className={INPUT} />
                    <input value={draft.lastName} onChange={(e) => setDraft({ ...draft, lastName: e.target.value })} placeholder="Last name" className={INPUT} />
                    <input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="Email" className={INPUT} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingId(null)} className="border border-line text-ink-mute text-xs px-3 py-1.5 rounded hover:text-ink">
                      Cancel
                    </button>
                    <button onClick={() => saveEdit(s.id)} disabled={isPending} className="bg-brand text-bg text-xs font-medium px-3 py-1.5 rounded hover:opacity-90 disabled:opacity-50">
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div key={s.id} className={`${COLS} px-4 py-2.5 border-b border-line last:border-b-0 text-sm`}>
                  <span className={fullName(s) ? 'text-ink truncate' : 'text-ink-mute truncate'}>{fullName(s) || 'No name'}</span>
                  <span className="text-ink-dim truncate">{s.email}</span>
                  <span className="text-ink-mute text-xs">{shortDate(s.subscribed_at)}</span>
                  <span className="flex justify-end gap-3 text-xs">
                    <button onClick={() => startEdit(s)} disabled={isPending} className="text-ink-mute hover:text-ink disabled:opacity-50">
                      Edit
                    </button>
                    <button onClick={() => remove(s)} disabled={isPending} className="text-red-400 hover:text-red-300 disabled:opacity-50">
                      Remove
                    </button>
                  </span>
                </div>
              ),
            )
          )}
        </div>
      </div>
      {q && <p className="text-xs text-ink-mute mt-2 text-right">{visible.length} of {subscribers.length} shown</p>}
    </div>
  );
}
