// components/layout/Header.tsx
import Link from 'next/link';
import Image from 'next/image';
import { getSiteContent } from '@/lib/actions/content';
import { getVisibleNavItems } from '@/lib/actions/navigation';
import { MobileNav } from './MobileNav';

const SERVICES_LINKS = [
  { href: '/event-production', label: 'Event Production' },
  { href: '/weddings', label: 'Weddings' },
  { href: '/mitzvahs', label: 'Mitzvahs' },
  { href: '/av-installation', label: 'AV Installation' },
  { href: '/rentals', label: 'Rentals' },
];

export async function Header({ active }: { active?: string }) {
  const [c, navItems] = await Promise.all([
    getSiteContent(['vsp_logo_url']),
    getVisibleNavItems(),
  ]);
  const logoUrl = c.vsp_logo_url;

  return (
    <header className="border-b border-line bg-bg/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-container mx-auto px-10 h-20 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3" aria-label="Visionary Sound Productions, Home">
          {logoUrl && (
            <Image
              src={logoUrl}
              alt=""
              width={64}
              height={64}
              className="h-14 w-14 object-contain shrink-0"
              priority
            />
          )}
          <span className="font-serif italic text-xl md:text-2xl tracking-tight leading-tight">
            Visionary Sound <span className="text-brand">Productions</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {navItems.map((item) => {
            if (item.href === 'dropdown') {
              return (
                <div key={item.id} className="relative group">
                  <button className={`hover:text-brand transition-colors ${active === '/services' ? 'text-brand' : 'text-ink-dim'}`}>
                    {item.label} ▾
                  </button>
                  <div className="absolute top-full left-0 pt-2 hidden group-hover:block z-50">
                    <div className="bg-bg-elev border border-line rounded shadow-lg py-1 min-w-[180px]">
                      {SERVICES_LINKS.map((s) => (
                        <Link
                          key={s.href}
                          href={s.href}
                          className="block px-4 py-2 text-sm text-ink-dim hover:text-brand hover:bg-bg-soft transition-colors"
                        >
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`hover:text-brand transition-colors ${active === item.href ? 'text-brand' : 'text-ink-dim'}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/contact"
          className="hidden md:inline-flex items-center gap-2 border border-brand text-brand text-sm px-5 py-2 rounded hover:bg-brand hover:text-bg transition-colors"
        >
          Get a Quote
        </Link>
        {/* Mobile menu (hamburger → drawer) */}
        <MobileNav navItems={navItems} services={SERVICES_LINKS} />
      </div>
    </header>
  );
}
