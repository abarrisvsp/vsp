import { unsubscribeByToken } from '@/lib/actions/subscribers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token || '';
  const result = token ? await unsubscribeByToken(token) : { success: false };

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-24 text-center">
        {result.success ? (
          <>
            <span className="text-xs uppercase tracking-[0.2em] text-ink-mute">Unsubscribed</span>
            <h1 className="font-serif italic text-5xl mt-2 mb-6">You&apos;re off the list.</h1>
            <p className="text-ink-dim mb-8">
              {result.email
                ? `${result.email} won't receive any more emails from us.`
                : "We've removed you from our mailing list."}{' '}
              If this was a mistake, just resubscribe from the homepage.
            </p>
            <Link href="/" className="text-brand hover:text-ink text-sm">
              ← Back to homepage
            </Link>
          </>
        ) : (
          <>
            <h1 className="font-serif italic text-4xl mb-4">Hmm.</h1>
            <p className="text-ink-dim mb-8">
              That unsubscribe link looks invalid or has already been used. If you&apos;re still
              getting emails, reply to one and we&apos;ll remove you manually.
            </p>
            <Link href="/" className="text-brand hover:text-ink text-sm">
              ← Back to homepage
            </Link>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
