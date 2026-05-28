import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PostCard } from '@/components/blog/PostCard';
import { getPublishedPosts, getAllPostsForAdmin } from '@/lib/actions/blog';
import { auth } from '@/lib/auth';
import type { Metadata } from 'next';
import { getSeoSettings } from '@/lib/actions/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const row = await getSeoSettings('/blog').catch(() => null);
  return {
    title: row?.meta_title ?? 'Journal | Visionary Sound Productions',
    description: row?.meta_description ?? 'Full-service event production for weddings, mitzvahs, and corporate events. Stage, lighting, sound, and video across Metro Detroit and nationwide since 2004.',
    alternates: { canonical: '/blog' },
    openGraph: {
      images: row?.og_image_url ? [row.og_image_url] : [],
    },
  };
}

export default async function BlogIndex() {
  const session = await auth();
  const posts = session?.user?.isAdmin ? await getAllPostsForAdmin() : await getPublishedPosts();
  return (
    <>
      <Header active="/blog" />
      <main className="max-w-container mx-auto px-10 py-16">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-ink-mute">Journal</span>
            <h1 className="font-serif italic text-6xl mt-2">Field notes.</h1>
          </div>
          {session?.user?.isAdmin && (
            <Link href="/admin/blog/new" className="bg-brand text-white px-4 py-2 text-sm">Write new post</Link>
          )}
        </div>
        <div className="grid md:grid-cols-2 gap-12">
          {posts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
        {posts.length === 0 && <p className="text-ink-mute">No posts yet.</p>}
      </main>
      <Footer />
    </>
  );
}
