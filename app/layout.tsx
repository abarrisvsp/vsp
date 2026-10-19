import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { EditModeProvider } from '@/components/edit-mode/EditModeProvider';
import { EditToolbar } from '@/components/edit-mode/EditToolbar';
import { Toaster } from 'sonner';
import { BannerBar } from '@/components/public/BannerBar';
import { JsonLd } from '@/components/seo/JsonLd';
import { organizationSchema, websiteSchema, personSchema } from '@/lib/seo/schema';
import { SITE, SITE_URL } from '@/lib/seo/config';
import { getSiteContent } from '@/lib/actions/content';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // No title.template: page titles already self-brand (e.g. "About | VSP"), so a
  // template would double the brand. No layout-level canonical either: a relative
  // canonical here propagates to every child route and points them all at "/".
  title:
    'Visionary Sound Productions · Event Production, Lighting & Sound · Detroit',
  description:
    'Full-service event production company. Stage, lighting, sound, video. Metro Detroit · Nationwide · Since 2004.',
  applicationName: SITE.name,
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    locale: SITE.ogLocale,
    url: SITE_URL,
  },
  twitter: { card: 'summary_large_image' },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const phone = await getSiteContent(['footer_phone'])
    .then((c) => c.footer_phone?.trim() || undefined)
    .catch(() => undefined);

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&family=Geist:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <JsonLd data={[organizationSchema({ phone }), websiteSchema(), { '@context': 'https://schema.org', ...personSchema() }]} />
        <BannerBar />
        <AuthProvider>
          <EditModeProvider>
            <EditToolbar />
            {children}
            <Toaster theme="dark" position="bottom-right" />
          </EditModeProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
