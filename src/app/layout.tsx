
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider";
import Script from 'next/script'; // Import next/script
import { Analytics } from '@vercel/analytics/react';

const siteName = 'NewsFlash';
const siteDescription = 'Stay updated with the latest news from around the world with NewsFlash.';
const siteUrl = 'https://news-general.vercel.app'; 
const ogImageUrl = `${siteUrl}/og-image.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} - Your Daily News`,
    template: `%s - ${siteName}`,
  },
  description: siteDescription,
  keywords: ['news', 'headlines', 'world news', 'local news', 'breaking news', 'daily news', 'NewsFlash'],
  openGraph: {
    title: {
      default: `${siteName} - Your Daily News`,
      template: `%s - ${siteName}`,
    },
    description: siteDescription,
    url: '/',
    siteName: siteName,
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: `${siteName} - Your Daily News`,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: {
      default: `${siteName} - Your Daily News`,
      template: `%s - ${siteName}`,
    },
    description: siteDescription,
    images: [ogImageUrl],
    // creator: '@yourtwitterhandle', // Optional: Add your Twitter handle
  },
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'KLCRqwOJ5a8BjajsNnhzJaulnfvHHSwif-tZw57An7I',
  },
  // icons: { // Example, if you have a favicon
  //   icon: '/favicon.ico',
  //   apple: '/apple-touch-icon.png',
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="KLCRqwOJ5a8BjajsNnhzJaulnfvHHSwif-tZw57An7I" />
        <meta name="google-adsense-account" content="ca-pub-6805990598879954" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
        <Script
          id="adsbygoogle-script"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6805990598879954"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
