// app/admin/newsletter/page.tsx
import { auth } from '@/lib/auth';
import { getAllActiveSubscribersForAdmin, getSubscribersThisMonth } from '@/lib/actions/subscribers';
import { getSiteContent } from '@/lib/actions/content';
import { loadEmailWording } from '@/lib/email/template';
import { DEFAULT_EMAIL_WORDING } from '@/lib/email/wording';
import { dailyEmailLimit } from '@/lib/email/batch-send';
import { NewsletterAdmin } from '@/components/admin/NewsletterAdmin';

export const dynamic = 'force-dynamic';

export default async function NewsletterPage() {
  const [session, subscribers, thisMonth, content, wording] = await Promise.all([
    auth(),
    getAllActiveSubscribersForAdmin().catch(() => []),
    getSubscribersThisMonth().catch(() => 0),
    getSiteContent(['newsletter_headline', 'newsletter_subtext', 'newsletter_show_homepage', 'newsletter_show_blog']).catch(() => ({} as Record<string, string>)),
    loadEmailWording().catch(() => DEFAULT_EMAIL_WORDING),
  ]);

  return (
    <div className="px-8 py-10 max-w-3xl">
      <h1 className="font-serif italic text-4xl mb-1">Newsletter</h1>
      <p className="text-ink-mute text-sm mb-8">Send emails, manage subscribers, and edit email wording.</p>
      <NewsletterAdmin
        initialSubscribers={subscribers}
        thisMonth={thisMonth}
        wording={wording}
        defaultTestAddress={session?.user?.email ?? ''}
        dailyLimit={dailyEmailLimit()}
        initialHeadline={content.newsletter_headline || 'Stay in the loop'}
        initialSubtext={content.newsletter_subtext || 'Event tips & VSP updates, no spam.'}
        initialShowHomepage={content.newsletter_show_homepage === 'true'}
        initialShowBlog={content.newsletter_show_blog === 'true'}
      />
    </div>
  );
}
