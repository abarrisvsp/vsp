'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { Pencil, Trash2 } from 'lucide-react';
import type { GalleryPhoto } from '@/lib/types';
import { labelForTag } from '@/lib/event-tags';
import { useEditMode } from '@/components/edit-mode/EditModeProvider';
import { RecordEditModal, type FieldDef } from '@/components/edit-mode/RecordEditModal';
import { updateGalleryPhoto, deleteGalleryPhoto, reorderGalleryPhotos } from '@/lib/actions/gallery';
import { toast } from 'sonner';

const FIELDS: FieldDef[] = [
  { name: 'title', label: 'Title', type: 'text' },
  { name: 'caption', label: 'Caption', type: 'textarea' },
  { name: 'alt_text', label: 'Alt text (accessibility)', type: 'text' },
  { name: 'category', label: 'Category', type: 'text' },
  { name: 'sort_order', label: 'Sort order', type: 'number' },
  { name: 'active', label: 'Active', type: 'checkbox' },
];

export function GalleryGrid({ initial }: { initial: GalleryPhoto[] }) {
  const { editMode } = useEditMode();
  const [photos, setPhotos] = useState(initial);
  const [activeCat, setActiveCat] = useState<string>('All');
  const [lightboxIdx, setLightboxIdx] = useState(-1);
  const [editPhoto, setEditPhoto] = useState<GalleryPhoto | null>(null);

  useEffect(() => setPhotos(initial), [initial]);

  const tagSlugs = Array.from(new Set(photos.flatMap((p) => p.event_tags ?? [])));
  const categories = ['All', ...tagSlugs];
  const visible = activeCat === 'All' ? photos : photos.filter((p) => (p.event_tags ?? []).includes(activeCat));

  const totals: Record<string, number> = { All: photos.length };
  photos.forEach((p) => {
    (p.event_tags ?? []).forEach((t) => {
      totals[t] = (totals[t] || 0) + 1;
    });
  });

  async function onDragEnd(result: DropResult) {
    if (!result.destination) return;
    const reordered = Array.from(visible);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    // Build new full-photos array with updated sort_order
    const remaining = [...reordered];
    const newOrderIds = activeCat === 'All'
      ? reordered.map((p) => p.id)
      : photos.map((p) => (p.event_tags ?? []).includes(activeCat) ? (remaining.shift()!.id) : p.id);

    setPhotos((prev) => prev.map((p) => ({ ...p, sort_order: newOrderIds.indexOf(p.id) + 1 })));
    try {
      await reorderGalleryPhotos(newOrderIds);
      toast.success('Order saved');
    } catch (e) {
      console.error(e);
      toast.error('Reorder failed');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this photo? This cannot be undone.')) return;
    try {
      await deleteGalleryPhoto(id);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      toast.success('Deleted');
    } catch (e) {
      console.error(e);
      toast.error('Delete failed');
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-6 border-b border-line">
        <div className="flex flex-wrap gap-2" role="tablist">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCat(c)}
              className={`inline-flex items-center gap-2 text-xs uppercase tracking-wider px-3 py-1.5 border rounded-full transition-colors ${
                activeCat === c ? 'border-amber text-amber bg-amber/5' : 'border-line text-ink-dim hover:border-amber/50'
              }`}
            >
              {c === 'All' ? 'All' : labelForTag(c)}
              <span className="text-ink-mute text-[10px]">{totals[c] || 0}</span>
            </button>
          ))}
        </div>
        <span className="text-xs uppercase tracking-wider text-ink-mute">
          Showing <span className="text-ink">{visible.length}</span> / {photos.length}
        </span>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="gallery" direction="horizontal" isDropDisabled={!editMode}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2"
            >
              {visible.map((p, i) => (
                <Draggable key={p.id} draggableId={p.id} index={i} isDragDisabled={!editMode}>
                  {(prov) => (
                    <div
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      {...prov.dragHandleProps}
                      className="relative aspect-square group cursor-pointer overflow-hidden"
                      onClick={() => !editMode && setLightboxIdx(i)}
                    >
                      <Image src={p.public_url} alt={p.alt_text || p.title || 'Gallery photo'} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 25vw" loading="lazy" />
                      {/* Always-visible text overlay */}
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none">
                        <span className="block text-[10px] uppercase tracking-wider text-amber mb-1">{labelForTag((p.event_tags && p.event_tags[0]) || p.category)}</span>
                        {p.title && <h3 className="font-serif italic text-sm md:text-base text-white leading-tight line-clamp-1">{p.title}</h3>}
                        {p.caption && <p className="text-xs text-white/80 mt-0.5 line-clamp-1">{p.caption}</p>}
                      </div>
                      {/* Edit-mode controls (kept above overlay) */}
                      {editMode && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-start justify-end p-2 gap-2 transition-opacity z-10">
                          <button onClick={(e) => { e.stopPropagation(); setEditPhoto(p); }} className="p-1.5 bg-bg-elev border border-line rounded">
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="p-1.5 bg-red-900 border border-red-800 rounded">
                            <Trash2 className="w-3 h-3" />
                          </button>
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

      <Lightbox
        open={lightboxIdx >= 0}
        index={lightboxIdx < 0 ? 0 : lightboxIdx}
        close={() => setLightboxIdx(-1)}
        slides={visible.map((p) => ({ src: p.public_url, title: p.title || undefined, description: p.caption || undefined }))}
      />

      {editPhoto && (
        <RecordEditModal
          open={!!editPhoto}
          onClose={() => setEditPhoto(null)}
          title={editPhoto.title || 'Edit photo'}
          fields={FIELDS}
          initialValues={editPhoto as unknown as Record<string, unknown>}
          onSave={async (vals) => {
            await updateGalleryPhoto(editPhoto.id, vals as Partial<GalleryPhoto>);
            setPhotos((prev) => prev.map((p) => p.id === editPhoto.id ? ({ ...p, ...vals } as GalleryPhoto) : p));
          }}
          onDelete={async () => handleDelete(editPhoto.id)}
        />
      )}
    </div>
  );
}
