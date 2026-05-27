'use client';
import { useState } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import type { ContactSubmission } from '@/lib/types';
import { markSubmissionRead, archiveSubmission, updateSubmissionNotes } from '@/lib/actions/submissions';
import { toast } from 'sonner';

export function InboxTable({ submissions, archived }: { submissions: ContactSubmission[]; archived: boolean }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);

  async function toggleRead(s: ContactSubmission) {
    await markSubmissionRead(s.id, !s.read);
    router.refresh();
  }
  async function archive(s: ContactSubmission) {
    await archiveSubmission(s.id, !s.archived);
    toast.success(s.archived ? 'Restored' : 'Archived');
    router.refresh();
  }
  async function saveNotes(id: string, notes: string) {
    await updateSubmissionNotes(id, notes);
    toast.success('Notes saved');
  }

  if (submissions.length === 0) {
    return <p className="text-ink-mute p-8">{archived ? 'No archived submissions.' : 'Inbox empty.'}</p>;
  }

  return (
    <div className="border border-line">
      <div className="hidden md:grid grid-cols-[120px_1fr_1fr_120px_100px_100px] gap-4 px-4 py-2 border-b border-line text-xs uppercase tracking-wider text-ink-mute">
        <span>Date</span><span>Name</span><span>Email</span><span>Type</span><span>Headcount</span><span>Budget</span>
      </div>
      {submissions.map((s) => {
        const isOpen = expanded === s.id;
        const wrapperCls = `border-b border-line ${!s.read ? 'border-l-4 border-l-cyan font-medium' : ''}`;
        return (
          <div key={s.id} className={wrapperCls}>
            <button
              onClick={() => { setExpanded(isOpen ? null : s.id); if (!s.read) toggleRead(s); }}
              className="w-full text-left grid md:grid-cols-[120px_1fr_1fr_120px_100px_100px] gap-4 px-4 py-3 hover:bg-bg-elev"
            >
              <span className="text-ink-dim text-sm">{format(new Date(s.submitted_at), 'MMM d')}</span>
              <span>{s.full_name}</span>
              <span className="text-ink-dim text-sm">{s.email}</span>
              <span className="text-ink-dim text-sm">{s.event_type || '—'}</span>
              <span className="text-ink-dim text-sm">{s.headcount || '—'}</span>
              <span className="text-ink-dim text-sm">{s.budget_range || '—'}</span>
            </button>
            {isOpen && (
              <div className="bg-bg-elev px-4 py-4 grid md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-2">
                  {s.phone && <div><span className="text-ink-mute">Phone: </span>{s.phone}</div>}
                  {s.preferred_contact && <div><span className="text-ink-mute">Prefers: </span>{s.preferred_contact}</div>}
                  {s.event_date && <div><span className="text-ink-mute">Date: </span>{s.event_date} {s.date_flexible && '(flexible)'}</div>}
                  {s.venue_city && <div><span className="text-ink-mute">Venue: </span>{s.venue_city}</div>}
                  {s.services_needed && s.services_needed.length > 0 && <div><span className="text-ink-mute">Services: </span>{s.services_needed.join(', ')}</div>}
                  {s.message && <div className="mt-3"><p className="text-ink-mute text-xs uppercase mb-1">Message</p><p className="whitespace-pre-wrap">{s.message}</p></div>}
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-ink-mute mb-1">Notes (private)</label>
                  <textarea
                    defaultValue={s.notes || ''}
                    onBlur={(e) => e.target.value !== (s.notes || '') && saveNotes(s.id, e.target.value)}
                    rows={5}
                    className="w-full bg-bg border border-line rounded px-3 py-2 text-ink focus:outline-none focus:border-amber"
                  />
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => toggleRead(s)} className="text-xs px-3 py-1 border border-line hover:border-amber">
                      Mark {s.read ? 'unread' : 'read'}
                    </button>
                    <button onClick={() => archive(s)} className="text-xs px-3 py-1 border border-line hover:border-amber">
                      {s.archived ? 'Restore' : 'Archive'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
