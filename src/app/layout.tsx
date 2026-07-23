import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

const outfit = Outfit({
  variable: '--font-display',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'VedaSync AI - Next-Gen Ayurvedic Telehealth & AI Wellness',
  description: 'Sync your biological rhythms with ancient wisdom and advanced AI. Consult verified Ayurvedic physicians online, analyze reports, and take the Prakriti Dosha assessment.',
  keywords: 'ayurveda, veda, vedasync, telehealth, telemedicine, wellness, dosha quiz, vata, pitta, kapha, herbal remedies, AI health report analyzer, online doctor consultation',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-full flex flex-col bg-cream text-foreground">
        <AuthProvider>
          <div className="flex-1 flex flex-col">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
