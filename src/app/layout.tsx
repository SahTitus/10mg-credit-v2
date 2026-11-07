import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProviders } from '@/components/providers/app-providers';
import { buildThemeInitScript } from '@/lib/utils/theme';

export const viewport: Viewport = {
  themeColor: '#146ec4',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
  ),
  title: {
    default: '10mg Credit V2 | White-Label Lending Platform',
    template: '%s | 10mg Credit V2',
  },
  description:
    'Enterprise multi-tenant credit and lending infrastructure for healthcare financial institutions.',
  applicationName: '10mg Credit V2',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    shortcut: ['/favicon.ico'],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: '10mg Credit V2 | White-Label Lending Platform',
    description:
      'Enterprise multi-tenant credit and lending infrastructure for healthcare financial institutions.',
    url: '/',
    siteName: '10mg Credit V2',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '10mg Credit V2 — White-Label Lending Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '10mg Credit V2 | White-Label Lending Platform',
    description:
      'Enterprise multi-tenant credit and lending infrastructure for healthcare financial institutions.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: buildThemeInitScript() }} />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
