import { getSiteContent } from '@/lib/actions/content';
import { InlineText } from '@/components/edit-mode/InlineText';
import { SubscribeForm } from '@/components/blog/SubscribeForm';
import { SocialLinks } from '@/components/layout/SocialLinks';

export async function Footer() {
  const c = await getSiteContent([
    'footer_phone',
    'footer_email',
    'footer_address',
    'footer_service_area',
  ]);

  return (
    <footer className="border-t border-line bg-bg-elev mt-24">
      <div className="border-b border-line">
        <div className="max-w-container mx-auto px-10 py-12 grid md:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <h4 className="font-serif italic text-2xl mb-2">Stay in the loop</h4>
            <p className="text-ink-dim text-sm">Get an email when we publish a new project, feature, or behind-the-scenes write-up. No spam, unsubscribe any time.</p>
          </div>
          <SubscribeForm compact />
        </div>
      </div>
      <div className="max-w-container mx-auto px-10 py-16 grid md:grid-cols-4 gap-8 text-sm">
        <div>
          <h4 className="font-serif italic text-xl mb-3">Visionary Sound Productions</h4>
          <p className="text-ink-mute text-xs uppercase tracking-wider mb-1">Service area</p>
          <InlineText
            contentKey="footer_service_area"
            defaultValue={c.footer_service_area}
            tag="p"
            className="text-ink-dim"
            revalidate="/"
          />
        </div>
        <div>
          <p className="text-ink-mute text-xs uppercase tracking-wider mb-1">Phone</p>
          <InlineText
            contentKey="footer_phone"
            defaultValue={c.footer_phone}
            tag="p"
            className="text-ink"
            revalidate="/"
          />
        </div>
        <div>
          <p className="text-ink-mute text-xs uppercase tracking-wider mb-1">Email</p>
          <InlineText
            contentKey="footer_email"
            defaultValue={c.footer_email}
            tag="p"
            className="text-ink"
            revalidate="/"
          />
        </div>
        <div>
          <p className="text-ink-mute text-xs uppercase tracking-wider mb-1">Studio</p>
          <InlineText
            contentKey="footer_address"
            defaultValue={c.footer_address}
            tag="p"
            className="text-ink-dim"
            revalidate="/"
          />
        </div>
      </div>
      <div className="border-t border-line">
        <div className="max-w-container mx-auto px-10 py-4 text-xs text-ink-mute flex items-center justify-between gap-4">
          <span>© {new Date().getFullYear()} Visionary Sound Productions</span>
          <div className="flex items-center gap-6">
            <SocialLinks />
            <span>Owner-operated since 2004</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
