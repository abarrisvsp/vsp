import { notFound } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PublishedToggle } from '@/components/shared/PublishedToggle';
import Link from 'next/link';
import { getPostBySlug } from '@/lib/actions/blog';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  const session = await auth();
  if (!post) notFound();
  if (!post.published && !session?.user?.isAdmin) notFound();

  return (
    <>
      <Header active="/blog" />
      <main className="max-w-3xl mx-auto px-6 py-16">
        {session?.user?.isAdmin && (
          <div className="mb-6 flex justify-end gap-3">
            <PublishedToggle postId={post.id} initial={post.published} />
            <Link href={`/admin/blog/${post.id}`} className="text-amber text-sm">Edit full post →</Link>
          </div>
        )}
        {post.cover_image_url && (
          <div className="relative aspect-[16/9] mb-8">
            <Image src={post.cover_image_url} alt={post.title} fill className="object-cover" priority />
          </div>
        )}
        <div className="text-xs uppercase tracking-wider text-ink-mute mb-3">
          {post.category_tag} {post.date && <>· {format(new Date(post.date), 'MMMM d, yyyy')}</>} {post.read_time_minutes && <>· {post.read_time_minutes} min read</>}
        </div>
        <h1 className="font-serif italic text-5xl mb-6 leading-tight">{post.title}</h1>
        {post.excerpt && <p className="text-ink-dim text-xl mb-10 leading-relaxed">{post.excerpt}</p>}
        <article className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post.body_html || '' }} />
      </main>
      <Footer />
    </>
  );
}
