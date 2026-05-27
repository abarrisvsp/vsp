import Link from 'next/link';
import Image from 'next/image';
import { getSiteContent } from '@/lib/actions/content';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/event-production', label: 'Event Production' },
  { href: '/weddings', label: 'Weddings' },
  { href: '/mitzvahs', label: 'Mitzvahs' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/blog', label: 'Journal' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export async function Header({ active }: { active?: string }) {
  const c = await getSiteContent(['vsp_logo_url']);
  const logoUrl = c.vsp_logo_url;

  return (
    <header className="border-b border-line bg-bg/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-container mx-auto px-10 h-20 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3" aria-label="Visionary Sound Productions — Home">
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
            Visionary Sound <span className="text-amber">Productions</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`hover:text-amber transition-colors ${
                active === n.href ? 'text-amber' : 'text-ink-dim'
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/contact"
          className="md:hidden text-xs uppercase tracking-wider text-amber"
        >
          Contact
        </Link>
      </div>
    </header>
  );
}
