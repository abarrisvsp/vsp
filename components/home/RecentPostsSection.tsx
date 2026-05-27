import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import type { BlogPost } from '@/lib/types';

export function RecentPostsSection({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;
  return (
    <section className="max-w-container mx-auto px-10 py-24">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-ink-mute">In focus</span>
          <h2 className="font-serif italic text-5xl mt-2">Recent thinking.</h2>
        </div>
        <Link href="/blog" className="text-amber text-sm">View the journal →</Link>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        {posts.map((p) => (
          <Link key={p.id} href={`/blog/${p.slug}`} className="group">
            {p.cover_image_url && (
              <div className="relative aspect-[16/10] mb-4 overflow-hidden">
                <Image src={p.cover_image_url} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            )}
            <div className="text-xs uppercase tracking-wider text-ink-mute mb-2">
              {p.category_tag} {p.date && <>· {format(new Date(p.date), 'MMM d, yyyy')}</>}
            </div>
            <h3 className="font-serif italic text-2xl mb-2 group-hover:text-amber transition-colors">{p.title}</h3>
            {p.excerpt && <p className="text-ink-dim text-sm">{p.excerpt}</p>}
          </Link>
        ))}
      </div>
    </section>
  );
}
