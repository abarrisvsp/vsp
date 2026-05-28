'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV = [
  {
    group: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: '📊', exact: true },
      { href: '/admin/inbox', label: 'Inbox', icon: '📬' },
    ],
  },
  {
    group: 'Content',
    items: [
      { href: '/admin/blog', label: 'Blog Posts', icon: '📝' },
      { href: '/admin/featured-work', label: 'Featured Work', icon: '⭐' },
      { href: '/admin/faqs', label: 'FAQs', icon: '❓' },
      { href: '/admin/media', label: 'Media Library', icon: '🖼' },
    ],
  },
  {
    group: 'Marketing',
    items: [
      { href: '/admin/newsletter', label: 'Newsletter', icon: '✉️' },
      { href: '/admin/announcement', label: 'Announcement', icon: '📣' },
    ],
  },
  {
    group: 'Site',
    items: [
      { href: '/admin/seo', label: 'SEO', icon: '🔍' },
      { href: '/admin/navigation', label: 'Navigation', icon: '🔗' },
      { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-52 shrink-0 border-r border-line bg-bg-elev flex flex-col sticky top-0 h-screen overflow-y-auto">
      {/* Branding */}
      <div className="px-4 py-5 border-b border-line">
        <p className="text-[10px] font-mono uppercase tracking-widest text-ink-mute">VSP Admin</p>
        <p className="text-xs text-ink-dim mt-0.5">visionarysoundproductions.com</p>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 py-3 px-2">
        {NAV.map(({ group, items }) => (
          <div key={group} className="mb-4">
            <p className="px-2 mb-1 text-[10px] font-mono uppercase tracking-[0.15em] text-ink-mute">
              {group}
            </p>
            {items.map(({ href, label, icon, exact }) => {
              const active = exact
                ? pathname === href
                : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors',
                    active
                      ? 'bg-amber/10 text-amber'
                      : 'text-ink-dim hover:text-ink hover:bg-bg-soft'
                  )}
                >
                  <span>{icon}</span>
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Quick links */}
      <div className="border-t border-line px-2 py-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded text-sm text-ink-mute hover:text-ink hover:bg-bg-soft transition-colors"
        >
          <span>↗</span> View Site
        </a>
        <a
          href="/?editMode=1"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded text-sm text-ink-mute hover:text-ink hover:bg-bg-soft transition-colors"
        >
          <span>✏️</span> Edit Mode
        </a>
      </div>
    </aside>
  );
}
