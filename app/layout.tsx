import AskAyoub from '@/components/ui/AskAyoub';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });


export const metadata: Metadata = {
  metadataBase: new URL('https://ton-site.com'), // remplace par l'adresse réelle de ton site
  title: 'Ayoub Ait Chikh — Full-Stack Software Engineer',
  description:
    'Software and AI engineer open to full-time, part-time and freelance work. Take a ride through my career.',
  openGraph: {
    title: 'Ayoub Ait Chikh — Full-Stack Software Engineer',
    description:
      'Software and AI engineer open to full-time, part-time and freelance work. Take a ride through my career.',
    url: '/',
    siteName: 'Ayoub Ait Chikh',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Ayoub Ait Chikh portfolio' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ayoub Ait Chikh — Full-Stack Software Engineer',
    description: 'Software and AI engineer open to new challenges.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}
      <AskAyoub /></body>
    </html>
  );
}
