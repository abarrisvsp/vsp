// components/admin/SettingsForm.tsx
'use client';

import { useState, useTransition } from 'react';
import { updateSiteContent } from '@/lib/actions/content';
import { uploadImage } from '@/lib/actions/upload';
import { toast } from 'sonner';

interface Props {
  initialValues: Record<string, string>;
}

const INPUT = 'w-full bg-bg border border-line rounded px-3 py-2 text-sm text-ink';
const LABEL = 'block text-xs text-ink-mute mb-1';
const SECTION = 'border-b border-line pb-1 mb-5 text-[10px] font-mono uppercase tracking-widest text-ink-mute';

export function SettingsForm({ initialValues: iv }: Props) {
  const [logoUrl, setLogoUrl] = useState(iv.vsp_logo_url ?? '');
  const [logoPath, setLogoPath] = useState(iv.vsp_logo_storage_path ?? '');
  const [faviconUrl, setFaviconUrl] = useState(iv.favicon_url ?? '');
  const [faviconPath, setFaviconPath] = useState(iv.favicon_storage_path ?? '');
  const [phone, setPhone] = useState(iv.footer_phone ?? '');
  const [email, setEmail] = useState(iv.footer_email ?? '');
  const [address, setAddress] = useState(iv.footer_address ?? '');
  const [serviceArea, setServiceArea] = useState(iv.footer_service_area ?? '');
  const [instagram, setInstagram] = useState(iv.social_instagram ?? '');
  const [facebook, setFacebook] = useState(iv.social_facebook ?? '');
  const [youtube, setYoutube] = useState(iv.social_youtube ?? '');
  const [tiktok, setTiktok] = useState(iv.social_tiktok ?? '');
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'branding');
    try {
      const { publicUrl, path } = await uploadImage(fd);
      setLogoUrl(publicUrl);
      setLogoPath(path);
      toast.success('Uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleFaviconUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'branding');
    try {
      const { publicUrl, path } = await uploadImage(fd);
      setFaviconUrl(publicUrl);
      setFaviconPath(path);
      toast.success('Uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  }

  function saveAll() {
    startTransition(async () => {
      try {
        const updates: Array<[string, string]> = [
          ['vsp_logo_url', logoUrl],
          ['vsp_logo_storage_path', logoPath],
          ['favicon_url', faviconUrl],
          ['favicon_storage_path', faviconPath],
          ['footer_phone', phone],
          ['footer_email', email],
          ['footer_address', address],
          ['footer_service_area', serviceArea],
          ['social_instagram', instagram],
          ['social_facebook', facebook],
          ['social_youtube', youtube],
          ['social_tiktok', tiktok],
        ];
        await Promise.all(updates.map(([k, v]) => updateSiteContent(k, v)));
        toast.success('Settings saved');
      } catch {
        toast.error('Save failed');
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Branding */}
      <div>
        <p className={SECTION}>Branding</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Logo</label>
            {logoUrl ? (
              <div className="relative border border-line rounded p-2 flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoUrl} alt="Logo" className="h-10 object-contain" />
                <button onClick={() => { setLogoUrl(''); setLogoPath(''); }} className="text-xs text-ink-mute hover:text-ink ml-auto">Remove</button>
              </div>
            ) : (
              <label className="block border border-dashed border-line rounded p-4 text-center text-xs text-brand cursor-pointer hover:border-brand">
                Click to upload logo
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            )}
          </div>
          <div>
            <label className={LABEL}>Favicon</label>
            {faviconUrl ? (
              <div className="relative border border-line rounded p-2 flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={faviconUrl} alt="Favicon" className="h-8 w-8 object-contain" />
                <button onClick={() => { setFaviconUrl(''); setFaviconPath(''); }} className="text-xs text-ink-mute hover:text-ink ml-auto">Remove</button>
              </div>
            ) : (
              <label className="block border border-dashed border-line rounded p-4 text-center text-xs text-brand cursor-pointer hover:border-brand">
                Click to upload favicon
                <input type="file" accept="image/*" onChange={handleFaviconUpload} className="hidden" />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Contact Details */}
      <div>
        <p className={SECTION}>Contact Details</p>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={LABEL}>Phone</label><input value={phone} onChange={(e) => setPhone(e.target.value)} className={INPUT} placeholder="(212) 555-0100" /></div>
          <div><label className={LABEL}>Email</label><input value={email} onChange={(e) => setEmail(e.target.value)} className={INPUT} placeholder="aaron@vsp.com" /></div>
          <div><label className={LABEL}>Address</label><input value={address} onChange={(e) => setAddress(e.target.value)} className={INPUT} placeholder="New York, NY" /></div>
          <div><label className={LABEL}>Service Area</label><input value={serviceArea} onChange={(e) => setServiceArea(e.target.value)} className={INPUT} placeholder="Metro Detroit · Midwest · Nationwide" /></div>
        </div>
      </div>

      {/* Social Links */}
      <div>
        <p className={SECTION}>Social Links</p>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={LABEL}>Instagram</label><input value={instagram} onChange={(e) => setInstagram(e.target.value)} className={INPUT} placeholder="https://instagram.com/vsp" /></div>
          <div><label className={LABEL}>Facebook</label><input value={facebook} onChange={(e) => setFacebook(e.target.value)} className={INPUT} placeholder="https://facebook.com/vsp" /></div>
          <div><label className={LABEL}>YouTube</label><input value={youtube} onChange={(e) => setYoutube(e.target.value)} className={INPUT} placeholder="optional" /></div>
          <div><label className={LABEL}>TikTok</label><input value={tiktok} onChange={(e) => setTiktok(e.target.value)} className={INPUT} placeholder="optional" /></div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={saveAll}
          disabled={isPending || isUploading}
          className="bg-brand text-bg text-sm font-medium px-6 py-2 rounded hover:opacity-90 disabled:opacity-50"
        >
          {isUploading ? 'Uploading…' : isPending ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
