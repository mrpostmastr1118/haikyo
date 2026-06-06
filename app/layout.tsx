import type { Metadata } from 'next';
import Header from '@/components/Header';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — 廃墟・遺構を地図でめぐる`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  verification: {
    google: 'AMvO0A-LMbmO-KeP9XAzW6h92RJ2KfoKjrWTqG6UUeI',
  },
  openGraph: {
    siteName: SITE_NAME,
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="ja" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Noto+Serif+JP:wght@300;400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex flex-col h-full">
        {gaId && <GoogleAnalytics gaId={gaId} />}
        <Header />
        <main className="flex-1 min-h-0 overflow-hidden relative">
          {children}
        </main>
      </body>
    </html>
  );
}
