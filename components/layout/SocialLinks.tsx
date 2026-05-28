const FACEBOOK_URL = 'https://www.facebook.com/VisionarySoundProductionsLLC/';

export function SocialLinks({ className = '', size = 16 }: { className?: string; size?: number }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <a
        href={FACEBOOK_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Visionary Sound Productions on Facebook"
        className="text-ink-mute hover:text-amber transition-colors"
      >
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 4.99 3.66 9.13 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.77l-.44 2.91h-2.33V22c4.78-.81 8.43-4.95 8.43-9.94Z" />
        </svg>
      </a>
    </div>
  );
}
