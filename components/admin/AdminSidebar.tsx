'use client';

import { useState, useEffect } from 'react';
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
  const [open, setOpen] = useState(false);

  // Close the mobile drawer on route change.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      {/* Mobile top bar with hamburger (hidden on md+) */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 h-14 flex items-center gap-3 px-4 border-b border-line bg-bg-elev">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open admin menu"
          aria-expanded={open}
          className="w-9 h-9 -ml-1 flex items-center justify-center text-ink"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span className="text-[10px] font-mono uppercase tracking-widest text-ink-mute">VSP Admin</span>
      </div>

      {/* Backdrop (mobile only, when open) */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/70" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar — static column on desktop, slide-in drawer on mobile */}
      <aside
        className={cn(
          'z-50 w-52 shrink-0 border-r border-line bg-bg-elev flex flex-col overflow-y-auto',
          'fixed inset-y-0 left-0 h-screen transition-transform duration-200',
          'md:sticky md:top-0 md:h-screen md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Branding */}
        <div className="px-4 py-5 border-b border-line flex items-start justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-ink-mute">VSP Admin</p>
            <p className="text-xs text-ink-dim mt-0.5">visionarysoundproductions.com</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="md:hidden text-ink-mute hover:text-ink text-xl leading-none -mr-1"
          >
            ×
          </button>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 py-3 px-2">
          {NAV.map(({ group, items }) => (
            <div key={group} className="mb-4">
              <p className="px-2 mb-1 text-[10px] font-mono uppercase tracking-[0.15em] text-ink-mute">
                {group}
              </p>
              {items.map(({ href, label, icon, exact }) => {
                const active = exact ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors',
                      active ? 'bg-amber/10 text-amber' : 'text-ink-dim hover:text-ink hover:bg-bg-soft'
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
    </>
  );
}
