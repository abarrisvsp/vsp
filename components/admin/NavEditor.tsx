// components/admin/NavEditor.tsx
'use client';

import { useState, useTransition } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { saveNavigation, addCustomNavItem } from '@/lib/actions/navigation';
import { toast } from 'sonner';
import type { NavItem } from '@/lib/types';

interface Props {
  initialItems: NavItem[];
}

export function NavEditor({ initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onDragEnd(result: DropResult) {
    if (!result.destination) return;
    const reordered = [...items];
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setItems(reordered);
  }

  function updateLabel(id: string, label: string) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, label } : item)));
  }

  function toggleVisible(id: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, visible: !item.visible } : item))
    );
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function save() {
    startTransition(async () => {
      try {
        await saveNavigation(items);
        toast.success('Navigation saved');
      } catch {
        toast.error('Save failed');
      }
    });
  }

  function addCustom() {
    if (!newLabel.trim() || !newUrl.trim()) return;
    startTransition(async () => {
      try {
        await addCustomNavItem(newLabel.trim(), newUrl.trim());
        // Optimistically add to list
        setItems((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            label: newLabel.trim(),
            href: newUrl.trim(),
            sort_order: prev.length,
            visible: true,
            is_custom: true,
          },
        ]);
        setNewLabel('');
        setNewUrl('');
        setShowCustomForm(false);
        toast.success('Custom link added');
      } catch {
        toast.error('Failed to add link');
      }
    });
  }

  return (
    <div>
      {/* Live preview bar */}
      <div className="border border-line bg-bg-elev rounded px-4 py-3 flex items-center gap-4 text-sm mb-6 overflow-x-auto">
        <span className="font-serif italic text-amber shrink-0">VSP</span>
        {items
          .filter((i) => i.visible)
          .map((item) => (
            <span key={item.id} className="text-ink-dim shrink-0">
              {item.label}
              {item.href === 'dropdown' ? ' ▾' : ''}
            </span>
          ))}
      </div>

      {/* Drag list */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="nav">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(drag) => (
                    <div
                      ref={drag.innerRef}
                      {...drag.draggableProps}
                      className={`flex items-center gap-3 border border-line bg-bg-elev rounded px-4 py-3 ${
                        !item.visible ? 'opacity-50' : ''
                      }`}
                    >
                      <span {...drag.dragHandleProps} className="text-ink-mute cursor-grab text-lg">
                        ⠿
                      </span>
                      <span className="text-xs text-ink-mute w-5">{index + 1}</span>
                      <input
                        value={item.label}
                        onChange={(e) => updateLabel(item.id, e.target.value)}
                        className="bg-bg border border-line rounded px-2 py-1 text-sm text-ink w-28"
                      />
                      <span className="text-xs text-ink-mute flex-1">
                        → {item.href === 'dropdown' ? 'dropdown (Services)' : item.href}
                      </span>
                      <button
                        onClick={() => toggleVisible(item.id)}
                        className="text-lg transition-opacity"
                        title={item.visible ? 'Hide' : 'Show'}
                      >
                        {item.visible ? '👁' : '🚫'}
                      </button>
                      {item.is_custom && (
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 text-xs hover:text-red-300 ml-1"
                          title="Remove custom link"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add custom link */}
      {showCustomForm ? (
        <div className="mt-3 flex gap-2 items-center">
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Label"
            className="bg-bg-elev border border-line rounded px-3 py-2 text-sm text-ink w-32"
          />
          <input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://…"
            className="bg-bg-elev border border-line rounded px-3 py-2 text-sm text-ink flex-1"
          />
          <button
            onClick={addCustom}
            disabled={isPending}
            className="text-sm text-amber border border-amber px-3 py-2 rounded hover:bg-amber/10 disabled:opacity-50"
          >
            Add
          </button>
          <button
            onClick={() => setShowCustomForm(false)}
            className="text-sm text-ink-mute px-2 py-2"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowCustomForm(true)}
          className="mt-3 border border-dashed border-line text-ink-mute text-sm px-4 py-2 rounded hover:text-ink hover:border-ink-mute transition-colors"
        >
          + Add custom link
        </button>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={save}
          disabled={isPending}
          className="bg-amber text-bg text-sm font-medium px-5 py-2 rounded hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save Navigation'}
        </button>
      </div>
    </div>
  );
}
