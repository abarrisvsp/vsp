// app/admin/announcement/page.tsx
import { getSiteContent } from '@/lib/actions/content';
import { BannerEditor } from '@/components/admin/BannerEditor';

export const dynamic = 'force-dynamic';

export default async function AnnouncementPage() {
  const c = await getSiteContent([
    'banner_active',
    'banner_message',
    'banner_color',
    'banner_hide_after',
  ]);
  return (
    <div className="px-8 py-10 max-w-2xl">
      <h1 className="font-serif italic text-4xl mb-1">Announcement</h1>
      <p className="text-ink-mute text-sm mb-8">
        A dismissible bar shown at the top of every page. Visitors can close it — it won&apos;t
        reappear until you change the message.
      </p>
      <BannerEditor
        initialActive={c.banner_active === 'true'}
        initialMessage={c.banner_message}
        initialColor={c.banner_color || '#ef4444'}
        initialHideAfter={c.banner_hide_after}
      />
    </div>
  );
}
