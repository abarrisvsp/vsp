'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  id: string;
  label: string;
  href: string;
}

interface Props {
  navItems: NavItem[];
  services: { href: string; label: string }[];
}

export function MobileNav({ navItems, services }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  // Prevent background scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="flex items-center justify-center w-10 h-10 -mr-2 text-ink"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {open && (
        <div role="dialog" aria-modal="true">
          <div className="fixed inset-0 z-50 bg-black/70" onClick={() => setOpen(false)} />
          <div className="fixed top-0 right-0 z-50 h-screen w-[80%] max-w-xs bg-bg-elev border-l border-line flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-5 h-16 border-b border-line">
              <span className="font-serif italic text-lg">Menu</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="w-10 h-10 -mr-2 text-ink-mute hover:text-ink text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <nav className="flex-1 px-2 py-3">
              {navItems.map((item) =>
                item.href === 'dropdown' ? (
                  <div key={item.id} className="mt-2">
                    <p className="px-3 py-1 text-[11px] font-mono uppercase tracking-widest text-ink-mute">
                      {item.label}
                    </p>
                    {services.map((s) => (
                      <Link
                        key={s.href}
                        href={s.href}
                        className={`block px-5 py-2.5 text-sm rounded ${
                          pathname === s.href ? 'text-brand' : 'text-ink-dim hover:text-ink'
                        }`}
                      >
                        {s.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`block px-3 py-2.5 text-sm rounded ${
                      pathname === item.href ? 'text-brand' : 'text-ink-dim hover:text-ink'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>

            <div className="p-4 border-t border-line">
              <Link
                href="/contact"
                className="flex items-center justify-center gap-2 border border-brand text-brand text-sm px-5 py-3 rounded hover:bg-brand hover:text-bg transition-colors"
              >
                Get a Quote
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
