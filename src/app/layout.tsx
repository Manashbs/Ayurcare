import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import SmoothScroll from '@/components/ui/SmoothScroll';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const fraunces = Fraunces({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VedaSync AI — Ancient Wisdom, Modern Care',
  description: 'Sync your biological rhythms with 5,000 years of Ayurvedic wisdom and advanced AI diagnostics. Consult verified Ayurvedic physicians, analyze reports, and discover your Prakriti.',
  keywords: 'ayurveda, vedasync, telehealth, dosha, prakriti, AI health, ayurvedic consultation, wellness, vata, pitta, kapha',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-ink">
        <AuthProvider>
          <SmoothScroll>
            <div className="flex-1 flex flex-col">
              {children}
            </div>
          </SmoothScroll>
        </AuthProvider>
      </body>
    </html>
  );
}
