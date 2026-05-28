'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import { toast } from 'sonner';

export type FieldDef =
  | { name: string; label: string; type: 'text' | 'url' | 'number' }
  | { name: string; label: string; type: 'textarea' }
  | { name: string; label: string; type: 'select'; options: string[] }
  | { name: string; label: string; type: 'checkbox' };

interface Props<T extends Record<string, unknown>> {
  open: boolean;
  onClose: () => void;
  title: string;
  fields: FieldDef[];
  initialValues: T;
  onSave: (values: T) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export function RecordEditModal<T extends Record<string, unknown>>({
  open,
  onClose,
  title,
  fields,
  initialValues,
  onSave,
  onDelete,
}: Props<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function set(name: string, v: unknown) {
    setValues((prev) => ({ ...prev, [name]: v }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(values);
      toast.success('Saved');
      onClose();
    } catch (e) {
      console.error(e);
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    if (!confirm('Delete this item? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await onDelete();
      toast.success('Deleted');
      onClose();
    } catch (e) {
      console.error(e);
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-bg-elev border-line text-ink max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif italic text-2xl">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {fields.map((f) => {
            const v = (values as Record<string, unknown>)[f.name];
            const labelEl = (
              <label className="block text-xs uppercase tracking-wider text-ink-mute mb-1">
                {f.label}
              </label>
            );
            if (f.type === 'textarea') {
              return (
                <div key={f.name}>
                  {labelEl}
                  <textarea
                    value={(v as string) ?? ''}
                    onChange={(e) => set(f.name, e.target.value)}
                    rows={4}
                    className="w-full bg-bg border border-line rounded px-3 py-2 text-ink focus:outline-none focus:border-brand"
                  />
                </div>
              );
            }
            if (f.type === 'select') {
              return (
                <div key={f.name}>
                  {labelEl}
                  <select
                    value={(v as string) ?? ''}
                    onChange={(e) => set(f.name, e.target.value)}
                    className="w-full bg-bg border border-line rounded px-3 py-2 text-ink"
                  >
                    {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              );
            }
            if (f.type === 'checkbox') {
              return (
                <label key={f.name} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!v}
                    onChange={(e) => set(f.name, e.target.checked)}
                  />
                  {f.label}
                </label>
              );
            }
            return (
              <div key={f.name}>
                {labelEl}
                <input
                  type={f.type}
                  value={(v as string | number) ?? ''}
                  onChange={(e) =>
                    set(f.name, f.type === 'number' ? Number(e.target.value) : e.target.value)
                  }
                  className="w-full bg-bg border border-line rounded px-3 py-2 text-ink focus:outline-none focus:border-brand"
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between items-center pt-4">
          {onDelete ? (
            <button
              onClick={handleDelete}
              disabled={deleting || saving}
              className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          ) : <span />}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={saving || deleting}
              className="px-4 py-2 text-sm bg-neutral-700 text-white rounded hover:bg-neutral-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || deleting}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-500 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
