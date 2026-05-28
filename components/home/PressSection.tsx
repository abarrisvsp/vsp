'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Pencil, Plus } from 'lucide-react';
import type { PressLogo } from '@/lib/types';
import { useEditMode } from '@/components/edit-mode/EditModeProvider';
import { RecordEditModal, type FieldDef } from '@/components/edit-mode/RecordEditModal';
import { createPressLogo, updatePressLogo, deletePressLogo } from '@/lib/actions/press';

const FIELDS: FieldDef[] = [
  { name: 'name', label: 'Publication name', type: 'text' },
  { name: 'logo_url', label: 'Logo URL (optional)', type: 'url' },
  { name: 'link_url', label: 'Link URL (optional)', type: 'url' },
  { name: 'sort_order', label: 'Sort order', type: 'number' },
  { name: 'active', label: 'Active', type: 'checkbox' },
];

function Logo({ logo }: { logo: PressLogo }) {
  const { editMode } = useEditMode();
  const [open, setOpen] = useState(false);
  const body = logo.logo_url ? (
    <Image src={logo.logo_url} alt={logo.name} width={120} height={40} className="h-8 w-auto opacity-70 hover:opacity-100" />
  ) : (
    <span className="font-serif italic text-ink-dim">{logo.name}</span>
  );
  return (
    <div className="relative group">
      {logo.link_url ? <a href={logo.link_url} target="_blank" rel="noreferrer">{body}</a> : body}
      {editMode && (
        <button
          onClick={() => setOpen(true)}
          className="absolute -top-2 -right-2 p-1 bg-bg-elev border border-line rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Pencil className="w-3 h-3" />
        </button>
      )}
      <RecordEditModal
        open={open}
        onClose={() => setOpen(false)}
        title={`Edit ${logo.name}`}
        fields={FIELDS}
        initialValues={logo as unknown as Record<string, unknown>}
        onSave={async (vals) => updatePressLogo(logo.id, vals as Partial<PressLogo>)}
        onDelete={async () => deletePressLogo(logo.id)}
      />
    </div>
  );
}

export function PressSection({ logos }: { logos: PressLogo[] }) {
  const { editMode } = useEditMode();
  const [addOpen, setAddOpen] = useState(false);
  return (
    <section className="border-y border-line py-10 bg-bg-elev">
      <div className="max-w-container mx-auto px-10 flex flex-wrap items-center gap-10">
        <span className="text-xs uppercase tracking-wider text-ink-mute">Featured in</span>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          {logos.map((l) => <Logo key={l.id} logo={l} />)}
        </div>
        {editMode && (
          <>
            <button onClick={() => setAddOpen(true)} className="ml-auto text-brand text-sm flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add publication
            </button>
            <RecordEditModal
              open={addOpen}
              onClose={() => setAddOpen(false)}
              title="Add a publication"
              fields={FIELDS}
              initialValues={{ name: '', logo_url: '', link_url: '', sort_order: 99, active: true }}
              onSave={async (vals) => createPressLogo(vals as Partial<PressLogo>)}
            />
          </>
        )}
      </div>
    </section>
  );
}
