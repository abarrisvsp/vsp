// app/admin/page.tsx
import Link from 'next/link';
import { getUnreadSubmissionCount, getRecentSubmissions } from '@/lib/actions/submissions';
import { getAllPostsForAdmin, getScheduledPostsCount } from '@/lib/actions/blog';
import { getSubscriberCount } from '@/lib/actions/subscribers';
import { formatDistanceToNow } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [unread, posts, scheduled, subscribers, recent] = await Promise.all([
    getUnreadSubmissionCount(),
    getAllPostsForAdmin().catch(() => []),
    getScheduledPostsCount().catch(() => 0),
    getSubscriberCount().catch(() => 0),
    getRecentSubmissions(3).catch(() => []),
  ]);
  const drafts = posts.filter((p) => !p.published && !p.published_at).length;

  const card = 'border border-line bg-bg-elev p-6 rounded hover:border-amber transition-colors';

  return (
    <div className="px-8 py-10 max-w-5xl">
      <h1 className="font-serif italic text-4xl mb-1">Dashboard</h1>
      <p className="text-ink-mute text-sm mb-10">Visionary Sound Productions</p>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Link href="/admin/inbox" className={card}>
          <div className="text-4xl font-serif italic text-amber">{unread}</div>
          <div className="text-xs text-ink-mute mt-1 uppercase tracking-wider">Unread Inquiries</div>
        </Link>
        <Link href="/admin/blog" className={card}>
          <div className="text-4xl font-serif italic text-amber">{drafts}</div>
          <div className="text-xs text-ink-mute mt-1 uppercase tracking-wider">Draft Posts</div>
        </Link>
        <Link href="/admin/blog" className={card}>
          <div className="text-4xl font-serif italic text-amber">{scheduled}</div>
          <div className="text-xs text-ink-mute mt-1 uppercase tracking-wider">Scheduled Posts</div>
        </Link>
        <Link href="/admin/newsletter" className={card}>
          <div className="text-4xl font-serif italic text-amber">{subscribers}</div>
          <div className="text-xs text-ink-mute mt-1 uppercase tracking-wider">Subscribers</div>
        </Link>
      </div>

      {/* Two-column lower section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent inquiries */}
        <div className="border border-line bg-bg-elev rounded p-5">
          <p className="text-xs font-mono uppercase tracking-widest text-ink-mute mb-4">
            Recent Inquiries
          </p>
          {recent.length === 0 ? (
            <p className="text-sm text-ink-mute">No submissions yet.</p>
          ) : (
            <div className="space-y-2">
              {recent.map((s) => (
                <Link
                  key={s.id}
                  href="/admin/inbox"
                  className="flex items-center justify-between text-sm px-3 py-2 rounded bg-bg-soft hover:bg-bg transition-colors"
                >
                  <span className={s.read ? 'text-ink-dim' : 'text-amber font-medium'}>
                    {!s.read && '● '}{s.full_name}
                  </span>
                  <span className="text-ink-mute text-xs">
                    {s.event_type} · {formatDistanceToNow(new Date(s.submitted_at), { addSuffix: true })}
                  </span>
                </Link>
              ))}
            </div>
          )}
          <Link href="/admin/inbox" className="block mt-3 text-xs text-amber hover:underline">
            View all →
          </Link>
        </div>

        {/* Quick actions */}
        <div className="border border-line bg-bg-elev rounded p-5">
          <p className="text-xs font-mono uppercase tracking-widest text-ink-mute mb-4">
            Quick Actions
          </p>
          <div className="space-y-2">
            {[
              { href: '/admin/blog/new', label: '+ New Blog Post' },
              { href: '/admin/featured-work/new', label: '+ Add Featured Work' },
              { href: '/admin/media', label: '🖼 Media Library' },
              { href: '/', label: '↗ View Live Site', external: true },
            ].map(({ href, label, external }) => (
              <a
                key={href}
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className="block px-3 py-2 rounded bg-bg-soft hover:bg-bg text-sm text-ink-dim hover:text-ink transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
