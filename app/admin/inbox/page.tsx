import Link from 'next/link';
import { InboxTable } from '@/components/admin/InboxTable';
import { getSubmissions } from '@/lib/actions/submissions';

export const dynamic = 'force-dynamic';

export default async function InboxPage({ searchParams }: { searchParams: { tab?: string } }) {
  const archived = searchParams.tab === 'archived';
  const subs = await getSubmissions(archived);

  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      <h1 className="font-serif italic text-4xl mb-2">Inbox</h1>
      <p className="text-ink-mute text-sm mb-8">Contact form submissions.</p>

      <div className="flex gap-4 mb-6 border-b border-line">
        <Link
          href="/admin/inbox"
          className={`pb-2 text-sm ${!archived ? 'border-b-2 border-amber text-amber' : 'text-ink-mute'}`}
        >
          Active
        </Link>
        <Link
          href="/admin/inbox?tab=archived"
          className={`pb-2 text-sm ${archived ? 'border-b-2 border-amber text-amber' : 'text-ink-mute'}`}
        >
          Archived
        </Link>
      </div>

      <InboxTable submissions={subs} archived={archived} />
    </div>
  );
}
