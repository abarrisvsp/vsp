import { Header } from '@/components/layout/Header';
import { BlogPostEditor } from '@/components/blog/BlogPostEditor';

export const dynamic = 'force-dynamic';

export default function NewPostPage() {
  return (
    <>
      <Header active="/blog" />
      <BlogPostEditor />
    </>
  );
}
