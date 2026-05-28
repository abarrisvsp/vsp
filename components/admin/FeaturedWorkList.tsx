'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { deleteFeaturedWork, reorderFeaturedWork } from '@/lib/actions/featured-work';
import { toast } from 'sonner';
import type { FeaturedWork } from '@/lib/types';

export function FeaturedWorkList({ initialItems }: { initialItems: FeaturedWork[] }) {
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();

  function onDragEnd(result: DropResult) {
    if (!result.destination) return;
    const reordered = [...items];
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setItems(reordered);
    startTransition(async () => {
      await reorderFeaturedWork(reordered.map((i) => i.id)).catch(() =>
        toast.error('Reorder failed')
      );
    });
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this case study?')) return;
    startTransition(async () => {
      try {
        await deleteFeaturedWork(id);
        setItems((prev) => prev.filter((i) => i.id !== id));
        toast.success('Deleted');
      } catch {
        toast.error('Delete failed');
      }
    });
  }

  if (items.length === 0) {
    return (
      <div className="border border-dashed border-line rounded py-12 text-center text-sm text-ink-mute">
        No case studies yet.{' '}
        <Link href="/admin/featured-work/new" className="text-brand hover:underline">
          Add the first one →
        </Link>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="featured-work">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(drag) => (
                  <div
                    ref={drag.innerRef}
                    {...drag.draggableProps}
                    className={`flex items-center gap-3 border border-line bg-bg-elev rounded px-4 py-3 ${
                      !item.published ? 'opacity-60' : ''
                    }`}
                  >
                    <span {...drag.dragHandleProps} className="text-ink-mute cursor-grab text-lg">⠿</span>
                    {item.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.cover_image_url} alt="" className="w-14 h-10 object-cover rounded shrink-0" />
                    ) : (
                      <div className="w-14 h-10 bg-bg-soft rounded shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{item.headline}</p>
                      <p className="text-xs text-ink-mute">
                        {item.event_type}
                        {item.event_date ? ` · ${item.event_date.substring(0, 4)}` : ''}
                        {item.guest_count ? ` · ${item.guest_count} guests` : ''}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded shrink-0 ${
                        item.published
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-bg-soft text-ink-mute'
                      }`}
                    >
                      {item.published ? 'Published' : 'Draft'}
                    </span>
                    <Link
                      href={`/admin/featured-work/${item.id}`}
                      className="text-xs border border-line text-ink-mute px-3 py-1.5 rounded hover:text-ink shrink-0"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={isPending}
                      className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50 shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
