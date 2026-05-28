import Link from 'next/link';
import { getSiteContent } from '@/lib/actions/content';
import { InlineRichText } from '@/components/edit-mode/InlineRichText';
import { InlineImage } from '@/components/edit-mode/InlineImage';
import { StartProjectButton } from '@/components/shared/StartProjectButton';

export async function HeroSection() {
  const c = await getSiteContent([
    'hero_headline',
    'hero_subheadline',
    'hero_spotlight',
    'hero_location_tag',
    'hero_bg_image',
  ]);

  return (
    <section className="relative min-h-[88vh] flex flex-col justify-end overflow-hidden">
      <div className="absolute inset-0">
        <InlineImage
          contentKey="hero_bg_image"
          defaultUrl={c.hero_bg_image}
          storageFolder="hero"
          alt="VSP event production"
          fill
          className="object-cover"
          sizes="100vw"
          priority
          revalidate="/"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-bg/20 pointer-events-none" />
      </div>

      <div className="relative max-w-container mx-auto px-10 pb-16 w-full">
        <InlineRichText inline
          contentKey="hero_location_tag"
          defaultValue={c.hero_location_tag}
          tag="span"
          className="block text-xs uppercase tracking-[0.2em] text-ink-mute mb-6"
          revalidate="/"
        />
        <InlineRichText
          contentKey="hero_headline"
          defaultValue={c.hero_headline}
          tag="h1"
          className="font-serif italic font-normal text-[clamp(56px,8.5vw,132px)] leading-[0.92] tracking-tight max-w-5xl"
          revalidate="/"
        />
        <div className="grid md:grid-cols-2 gap-10 mt-12 items-end">
          <InlineRichText
            contentKey="hero_subheadline"
            defaultValue={c.hero_subheadline}
            tag="p"
            className="text-ink-dim text-lg leading-relaxed max-w-xl"
            revalidate="/"
          />
          <div className="flex gap-3 md:justify-end">
            <StartProjectButton />
            <Link
              href="/gallery"
              className="inline-flex items-center px-6 py-3 text-sm text-ink-dim border border-line rounded-full hover:border-brand hover:text-ink transition-colors"
            >
              See the work
            </Link>
          </div>
        </div>
      </div>
      <div className="relative max-w-container mx-auto px-10 pb-8 w-full border-t border-line/40 pt-6 mt-6">
        <span className="text-xs uppercase tracking-wider text-ink-mute mr-3">Currently on file</span>
        <InlineRichText inline
          contentKey="hero_spotlight"
          defaultValue={c.hero_spotlight}
          tag="span"
          className="text-sm text-ink-dim"
          revalidate="/"
        />
      </div>
    </section>
  );
}
