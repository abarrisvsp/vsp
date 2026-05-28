import { ImageResponse } from 'next/og';
import { SITE } from '@/lib/seo/config';

export const alt = 'Visionary Sound Productions — Event Production, Lighting & Sound';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Branded default social-share card. Used for any page without its own og_image.
// Note: Satori (next/og) requires every element with >1 child to set display:flex.
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0b0a09',
          color: '#f5f1ea',
          padding: '80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 22,
            letterSpacing: 8,
            textTransform: 'uppercase',
            color: '#7a7468',
          }}
        >
          Since {SITE.foundingYear} · {SITE.serviceArea}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 84, fontStyle: 'italic', lineHeight: 1.05 }}>
            Visionary Sound
          </div>
          <div style={{ display: 'flex', fontSize: 84, fontStyle: 'italic', lineHeight: 1.05 }}>
            Productions
          </div>
          <div style={{ display: 'flex', fontSize: 30, color: '#b8b1a4', marginTop: 28 }}>
            {SITE.tagline}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', width: 48, height: 6, background: '#dc2626' }} />
          <div style={{ display: 'flex', width: 48, height: 6, background: '#2563eb' }} />
          <div style={{ display: 'flex', fontSize: 24, color: '#7a7468', marginLeft: 8 }}>
            visionarysoundproductions.com
          </div>
        </div>
      </div>
    ),
    size
  );
}
