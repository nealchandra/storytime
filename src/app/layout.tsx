import { Inter } from 'next/font/google';
import Link from 'next/link';

import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

import { Providers } from './providers';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable
        )}
      >
        <header>
          <nav>
            <Link href="/">Home</Link> | <Link href="/about">About</Link>
          </nav>
        </header>
        <Providers>
          {children}
          <Toaster />
        </Providers>
        <footer>
          <hr />
          <span>
            <Link href="mailto:feedback@storytime.place">Feedback</Link>
          </span>
        </footer>
      </body>
    </html>
  );
}
