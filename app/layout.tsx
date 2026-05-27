import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { EditModeProvider } from '@/components/edit-mode/EditModeProvider';
import { EditToolbar } from '@/components/edit-mode/EditToolbar';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Visionary Sound Productions — Event Production, Lighting & Sound · Detroit',
  description:
    'Full-service event production company. Stage, lighting, sound, video. Metro Detroit · Nationwide · Since 2004.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
        <AuthProvider>
          <EditModeProvider>
            <EditToolbar />
            {children}
            <Toaster theme="dark" position="bottom-right" />
          </EditModeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
