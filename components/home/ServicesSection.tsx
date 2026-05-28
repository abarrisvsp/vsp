'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Service } from '@/lib/types';
import { useEditMode } from '@/components/edit-mode/EditModeProvider';
import { RecordEditModal, type FieldDef } from '@/components/edit-mode/RecordEditModal';
import { createService } from '@/lib/actions/services';
import { ServiceCard } from './ServiceCard';
import { SectionHead } from '@/components/shared/SectionHead';

const NEW_FIELDS: FieldDef[] = [
  { name: 'letter', label: 'Letter (A-F)', type: 'text' },
  { name: 'title', label: 'Title', type: 'text' },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'url', label: 'Link URL', type: 'text' },
  { name: 'sort_order', label: 'Sort order', type: 'number' },
  { name: 'active', label: 'Active', type: 'checkbox' },
];

export function ServicesSection({ services }: { services: Service[] }) {
  const { editMode } = useEditMode();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <section className="max-w-container mx-auto px-10 py-24">
      <SectionHead
        eyebrow="01 / What we do"
        title={
          <>
            Production end-to-end &mdash;<br />
            <em>or</em> a single moving part you need to be perfect.
          </>
        }
        className="mb-12"
      />
      <div>
        {services.map((s) => <ServiceCard key={s.id} service={s} />)}
      </div>
      {editMode && (
        <>
          <button
            onClick={() => setAddOpen(true)}
            className="mt-6 flex items-center gap-2 text-sm text-amber hover:text-ink"
          >
            <Plus className="w-4 h-4" /> Add a service
          </button>
          <RecordEditModal
            open={addOpen}
            onClose={() => setAddOpen(false)}
            title="Add a service"
            fields={NEW_FIELDS}
            initialValues={{ letter: '', title: '', description: '', url: '', sort_order: 99, active: true }}
            onSave={async (vals) => createService(vals as Partial<Service>)}
          />
        </>
      )}
    </section>
  );
}
