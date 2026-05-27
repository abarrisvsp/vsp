'use client';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useEditMode } from './EditModeProvider';
import { getUnreadSubmissionCount } from '@/lib/actions/submissions';

export function EditToolbar() {
  const { isAdmin, editMode, toggleEditMode, setEditMode } = useEditMode();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!isAdmin) return;
    getUnreadSubmissionCount().then(setUnread).catch(() => {});
    const t = setInterval(() => getUnreadSubmissionCount().then(setUnread).catch(() => {}), 30000);
    return () => clearInterval(t);
  }, [isAdmin]);

  if (!isAdmin) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 h-12 z-[9999] flex items-center justify-between px-4 text-sm transition-colors ${
        editMode ? 'bg-green-900/40 border-b border-green-700' : 'bg-bg-elev border-b border-line'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="font-serif italic text-ink">VSP</span>
        <span className="text-ink-mute hidden sm:inline">· admin</span>
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <span className="text-ink-dim text-xs uppercase tracking-wider">Edit mode:</span>
        <button
          type="button"
          onClick={toggleEditMode}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            editMode ? 'bg-green-500' : 'bg-line'
          }`}
          aria-pressed={editMode}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
              editMode ? 'translate-x-6' : ''
            }`}
          />
        </button>
        <span className="text-ink text-xs font-medium">{editMode ? 'ON' : 'OFF'}</span>
      </label>

      <div className="flex items-center gap-3">
        {editMode && (
          <button
            type="button"
            onClick={() => setEditMode(false)}
            className="text-ink-dim hover:text-ink text-xs"
          >
            View as visitor
          </button>
        )}
        <Link
          href="/admin/inbox"
          className="relative text-ink hover:text-amber text-xs font-medium"
        >
          Inbox
          {unread > 0 && (
            <span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-amber text-white text-[10px] font-semibold">
              {unread}
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="text-ink-mute hover:text-ink text-xs"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
