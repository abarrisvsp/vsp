import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ContactForm } from '@/components/contact/ContactForm';

export default function ContactPage() {
  return (
    <>
      <Header active="/contact" />
      <main className="max-w-container mx-auto px-10 py-16 grid md:grid-cols-[1fr_2fr] gap-16">
        <aside>
          <span className="text-xs uppercase tracking-[0.2em] text-ink-mute">Get in touch</span>
          <h1 className="font-serif italic text-5xl mt-2 mb-6 leading-tight">Tell us about your event.</h1>
          <p className="text-ink-dim leading-relaxed">
            Owner-direct. No call centers, no junior reps. You&apos;ll hear back from Aaron within one business day — usually much sooner.
          </p>
          <div className="mt-8 space-y-4 text-sm">
            <div><p className="text-ink-mute text-xs uppercase mb-1">Phone</p><a href="tel:2487622898" className="text-ink hover:text-amber">(248) 762-2898</a></div>
            <div><p className="text-ink-mute text-xs uppercase mb-1">Email</p><a href="mailto:Aaron@VisionarySoundProductions.com" className="text-ink hover:text-amber">Aaron@VisionarySoundProductions.com</a></div>
          </div>
        </aside>
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
