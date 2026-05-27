'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import { useEditMode } from './EditModeProvider';
import { updateSiteContent } from '@/lib/actions/content';
import { toast } from 'sonner';

type Tag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div' | 'em' | 'strong';

interface InlineTextProps {
  contentKey: string;
  defaultValue: string;
  tag?: Tag;
  className?: string;
  multiline?: boolean;
  revalidate?: string;
}

export function InlineText({
  contentKey,
  defaultValue,
  tag = 'span',
  className = '',
  multiline = false,
  revalidate,
}: InlineTextProps) {
  const { editMode, isAdmin, setIsEditing: setGlobalEditing } = useEditMode();
  const [value, setValue] = useState(defaultValue);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLElement | null>(null);
  const originalRef = useRef(defaultValue);

  // Keep displayed value in sync when defaultValue changes (e.g., after revalidate)
  useEffect(() => {
    if (!editing) {
      setValue(defaultValue);
      originalRef.current = defaultValue;
    }
  }, [defaultValue, editing]);

  const enterEdit = useCallback(() => {
    if (!editMode || editing) return;
    setEditing(true);
    setGlobalEditing(true);
    setTimeout(() => {
      if (!ref.current) return;
      ref.current.focus();
      const range = document.createRange();
      range.selectNodeContents(ref.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }, 0);
  }, [editMode, editing, setGlobalEditing]);

  const exitEdit = useCallback(() => {
    setEditing(false);
    setGlobalEditing(false);
  }, [setGlobalEditing]);

  const handleCancel = useCallback(() => {
    if (ref.current) ref.current.textContent = originalRef.current;
    setValue(originalRef.current);
    exitEdit();
  }, [exitEdit]);

  const handleSave = useCallback(async () => {
    const newValue = (ref.current?.textContent ?? value).trim();
    if (newValue === originalRef.current) {
      exitEdit();
      return;
    }
    setSaving(true);
    try {
      await updateSiteContent(contentKey, newValue, revalidate);
      setValue(newValue);
      originalRef.current = newValue;
      toast.success('Saved');
      exitEdit();
    } catch (e) {
      console.error(e);
      toast.error('Save failed — try again');
    } finally {
      setSaving(false);
    }
  }, [contentKey, value, revalidate, exitEdit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Enter' && !multiline) {
        e.preventDefault();
        handleSave();
      }
    },
    [handleCancel, handleSave, multiline],
  );

  // Render plain element when not admin or not in edit mode
  if (!isAdmin || !editMode) {
    const Tag = tag as keyof JSX.IntrinsicElements;
    return <Tag className={className}>{value}</Tag>;
  }

  const Tag = tag as keyof JSX.IntrinsicElements;
  return (
    <span className="relative inline">
      <Tag
        ref={ref as never}
        data-inline-text=""
        data-editing={editing ? 'true' : 'false'}
        contentEditable={editing}
        suppressContentEditableWarning
        className={className}
        onClick={enterEdit}
        onKeyDown={handleKeyDown}
        onBlur={(e: React.FocusEvent) => {
          const next = e.relatedTarget as HTMLElement | null;
          if (next?.closest('[data-inline-text-actions]')) return;
          if (editing && !saving) handleCancel();
        }}
      >
        {value}
      </Tag>
      {editing && (
        <span
          data-inline-text-actions
          className="absolute left-0 top-full mt-1 flex gap-1 z-[10000] bg-bg-elev border border-line rounded shadow-lg p-1 max-md:fixed max-md:left-0 max-md:right-0 max-md:bottom-0 max-md:top-auto max-md:rounded-none max-md:mt-0 max-md:p-3 max-md:justify-center"
          contentEditable={false}
        >
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-500 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleCancel}
            disabled={saving}
            className="px-3 py-1 text-xs bg-neutral-600 text-white rounded hover:bg-neutral-500"
          >
            Cancel
          </button>
        </span>
      )}
    </span>
  );
}
