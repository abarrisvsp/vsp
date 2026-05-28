// app/admin/settings/page.tsx
import { getSiteContent } from '@/lib/actions/content';
import { SettingsForm } from '@/components/admin/SettingsForm';

export const dynamic = 'force-dynamic';

const SETTINGS_KEYS = [
  'vsp_logo_url', 'vsp_logo_storage_path',
  'favicon_url', 'favicon_storage_path',
  'footer_phone', 'footer_email', 'footer_address', 'footer_service_area',
  'social_instagram', 'social_facebook', 'social_youtube', 'social_tiktok',
];

export default async function SettingsPage() {
  const values = await getSiteContent(SETTINGS_KEYS);
  return (
    <div className="px-8 py-10 max-w-3xl">
      <h1 className="font-serif italic text-4xl mb-1">Settings</h1>
      <p className="text-ink-mute text-sm mb-8">
        Site-wide info that appears in the header, footer, and contact sections.
      </p>
      <SettingsForm initialValues={values} />
    </div>
  );
}
