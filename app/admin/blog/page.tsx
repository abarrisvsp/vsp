// app/admin/blog/page.tsx
import Link from 'next/link';
import { getAllPostsForAdmin } from '@/lib/actions/blog';

export const dynamic = 'force-dynamic';

export default async function BlogListPage() {
  const posts = await getAllPostsForAdmin().catch(() => []);

  return (
    <div className="px-8 py-10 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif italic text-4xl mb-1">Blog Posts</h1>
          <p className="text-ink-mute text-sm">{posts.length} post{posts.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="bg-brand text-bg text-sm font-medium px-4 py-2 rounded hover:opacity-90"
        >
          + New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="border border-dashed border-line rounded py-12 text-center text-sm text-ink-mute">
          No posts yet.{' '}
          <Link href="/admin/blog/new" className="text-brand hover:underline">
            Write your first post →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center gap-4 border border-line bg-bg-elev rounded px-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">{post.title}</p>
                <p className="text-xs text-ink-mute">{post.date}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {post.published ? (
                  <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded">
                    Published
                  </span>
                ) : post.published_at ? (
                  <span className="text-xs text-brand border border-brand/30 px-2 py-0.5 rounded">
                    🗓 {new Date(post.published_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                ) : (
                  <span className="text-xs bg-bg-soft text-ink-mute px-2 py-0.5 rounded">Draft</span>
                )}
              </div>
              <Link
                href={`/admin/blog/${post.id}`}
                className="text-xs border border-line text-ink-mute px-3 py-1.5 rounded hover:text-ink shrink-0"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
