// components/admin/SeoEditor.tsx
'use client';

import { useState, useTransition } from 'react';
import { updateSeoSettings, deleteSeoSettings } from '@/lib/actions/seo';
import { uploadImage } from '@/lib/actions/upload';
import { toast } from 'sonner';
import type { SeoSettings } from '@/lib/types';

type RouteOption = { label: string; route: string };

interface Props {
  routes: RouteOption[];
  settingsMap: Record<string, SeoSettings>;
}

export function SeoEditor({ routes, settingsMap }: Props) {
  const [selectedRoute, setSelectedRoute] = useState(routes[0].route);
  const current = settingsMap[selectedRoute];

  const [savedMap, setSavedMap] = useState(settingsMap);
  const [title, setTitle] = useState(current?.meta_title ?? '');
  const [desc, setDesc] = useState(current?.meta_description ?? '');
  const [ogUrl, setOgUrl] = useState(current?.og_image_url ?? '');
  const [ogPath, setOgPath] = useState(current?.og_storage_path ?? '');
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  function switchRoute(route: string) {
    setSelectedRoute(route);
    const s = savedMap[route];
    setTitle(s?.meta_title ?? '');
    setDesc(s?.meta_description ?? '');
    setOgUrl(s?.og_image_url ?? '');
    setOgPath(s?.og_storage_path ?? '');
  }

  const titleLen = title.length;
  const descLen = desc.length;
  const titleOk = titleLen >= 50 && titleLen <= 60;
  const descOk = descLen >= 150 && descLen <= 160;

  async function handleOgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'seo/og');
      const { publicUrl, path } = await uploadImage(fd);
      setOgUrl(publicUrl);
      setOgPath(path);
      toast.success('OG image uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function save() {
    startTransition(async () => {
      try {
        await updateSeoSettings(selectedRoute, {
          meta_title: title || null,
          meta_description: desc || null,
          og_image_url: ogUrl || null,
          og_storage_path: ogPath || null,
        });
        // Update local savedMap so switching back shows saved values
        setSavedMap((prev) => ({
          ...prev,
          [selectedRoute]: {
            ...(prev[selectedRoute] ?? { route: selectedRoute, updated_at: '' }),
            meta_title: title || null,
            meta_description: desc || null,
            og_image_url: ogUrl || null,
            og_storage_path: ogPath || null,
            updated_at: new Date().toISOString(),
          },
        }));
        toast.success('SEO saved');
      } catch {
        toast.error('Save failed');
      }
    });
  }

  function reset() {
    startTransition(async () => {
      try {
        await deleteSeoSettings(selectedRoute);
        setTitle('');
        setDesc('');
        setOgUrl('');
        setOgPath('');
        toast.success('Reset to defaults');
      } catch {
        toast.error('Reset failed');
      }
    });
  }

  const domain = 'visionarysoundproductions.com';

  return (
    <div className="space-y-6">
      {/* Page selector */}
      <div className="flex items-center gap-3">
        <label className="text-xs text-ink-mute">Editing page:</label>
        <select
          value={selectedRoute}
          onChange={(e) => switchRoute(e.target.value)}
          className="bg-bg-elev border border-line text-ink text-sm rounded px-3 py-2 flex-1 max-w-xs"
        >
          {routes.map((r) => (
            <option key={r.route} value={r.route}>
              {r.label} ({r.route})
            </option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: form */}
        <div className="space-y-5">
          <div>
            <label className="text-xs text-ink-mute block mb-1">
              Meta Title <span className="text-ink-mute/60">(50–60 chars ideal)</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-bg-elev border border-line rounded px-3 py-2 text-sm text-ink"
              placeholder="Page title for Google…"
            />
            <p className={`text-xs mt-1 ${titleOk ? 'text-green-500' : 'text-ink-mute'}`}>
              {titleLen} chars {titleOk ? '✓' : titleLen > 60 ? '(too long)' : titleLen > 0 && titleLen < 50 ? '(too short)' : ''}
            </p>
          </div>

          <div>
            <label className="text-xs text-ink-mute block mb-1">
              Meta Description <span className="text-ink-mute/60">(150–160 chars ideal)</span>
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={4}
              className="w-full bg-bg-elev border border-line rounded px-3 py-2 text-sm text-ink resize-none"
              placeholder="Brief description for Google search results…"
            />
            <p className={`text-xs mt-1 ${descOk ? 'text-green-500' : 'text-ink-mute'}`}>
              {descLen} chars {descOk ? '✓' : descLen > 160 ? '(too long)' : descLen > 0 && descLen < 150 ? '(too short)' : ''}
            </p>
          </div>

          <div>
            <label className="text-xs text-ink-mute block mb-1">
              OG / Share Image <span className="text-ink-mute/60">(1200×630 recommended)</span>
            </label>
            {ogUrl ? (
              <div className="relative border border-line rounded overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ogUrl} alt="OG preview" className="w-full h-24 object-cover" />
                <button
                  onClick={() => { setOgUrl(''); setOgPath(''); }}
                  className="absolute top-1 right-1 bg-bg/80 text-ink-mute text-xs px-2 py-0.5 rounded"
                >
                  Remove (save to apply)
                </button>
              </div>
            ) : (
              <label className="block border border-dashed border-line rounded p-4 text-center text-xs text-brand cursor-pointer hover:border-brand transition-colors">
                {uploading ? 'Uploading…' : 'Click to upload OG image'}
                <input type="file" accept="image/*" onChange={handleOgUpload} className="hidden" />
              </label>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={save}
              disabled={isPending}
              className="bg-brand text-bg text-sm font-medium px-5 py-2 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isPending ? 'Saving…' : 'Save SEO'}
            </button>
            <button
              onClick={reset}
              disabled={isPending}
              className="border border-line text-ink-mute text-sm px-4 py-2 rounded hover:text-ink transition-colors disabled:opacity-50"
            >
              Reset to default
            </button>
          </div>
        </div>

        {/* Right: previews */}
        <div className="space-y-5">
          {/* Google SERP preview */}
          <div>
            <p className="text-xs text-ink-mute mb-2">Google Search Preview</p>
            <div className="bg-white rounded-lg p-4 font-sans">
              <p className="text-xs text-[#1a73e8] mb-0.5 truncate">
                https://{domain}{selectedRoute === '/' ? '' : selectedRoute}
              </p>
              <p className="text-base text-[#1a73e8] leading-snug mb-1">
                {title || 'Page title will appear here'}
              </p>
              <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
                {desc || 'Meta description will appear here…'}
              </p>
            </div>
          </div>

          {/* Social share preview */}
          <div>
            <p className="text-xs text-ink-mute mb-2">Social Share Preview</p>
            <div className="border border-line rounded overflow-hidden bg-bg-elev">
              {ogUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ogUrl} alt="" className="w-full h-28 object-cover" />
              ) : (
                <div className="w-full h-28 bg-bg-soft flex items-center justify-center text-xs text-ink-mute">
                  No OG image set
                </div>
              )}
              <div className="px-3 py-2">
                <p className="text-[10px] text-ink-mute uppercase tracking-wider">
                  {domain.toUpperCase()}
                </p>
                <p className="text-sm text-ink font-medium leading-snug mt-0.5">
                  {title || 'Page title'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
