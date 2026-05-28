import { ReactNode } from 'react';

export function SectionHead({
  eyebrow,
  title,
  align = 'left',
  className = '',
}: {
  eyebrow?: string;
  title: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <header className={`${align === 'center' ? 'text-center' : ''} ${className}`}>
      {eyebrow && (
        <span className="block text-xs uppercase tracking-[0.2em] text-ink-mute mb-4">{eyebrow}</span>
      )}
      <h2 className="font-serif italic font-normal text-[clamp(36px,5vw,64px)] leading-[1.0] tracking-tight max-w-3xl">
        {title}
      </h2>
    </header>
  );
}
