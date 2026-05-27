import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getUnreadSubmissionCount } from '@/lib/actions/submissions';
import { getAllPostsForAdmin } from '@/lib/actions/blog';
import { getSubscriberCount } from '@/lib/actions/subscribers';

export const dynamic = 'force-dynamic';

export default async function AdminHome() {
  const [unread, posts, subscriberCount] = await Promise.all([
    getUnreadSubmissionCount(),
    getAllPostsForAdmin().catch(() => []),
    getSubscriberCount().catch(() => 0),
  ]);
  const drafts = posts.filter((p) => !p.published).length;
  const published = posts.length - drafts;

  const card =
    'block border border-line bg-bg-elev p-6 hover:border-amber transition-colors';
  const label = 'text-xs uppercase tracking-[0.2em] text-ink-mute';
  const num = 'font-serif italic text-5xl text-amber mt-2';
  const desc = 'text-ink-dim text-sm mt-1';

  return (
    <>
      <Header />
      <main className="max-w-container mx-auto px-10 py-16">
        <div className="mb-12">
          <span className={label}>Admin</span>
          <h1 className="font-serif italic text-5xl mt-2">Control room.</h1>
          <p className="text-ink-dim mt-3 max-w-2xl">
            Most editing happens directly on the site — log into any page and toggle{' '}
            <span className="text-amber">Edit mode: ON</span>. This page is just for the
            two things that don&apos;t have a public counterpart: the contact inbox and
            blog posts.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/admin/inbox" className={card}>
            <div className={label}>Inbox</div>
            <div className={num}>{unread}</div>
            <div className={desc}>
              {unread === 0
                ? 'No new contact submissions.'
                : `Unread contact ${unread === 1 ? 'submission' : 'submissions'}.`}
            </div>
          </Link>

          <Link href="/blog" className={card}>
            <div className={label}>Journal</div>
            <div className={num}>
              {published}
              {drafts > 0 && (
                <span className="text-ink-mute text-2xl ml-2">+ {drafts} draft</span>
              )}
            </div>
            <div className={desc}>
              Published posts. Click to view all and write a new one.
            </div>
          </Link>

          <div className={card}>
            <div className={label}>Subscribers</div>
            <div className={num}>{subscriberCount}</div>
            <div className={desc}>
              Active email subscribers — auto-notified on every new published post.
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-line pt-8 text-sm text-ink-dim space-y-2">
          <p className="text-ink-mute text-xs uppercase tracking-wider">Quick links</p>
          <ul className="space-y-1">
            <li>
              <Link href="/admin/blog/new" className="hover:text-amber">
                Write new blog post →
              </Link>
            </li>
            <li>
              <Link href="/" className="hover:text-amber">
                Edit homepage content →
              </Link>
            </li>
            <li>
              <Link href="/gallery" className="hover:text-amber">
                Manage gallery photos →
              </Link>
            </li>
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
