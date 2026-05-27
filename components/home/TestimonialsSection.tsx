'use client';
import { useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import type { Testimonial } from '@/lib/types';
import { useEditMode } from '@/components/edit-mode/EditModeProvider';
import { RecordEditModal, type FieldDef } from '@/components/edit-mode/RecordEditModal';
import { createTestimonial, updateTestimonial, deleteTestimonial } from '@/lib/actions/testimonials';

const FIELDS: FieldDef[] = [
  { name: 'quote', label: 'Quote', type: 'textarea' },
  { name: 'attribution_name', label: 'Name', type: 'text' },
  { name: 'attribution_context', label: 'Context (org / location)', type: 'text' },
  { name: 'sort_order', label: 'Sort order', type: 'number' },
  { name: 'active', label: 'Active', type: 'checkbox' },
];

function Card({ t }: { t: Testimonial }) {
  const { editMode } = useEditMode();
  const [open, setOpen] = useState(false);
  return (
    <figure className="relative bg-bg-elev p-8 border border-line group">
      <blockquote className="font-serif italic text-xl leading-snug mb-4">&ldquo;{t.quote}&rdquo;</blockquote>
      <figcaption className="text-sm text-ink-dim">
        <span className="text-ink">{t.attribution_name}</span>
        {t.attribution_context && <span className="text-ink-mute"> · {t.attribution_context}</span>}
      </figcaption>
      {editMode && (
        <button
          onClick={() => setOpen(true)}
          className="absolute top-2 right-2 p-1 bg-bg border border-line rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}
      <RecordEditModal
        open={open}
        onClose={() => setOpen(false)}
        title="Edit testimonial"
        fields={FIELDS}
        initialValues={t as unknown as Record<string, unknown>}
        onSave={async (vals) => updateTestimonial(t.id, vals as Partial<Testimonial>)}
        onDelete={async () => deleteTestimonial(t.id)}
      />
    </figure>
  );
}

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  const { editMode } = useEditMode();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <section className="max-w-container mx-auto px-10 py-24">
      <div className="mb-10">
        <span className="text-xs uppercase tracking-[0.2em] text-ink-mute">What clients say</span>
        <h2 className="font-serif italic text-5xl mt-2">In their words.</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {testimonials.map((t) => <Card key={t.id} t={t} />)}
      </div>
      {editMode && (
        <>
          <button
            onClick={() => setAddOpen(true)}
            className="mt-6 flex items-center gap-2 text-sm text-amber hover:text-ink"
          >
            <Plus className="w-4 h-4" /> Add a testimonial
          </button>
          <RecordEditModal
            open={addOpen}
            onClose={() => setAddOpen(false)}
            title="Add a testimonial"
            fields={FIELDS}
            initialValues={{ quote: '', attribution_name: '', attribution_context: '', sort_order: 99, active: true }}
            onSave={async (vals) => createTestimonial(vals as Partial<Testimonial>)}
          />
        </>
      )}
    </section>
  );
}
