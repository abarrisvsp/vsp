'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Pencil } from 'lucide-react';
import type { Service } from '@/lib/types';
import { useEditMode } from '@/components/edit-mode/EditModeProvider';
import { RecordEditModal, type FieldDef } from '@/components/edit-mode/RecordEditModal';
import { updateService, deleteService } from '@/lib/actions/services';

const FIELDS: FieldDef[] = [
  { name: 'letter', label: 'Letter (A-F)', type: 'text' },
  { name: 'title', label: 'Title', type: 'text' },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'url', label: 'Link URL', type: 'text' },
  { name: 'sort_order', label: 'Sort order', type: 'number' },
  { name: 'active', label: 'Active', type: 'checkbox' },
];

export function ServiceCard({ service }: { service: Service }) {
  const { editMode } = useEditMode();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative border-t border-line py-8 group">
      <div className="grid grid-cols-[60px_1fr_auto] gap-6 items-start">
        <span className="font-serif italic text-3xl text-brand">{service.letter}</span>
        <div>
          <h3 className="font-serif italic text-2xl mb-2">{service.title}</h3>
          <p className="text-ink-dim leading-relaxed">{service.description}</p>
        </div>
        {service.url && (
          <Link href={service.url} className="text-ink-mute hover:text-brand text-sm">
            Explore →
          </Link>
        )}
      </div>
      {editMode && (
        <button
          onClick={() => setOpen(true)}
          className="absolute top-2 right-2 p-1 bg-bg-elev border border-line rounded opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Edit service"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}
      <RecordEditModal
        open={open}
        onClose={() => setOpen(false)}
        title={`Edit service: ${service.title}`}
        fields={FIELDS}
        initialValues={service as unknown as Record<string, unknown>}
        onSave={async (vals) => updateService(service.id, vals as Partial<Service>)}
        onDelete={async () => deleteService(service.id)}
      />
    </div>
  );
}
