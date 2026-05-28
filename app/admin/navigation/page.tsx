// app/admin/navigation/page.tsx
import { getAllNavItems } from '@/lib/actions/navigation';
import { NavEditor } from '@/components/admin/NavEditor';

export const dynamic = 'force-dynamic';

export default async function NavigationPage() {
  const items = await getAllNavItems();
  return (
    <div className="px-8 py-10 max-w-2xl">
      <h1 className="font-serif italic text-4xl mb-1">Navigation</h1>
      <p className="text-ink-mute text-sm mb-8">
        Drag to reorder, toggle eye to show/hide, click label to rename.
      </p>
      <NavEditor initialItems={items} />
    </div>
  );
}
