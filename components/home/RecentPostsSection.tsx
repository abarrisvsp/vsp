import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import type { BlogPost } from '@/lib/types';
import { SectionHead } from '@/components/shared/SectionHead';

export function RecentPostsSection({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;
  const feature = posts[0];
  const side = posts.slice(1, 3);

  return (
    <section className="max-w-container mx-auto px-10 py-24">
      <div className="mb-12 flex items-end justify-between gap-6">
        <SectionHead
          eyebrow="02 / In focus"
          title={<>Recent <em>work</em> &amp; gear we just brought online.</>}
        />
        <Link href="/blog" className="text-brand text-sm hidden md:inline-block whitespace-nowrap">View the journal →</Link>
      </div>
      <div className="grid md:grid-cols-2 gap-12">
        {feature && (
          <article className="group">
            <Link href={`/blog/${feature.slug}`}>
              {feature.cover_image_url && (
                <div className="relative aspect-[3/2] mb-6 overflow-hidden">
                  <Image
                    src={feature.cover_image_url}
                    alt={feature.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="flex items-center gap-3 mb-3">
                {feature.category_tag && (
                  <span className="text-xs uppercase tracking-wider bg-brand/15 text-brand px-2 py-1">
                    {feature.category_tag}
                  </span>
                )}
                {feature.date && (
                  <span className="text-xs uppercase tracking-wider text-ink-mute">
                    {format(new Date(feature.date), 'MMMM yyyy')}
                  </span>
                )}
              </div>
              <h3 className="font-serif italic text-3xl mb-3 leading-tight group-hover:text-brand transition-colors">
                {feature.title}
              </h3>
              {feature.excerpt && (
                <p className="text-ink-dim leading-relaxed mb-4">{feature.excerpt}</p>
              )}
              <span className="text-brand text-sm">Read the build notes →</span>
            </Link>
          </article>
        )}

        {side.length > 0 && (
          <div className="space-y-12">
            {side.map((p) => (
              <article key={p.id} className="group">
                <Link href={`/blog/${p.slug}`} className="grid grid-cols-[180px_1fr] gap-6 items-start">
                  {p.cover_image_url ? (
                    <div className="relative aspect-[3/2] overflow-hidden">
                      <Image
                        src={p.cover_image_url}
                        alt={p.title}
                        fill
                        className="object-cover"
                        sizes="180px"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[3/2] bg-bg-elev" />
                  )}
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-ink-mute mb-2">
                      {p.date ? format(new Date(p.date), 'MMM yyyy') : ''}
                      {p.category_tag ? ` · ${p.category_tag}` : ''}
                    </span>
                    <h4 className="font-serif italic text-xl group-hover:text-brand transition-colors leading-tight">
                      {p.title}
                    </h4>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
      <div className="mt-10 md:hidden">
        <Link href="/blog" className="text-brand text-sm">View the journal →</Link>
      </div>
    </section>
  );
}
