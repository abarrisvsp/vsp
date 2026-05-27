import Link from 'next/link';

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

export function Header({ active }: { active?: string }) {
  return (
    <header className="border-b border-line bg-bg/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-container mx-auto px-10 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif italic text-xl tracking-tight">
          Visionary Sound <span className="text-amber">Productions</span>
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
