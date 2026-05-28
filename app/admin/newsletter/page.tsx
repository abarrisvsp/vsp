// app/admin/newsletter/page.tsx
import { getAllSubscribersForAdmin, getSubscribersThisMonth } from '@/lib/actions/subscribers';
import { getSiteContent } from '@/lib/actions/content';
import { NewsletterAdmin } from '@/components/admin/NewsletterAdmin';

export const dynamic = 'force-dynamic';

export default async function NewsletterPage() {
  const [{ subscribers, total }, thisMonth, content] = await Promise.all([
    getAllSubscribersForAdmin(1, 50).catch(() => ({ subscribers: [], total: 0 })),
    getSubscribersThisMonth().catch(() => 0),
    getSiteContent(['newsletter_headline', 'newsletter_subtext', 'newsletter_show_homepage', 'newsletter_show_blog']),
  ]);

  return (
    <div className="px-8 py-10 max-w-3xl">
      <h1 className="font-serif italic text-4xl mb-1">Newsletter</h1>
      <p className="text-ink-mute text-sm mb-8">Manage subscribers and opt-in form settings.</p>
      <NewsletterAdmin
        initialSubscribers={subscribers}
        total={total}
        thisMonth={thisMonth}
        initialHeadline={content.newsletter_headline || 'Stay in the loop'}
        initialSubtext={content.newsletter_subtext || 'Event tips & VSP updates, no spam.'}
        initialShowHomepage={content.newsletter_show_homepage === 'true'}
        initialShowBlog={content.newsletter_show_blog === 'true'}
      />
    </div>
  );
}
