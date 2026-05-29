'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Pencil, Plus } from 'lucide-react';
import type { ClientLogo } from '@/lib/types';
import { useEditMode } from '@/components/edit-mode/EditModeProvider';
import { RecordEditModal, type FieldDef } from '@/components/edit-mode/RecordEditModal';
import { createClientLogo, updateClientLogo, deleteClientLogo } from '@/lib/actions/client-logos';

const FIELDS: FieldDef[] = [
  { name: 'name', label: 'Client name', type: 'text' },
  { name: 'logo_url', label: 'Logo URL (optional)', type: 'url' },
  { name: 'link_url', label: 'Link URL (optional)', type: 'url' },
  { name: 'sort_order', label: 'Sort order', type: 'number' },
  { name: 'active', label: 'Active', type: 'checkbox' },
];

function Logo({ logo }: { logo: ClientLogo }) {
  const { editMode } = useEditMode();
  const [open, setOpen] = useState(false);
  const body = logo.logo_url ? (
    <Image
      src={logo.logo_url}
      alt={logo.name}
      width={120}
      height={40}
      loading="lazy"
      className="h-9 w-auto grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition"
    />
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
        onSave={async (vals) => updateClientLogo(logo.id, vals as Partial<ClientLogo>)}
        onDelete={async () => deleteClientLogo(logo.id)}
      />
    </div>
  );
}

export function ClientLogosSection({ logos }: { logos: ClientLogo[] }) {
  const { editMode } = useEditMode();
  const [addOpen, setAddOpen] = useState(false);

  // Stay invisible on the public site until cleared client logos are added.
  // Admins still see the section in edit mode so they can add the first one.
  if (!logos.length && !editMode) return null;

  return (
    <section className="border-b border-line py-10">
      <div className="max-w-container mx-auto px-10 flex flex-wrap items-center gap-10">
        <span className="text-xs uppercase tracking-wider text-ink-mute">Trusted by</span>
        <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
          {logos.map((l) => <Logo key={l.id} logo={l} />)}
          {!logos.length && <span className="text-sm text-ink-mute italic">No client logos yet.</span>}
        </div>
        {editMode && (
          <>
            <button onClick={() => setAddOpen(true)} className="ml-auto text-brand text-sm flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add client
            </button>
            <RecordEditModal
              open={addOpen}
              onClose={() => setAddOpen(false)}
              title="Add a client"
              fields={FIELDS}
              initialValues={{ name: '', logo_url: '', link_url: '', sort_order: 99, active: true }}
              onSave={async (vals) => createClientLogo(vals as Partial<ClientLogo>)}
            />
          </>
        )}
      </div>
    </section>
  );
}
