import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { BlogPostEditor } from '@/components/blog/BlogPostEditor';
import { getPostById } from '@/lib/actions/blog';

export const dynamic = 'force-dynamic';

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const post = await getPostById(params.id);
  if (!post) notFound();
  return (
    <>
      <Header active="/blog" />
      <BlogPostEditor initial={post} />
    </>
  );
}
