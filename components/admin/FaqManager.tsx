// components/admin/FaqManager.tsx
'use client';

import { useState, useTransition } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { createFaq, updateFaq, deleteFaq, reorderFaqs } from '@/lib/actions/faqs';
import { toast } from 'sonner';
import type { Faq } from '@/lib/types';

interface PageDef { key: string; label: string }

interface Props {
  pages: PageDef[];
  initialData: Record<string, Faq[]>;
}

export function FaqManager({ pages, initialData }: Props) {
  const [activeTab, setActiveTab] = useState(pages[0].key);
  const [data, setData] = useState(initialData);
  const [editId, setEditId] = useState<string | null>(null);
  const [editQ, setEditQ] = useState('');
  const [editA, setEditA] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newQ, setNewQ] = useState('');
  const [newA, setNewA] = useState('');
  const [isPending, startTransition] = useTransition();

  const faqs = data[activeTab] ?? [];

  function onDragEnd(result: DropResult) {
    if (!result.destination) return;
    const items = [...faqs];
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setData((prev) => ({ ...prev, [activeTab]: items }));
    startTransition(async () => {
      await reorderFaqs(activeTab, items.map((f) => f.id)).catch(() => toast.error('Reorder failed'));
    });
  }

  function startEdit(faq: Faq) {
    setEditId(faq.id);
    setEditQ(faq.question);
    setEditA(faq.answer);
  }

  function saveEdit() {
    if (!editId) return;
    startTransition(async () => {
      try {
        await updateFaq(editId, { question: editQ, answer: editA });
        setData((prev) => ({
          ...prev,
          [activeTab]: prev[activeTab].map((f) =>
            f.id === editId ? { ...f, question: editQ, answer: editA } : f
          ),
        }));
        setEditId(null);
        toast.success('Saved');
      } catch {
        toast.error('Save failed');
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this FAQ?')) return;
    startTransition(async () => {
      try {
        await deleteFaq(id);
        setData((prev) => ({
          ...prev,
          [activeTab]: prev[activeTab].filter((f) => f.id !== id),
        }));
        toast.success('Deleted');
      } catch {
        toast.error('Delete failed');
      }
    });
  }

  function addFaq() {
    if (!newQ.trim() || !newA.trim()) return;
    startTransition(async () => {
      try {
        const created = await createFaq({
          page: activeTab,
          question: newQ.trim(),
          answer: newA.trim(),
          sort_order: faqs.length,
        });
        setData((prev) => ({ ...prev, [activeTab]: [...prev[activeTab], created] }));
        setNewQ('');
        setNewA('');
        setShowAdd(false);
        toast.success('FAQ added');
      } catch {
        toast.error('Failed to add FAQ');
      }
    });
  }

  const INPUT = 'w-full bg-bg border border-line rounded px-3 py-2 text-sm text-ink';

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 flex-wrap">
        {pages.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => { setActiveTab(p.key); setEditId(null); setShowAdd(false); }}
            className={`text-sm px-4 py-1.5 rounded transition-colors ${
              activeTab === p.key
                ? 'bg-amber text-bg font-medium'
                : 'bg-bg-elev text-ink-mute hover:text-ink border border-line'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* FAQ list */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={`faqs-${activeTab}`}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
              {faqs.map((faq, index) => (
                <Draggable key={faq.id} draggableId={faq.id} index={index}>
                  {(drag) => (
                    <div
                      ref={drag.innerRef}
                      {...drag.draggableProps}
                      className="border border-line bg-bg-elev rounded"
                    >
                      {editId === faq.id ? (
                        <div className="p-4 space-y-3">
                          <input
                            value={editQ}
                            onChange={(e) => setEditQ(e.target.value)}
                            className={INPUT}
                            placeholder="Question"
                          />
                          <textarea
                            value={editA}
                            onChange={(e) => setEditA(e.target.value)}
                            rows={3}
                            className={`${INPUT} resize-none`}
                            placeholder="Answer"
                          />
                          <div className="flex gap-2">
                            <button type="button" onClick={saveEdit} disabled={isPending} className="text-xs bg-amber text-bg px-3 py-1.5 rounded hover:opacity-90 disabled:opacity-50">Save</button>
                            <button type="button" onClick={() => setEditId(null)} className="text-xs text-ink-mute hover:text-ink px-3 py-1.5">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3 px-4 py-3">
                          <span {...drag.dragHandleProps} className="text-ink-mute cursor-grab mt-0.5 shrink-0">⠿</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-ink">{faq.question}</p>
                            <p className="text-xs text-ink-mute mt-0.5 line-clamp-1">{faq.answer}</p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button type="button" onClick={() => startEdit(faq)} className="text-xs border border-line text-ink-mute px-2 py-1 rounded hover:text-ink">Edit</button>
                            <button type="button" onClick={() => handleDelete(faq.id)} className="text-xs border border-line text-red-400 px-2 py-1 rounded hover:border-red-400">✕</button>
                          </div>
                        </div>
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

      {/* Add FAQ */}
      {showAdd ? (
        <div className="mt-3 border border-line rounded p-4 space-y-3">
          <input value={newQ} onChange={(e) => setNewQ(e.target.value)} className={INPUT} placeholder="Question" />
          <textarea value={newA} onChange={(e) => setNewA(e.target.value)} rows={3} className={`${INPUT} resize-none`} placeholder="Answer" />
          <div className="flex gap-2">
            <button type="button" onClick={addFaq} disabled={isPending || !newQ.trim() || !newA.trim()} className="text-sm bg-amber text-bg px-4 py-2 rounded hover:opacity-90 disabled:opacity-50">Add FAQ</button>
            <button type="button" onClick={() => setShowAdd(false)} className="text-sm text-ink-mute hover:text-ink px-3 py-2">Cancel</button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="mt-3 w-full border border-dashed border-line rounded py-2.5 text-sm text-ink-mute hover:text-ink hover:border-ink-mute transition-colors"
        >
          + Add FAQ
        </button>
      )}
    </div>
  );
}
