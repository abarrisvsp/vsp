import { getSiteContent } from '@/lib/actions/content';
import { StartProjectButton } from './StartProjectButton';

export async function CtaBand({
  eyebrow = 'Get started',
  title,
  buttonLabel = 'Start a project',
  buttonHref = '/contact',
}: {
  eyebrow?: string;
  title?: React.ReactNode;
  buttonLabel?: string;
  buttonHref?: string;
}) {
  const c = await getSiteContent(['footer_phone', 'footer_email']);

  return (
    <section className="border-y border-line bg-bg-elev">
      <div className="max-w-container mx-auto px-10 py-20 grid md:grid-cols-[2fr_1fr] gap-12 items-start">
        <div>
          <span className="block text-xs uppercase tracking-[0.2em] text-ink-mute mb-4">{eyebrow}</span>
          <h2 className="font-serif italic font-normal text-[clamp(36px,5vw,64px)] leading-[1.05] tracking-tight">
            {title ?? (
              <>
                Tell us what you&rsquo;re planning.
                <br />
                <em>We&rsquo;ll tell you what it takes.</em>
              </>
            )}
          </h2>
        </div>
        <div className="space-y-6 md:pt-4">
          <StartProjectButton label={buttonLabel} href={buttonHref} />
          <div className="space-y-3 text-sm">
            <div>
              <span className="block text-xs uppercase tracking-wider text-ink-mute mb-1">Direct</span>
              <a href={`tel:${c.footer_phone?.replace(/[^\d+]/g, '')}`} className="text-ink hover:text-amber">{c.footer_phone}</a>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wider text-ink-mute mb-1">Email</span>
              <a href={`mailto:${c.footer_email}`} className="text-ink hover:text-amber break-all">{c.footer_email}</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
