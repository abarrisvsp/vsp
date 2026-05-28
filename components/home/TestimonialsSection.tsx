'use client';
import { useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import type { Testimonial } from '@/lib/types';
import { useEditMode } from '@/components/edit-mode/EditModeProvider';
import { RecordEditModal, type FieldDef } from '@/components/edit-mode/RecordEditModal';
import { createTestimonial, updateTestimonial, deleteTestimonial } from '@/lib/actions/testimonials';
import { SectionHead } from '@/components/shared/SectionHead';

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
      <SectionHead
        eyebrow="03 / In their words"
        title={<>Twenty years of clients who&rsquo;d rather not call <em>anyone else</em>.</>}
        className="mb-12"
      />
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
