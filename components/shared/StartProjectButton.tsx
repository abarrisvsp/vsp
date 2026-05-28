import Link from 'next/link';

interface StartProjectButtonProps {
  label?: string;
  href?: string;
  className?: string;
  /** Size variant. 'default' is the main CTA size; 'sm' is for tight headers/nav. */
  size?: 'default' | 'sm';
}

/**
 * Outlined pill button with an amber dot indicator on the left.
 * Used as the primary "Start a project / Contact" CTA across the site.
 */
export function StartProjectButton({
  label = 'Start a project',
  href = '/contact',
  className = '',
  size = 'default',
}: StartProjectButtonProps) {
  const sizing =
    size === 'sm'
      ? 'px-4 py-1.5 text-xs gap-2'
      : 'px-6 py-3 text-sm gap-3';

  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <Link
      href={href}
      className={`group inline-flex items-center ${sizing} border border-line rounded-full text-ink font-medium hover:border-amber transition-colors ${className}`}
    >
      <span
        className={`${dotSize} rounded-full bg-amber group-hover:scale-125 transition-transform`}
        aria-hidden="true"
      />
      {label}
    </Link>
  );
}
