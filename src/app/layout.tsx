import '@fortawesome/fontawesome-svg-core/styles.css';
import './globals.css';

import { config } from '@fortawesome/fontawesome-svg-core';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import type { ReactNode } from 'react';

import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { CartStoreProvider } from '@/providers/cart-store-provider';

config.autoAddCss = false;

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Morrow — Considered goods for everyday life',
    template: '%s | Morrow',
  },
  description: 'A considered collection of useful, beautiful things for everyday life.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f7f5ef',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang='en'
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className='flex min-h-full flex-col bg-canvas text-ink'>
        <CartStoreProvider>
          <SiteHeader />
          <main className='flex-1'>{children}</main>
          <SiteFooter />
        </CartStoreProvider>
      </body>
    </html>
  );
}
