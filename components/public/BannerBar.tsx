// components/public/BannerBar.tsx
// Async server component — renders on every public page request.
// Returns null (no HTML) when banner is inactive or expired.
import { getSiteContent } from '@/lib/actions/content';

export async function BannerBar() {
  const c = await getSiteContent([
    'banner_active',
    'banner_message',
    'banner_color',
    'banner_hide_after',
  ]);

  if (c.banner_active !== 'true') return null;
  if (!c.banner_message) return null;
  if (c.banner_hide_after) {
    const hideDate = new Date(c.banner_hide_after);
    if (!isNaN(hideDate.getTime()) && hideDate <= new Date()) return null;
  }

  // Short hash of message — used as the localStorage key so the banner
  // re-appears automatically when Aaron changes the message.
  const hash = c.banner_message
    .split('')
    .reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) & 0xffff, 0)
    .toString(16);

  return (
    <div
      id="vsp-banner"
      style={{ backgroundColor: c.banner_color || '#ef4444' }}
      className="relative flex items-center justify-center px-6 py-2.5 text-sm font-medium"
    >
      <span
        style={{ color: isLight(c.banner_color || '#ef4444') ? '#000' : '#fff' }}
        dangerouslySetInnerHTML={{ __html: c.banner_message }}
      />
      <button
        id="vsp-banner-close"
        data-hash={hash}
        style={{ color: isLight(c.banner_color || '#ef4444') ? '#000' : '#fff' }}
        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 text-base"
        aria-label="Dismiss banner"
      >
        ✕
      </button>
      <script
        dangerouslySetInnerHTML={{
          __html: `
(function(){
  var key='vsp-banner-dismissed-${hash}';
  if(localStorage.getItem(key)){
    document.getElementById('vsp-banner').style.display='none';
    return;
  }
  document.getElementById('vsp-banner-close').addEventListener('click',function(){
    localStorage.setItem(key,'1');
    document.getElementById('vsp-banner').style.display='none';
  });
})();
          `.trim(),
        }}
      />
    </div>
  );
}

function isLight(hex: string): boolean {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}
