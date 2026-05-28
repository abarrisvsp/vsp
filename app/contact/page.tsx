import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ContactForm } from '@/components/contact/ContactForm';
import { getSiteContent } from '@/lib/actions/content';
import { InlineRichText } from '@/components/edit-mode/InlineRichText';
import type { Metadata } from 'next';
import { getSeoSettings } from '@/lib/actions/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const row = await getSeoSettings('/contact').catch(() => null);
  return {
    title: row?.meta_title ?? 'Contact | Visionary Sound Productions',
    description: row?.meta_description ?? 'Full-service event production — sound, lighting & DJ. NYC tri-state area.',
    openGraph: {
      images: row?.og_image_url ? [row.og_image_url] : [],
    },
  };
}

const KEYS = [
  'footer_phone', 'footer_email', 'footer_address', 'footer_service_area',
  'contact_eyebrow', 'contact_headline', 'contact_lede',
  'contact_promise_1', 'contact_promise_2', 'contact_promise_3',
  'contact_quote', 'contact_quote_author',
];

const DEFAULTS: Record<string, string> = {
  contact_eyebrow: 'Get in touch',
  contact_headline: 'Tell us about your event.',
  contact_lede: "Owner-direct. No call centers, no junior reps. You'll hear back from Aaron within one business day — usually much sooner.",
  contact_promise_1: 'Free consultation — no charge to talk it through',
  contact_promise_2: 'Fixed-price proposal — no day-of surprises',
  contact_promise_3: 'One point of contact, start to load-out',
  contact_quote: "We've used VSP at BHS for four years. Reliable, creative, and they make every show better.",
  contact_quote_author: 'Bill M. · Brighton High School',
};

export default async function ContactPage() {
  const c = await getSiteContent(KEYS);
  const val = (k: string) => c[k] || DEFAULTS[k] || '';

  return (
    <>
      <Header active="/contact" />
      <main>
        <div className="max-w-container mx-auto px-10 py-16 grid lg:grid-cols-[1fr_2fr] gap-16">
          {/* SIDEBAR */}
          <aside className="space-y-10">
            <div>
              <InlineRichText inline
                contentKey="contact_eyebrow"
                defaultValue={val('contact_eyebrow')}
                tag="span"
                className="block text-xs uppercase tracking-[0.2em] text-ink-mute mb-4"
                revalidate="/contact"
              />
              <InlineRichText
                contentKey="contact_headline"
                defaultValue={val('contact_headline')}
                tag="h1"
                className="font-serif italic font-normal text-[clamp(40px,5vw,72px)] leading-[1.05] tracking-tight mb-6"
                revalidate="/contact"
              />
              <InlineRichText
                contentKey="contact_lede"
                defaultValue={val('contact_lede')}
                tag="p"
                className="text-ink-dim leading-relaxed"
                revalidate="/contact"
              />
            </div>

            {/* Contact card */}
            <div className="border border-line">
              <ContactRow label="Phone" value={c.footer_phone || '(248) 762-2898'} href={`tel:${(c.footer_phone || '').replace(/[^\d+]/g, '')}`} />
              <ContactRow label="Email" value={c.footer_email || 'Aaron@VisionarySoundProductions.com'} href={`mailto:${c.footer_email || ''}`} />
              <ContactRow label="Studio" value={c.footer_address || 'Commerce Township, MI 48382'} subtext="By appointment only" />
              <ContactRow label="Service area" value={c.footer_service_area || 'Metro Detroit · Midwest · Nationwide on request'} />
            </div>

            {/* Promises */}
            <ul className="space-y-3 text-sm">
              {[1, 2, 3].map((n) => (
                <li key={n} className="flex gap-3">
                  <span className="text-amber font-bold">✓</span>
                  <InlineRichText inline
                    contentKey={`contact_promise_${n}`}
                    defaultValue={val(`contact_promise_${n}`)}
                    tag="span"
                    className="text-ink-dim"
                    revalidate="/contact"
                  />
                </li>
              ))}
            </ul>
          </aside>

          {/* FORM */}
          <ContactForm />
        </div>

        {/* TRAILING TESTIMONIAL */}
        <section className="border-y border-line bg-bg-elev">
          <div className="max-w-3xl mx-auto px-10 py-20 text-center">
            <span className="block text-xs uppercase tracking-[0.2em] text-ink-mute mb-6">In their words</span>
            <InlineRichText
              contentKey="contact_quote"
              defaultValue={val('contact_quote')}
              tag="p"
              className="font-serif italic text-2xl md:text-3xl leading-snug mb-6"
              revalidate="/contact"
            />
            <InlineRichText inline
              contentKey="contact_quote_author"
              defaultValue={val('contact_quote_author')}
              tag="span"
              className="text-sm text-ink-dim not-italic"
              revalidate="/contact"
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function ContactRow({ label, value, href, subtext }: { label: string; value: string; href?: string; subtext?: string }) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-4 px-4 py-3 border-b border-line last:border-b-0">
      <span className="text-xs uppercase tracking-wider text-ink-mute">{label}</span>
      <div>
        {href ? <a href={href} className="text-ink hover:text-amber break-all">{value}</a> : <span className="text-ink">{value}</span>}
        {subtext && <p className="text-xs text-ink-mute mt-1">{subtext}</p>}
      </div>
    </div>
  );
}
