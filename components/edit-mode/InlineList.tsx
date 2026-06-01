'use client';
import { useState, useEffect, useCallback } from 'react';
import { useEditMode } from './EditModeProvider';
import { updateSiteContent } from '@/lib/actions/content';
import { parseList, serializeList } from '@/lib/edit-mode/block-style';
import { toast } from 'sonner';
import { Plus, X, ChevronUp, ChevronDown, Pencil } from 'lucide-react';

interface InlineListProps {
  contentKey: string;
  defaultValue: string; // newline-separated
  revalidate?: string;
  ulClassName?: string;
  liClassName?: string;
}

export function InlineList({
  contentKey,
  defaultValue,
  revalidate,
  ulClassName = 'grid sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3 text-ink-dim',
  liClassName = 'border-l border-line pl-3 leading-snug',
}: InlineListProps) {
  const { editMode, isAdmin, setIsEditing: setGlobalEditing } = useEditMode();
  const [items, setItems] = useState<string[]>(() => parseList(defaultValue));
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) setItems(parseList(defaultValue));
  }, [defaultValue, editing]);

  const enterEdit = useCallback(() => {
    if (!editMode || editing) return;
    setEditing(true);
    setGlobalEditing(true);
  }, [editMode, editing, setGlobalEditing]);

  const exitEdit = useCallback(() => {
    setEditing(false);
    setGlobalEditing(false);
  }, [setGlobalEditing]);

  const handleCancel = useCallback(() => {
    setItems(parseList(defaultValue));
    exitEdit();
  }, [defaultValue, exitEdit]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await updateSiteContent(contentKey, serializeList(items), revalidate);
      toast.success('Saved');
      exitEdit();
    } catch (e) {
      console.error(e);
      toast.error('Save failed — try again');
    } finally {
      setSaving(false);
    }
  }, [contentKey, items, revalidate, exitEdit]);

  const setItem = (i: number, v: string) =>
    setItems((arr) => arr.map((x, idx) => (idx === i ? v : x)));
  const removeItem = (i: number) => setItems((arr) => arr.filter((_, idx) => idx !== i));
  const addItem = () => setItems((arr) => [...arr, '']);
  const move = (i: number, dir: -1 | 1) =>
    setItems((arr) => {
      const j = i + dir;
      if (j < 0 || j >= arr.length) return arr;
      const copy = [...arr];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  if (!isAdmin || !editMode) {
    return (
      <ul className={ulClassName}>
        {items.map((name, i) => (
          <li key={`${name}-${i}`} className={liClassName}>{name}</li>
        ))}
      </ul>
    );
  }

  if (!editing) {
    return (
      <div className="relative group">
        <ul className={`${ulClassName} rounded outline-1 outline-dashed outline-brand outline-offset-4`}>
          {items.map((name, i) => (
            <li key={`${name}-${i}`} className={liClassName}>{name}</li>
          ))}
        </ul>
        <button
          type="button"
          onClick={enterEdit}
          className="absolute -top-2 -right-2 bg-brand text-white text-[10px] px-1.5 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10"
        >
          <Pencil className="w-3 h-3" /> Edit list
        </button>
      </div>
    );
  }

  return (
    <div className="border border-brand rounded bg-bg shadow-lg p-3">
      <ul className="flex flex-col gap-2">
        {items.map((name, i) => (
          <li key={i} className="flex items-center gap-2">
            <input
              value={name}
              onChange={(e) => setItem(i, e.target.value)}
              className="flex-1 bg-bg-elev border border-line rounded px-2 py-1 text-sm text-ink"
              placeholder="Name…"
            />
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} title="Move up" className="p-1 rounded hover:bg-line disabled:opacity-30">
              <ChevronUp className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} title="Move down" className="p-1 rounded hover:bg-line disabled:opacity-30">
              <ChevronDown className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => removeItem(i)} title="Remove" className="p-1 rounded hover:bg-line text-brand">
              <X className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={addItem} className="mt-2 flex items-center gap-1 text-xs text-ink-dim hover:text-ink">
        <Plus className="w-3.5 h-3.5" /> Add
      </button>
      <div className="flex items-center justify-end gap-2 border-t border-line mt-3 pt-2">
        <button type="button" onClick={handleSave} disabled={saving} className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-500 disabled:opacity-50">
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={handleCancel} disabled={saving} className="px-3 py-1 text-xs bg-neutral-600 text-white rounded hover:bg-neutral-500">
          Cancel
        </button>
      </div>
    </div>
  );
}
