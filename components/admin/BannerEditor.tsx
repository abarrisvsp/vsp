// components/admin/BannerEditor.tsx
'use client';

import { useState, useTransition } from 'react';
import { updateSiteContent } from '@/lib/actions/content';
import { toast } from 'sonner';

const PRESETS = [
  { label: 'Red', value: '#ef4444' },
  { label: 'Green', value: '#15803d' },
  { label: 'Blue', value: '#1d4ed8' },
  { label: 'Dark', value: '#1c1917' },
];

interface Props {
  initialActive: boolean;
  initialMessage: string;
  initialColor: string;
  initialHideAfter: string;
}

export function BannerEditor({ initialActive, initialMessage, initialColor, initialHideAfter }: Props) {
  const [active, setActive] = useState(initialActive);
  const [message, setMessage] = useState(initialMessage);
  const [color, setColor] = useState(initialColor);
  const [hideAfter, setHideAfter] = useState(initialHideAfter);
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      try {
        await Promise.all([
          updateSiteContent('banner_active', active ? 'true' : 'false'),
          updateSiteContent('banner_message', message),
          updateSiteContent('banner_color', color),
          updateSiteContent('banner_hide_after', hideAfter),
        ]);
        toast.success('Banner saved');
      } catch {
        toast.error('Save failed');
      }
    });
  }

  const isLightColor = (() => {
    const c = color.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 128;
  })();

  return (
    <div className="space-y-6">
      {/* Live preview */}
      {active && message && (
        <div>
          <p className="text-xs text-ink-mute mb-2">Live preview</p>
          <div
            className="flex items-center justify-center px-6 py-2.5 text-sm font-medium rounded relative"
            style={{ backgroundColor: color }}
          >
            <span style={{ color: isLightColor ? '#000' : '#fff' }}>{message}</span>
            <span
              style={{ color: isLightColor ? '#000' : '#fff' }}
              className="absolute right-4 opacity-60 text-base"
            >
              ✕
            </span>
          </div>
        </div>
      )}

      {/* Active toggle */}
      <div className="flex items-center justify-between border border-line bg-bg-elev rounded px-4 py-3">
        <div>
          <p className="text-sm font-medium text-ink">Banner Active</p>
          <p className="text-xs text-ink-mute">Visible to all site visitors right now</p>
        </div>
        <button
          onClick={() => setActive(!active)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            active ? 'bg-green-600' : 'bg-bg-soft border border-line'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white transform transition-transform ${
              active ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Message */}
      <div>
        <label className="block text-xs text-ink-mute mb-1">Message</label>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full bg-bg-elev border border-line rounded px-3 py-2 text-sm text-ink"
          placeholder="🎉 Now booking 2026 events — Get a quote today →"
        />
      </div>

      {/* Color */}
      <div>
        <label className="block text-xs text-ink-mute mb-2">Background Color</label>
        <div className="flex gap-3 items-center">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => setColor(p.value)}
              title={p.label}
              className={`w-7 h-7 rounded-full border-2 transition-all ${
                color === p.value ? 'border-white scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: p.value }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-7 h-7 rounded cursor-pointer border border-line bg-transparent"
            title="Custom color"
          />
          <span className="text-xs text-ink-mute font-mono">{color}</span>
        </div>
      </div>

      {/* Auto-hide date */}
      <div>
        <label className="block text-xs text-ink-mute mb-1">
          Auto-hide after <span className="text-ink-mute/60">(optional)</span>
        </label>
        <input
          type="date"
          value={hideAfter}
          onChange={(e) => setHideAfter(e.target.value)}
          className="bg-bg-elev border border-line rounded px-3 py-2 text-sm text-ink"
        />
        {hideAfter && (
          <button
            onClick={() => setHideAfter('')}
            className="ml-2 text-xs text-ink-mute hover:text-ink"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={isPending}
          className="bg-amber text-bg text-sm font-medium px-5 py-2 rounded hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save Banner'}
        </button>
      </div>
    </div>
  );
}
