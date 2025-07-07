import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import './html.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Recipe Summarizer',
  description: 'Summarize and structure recipes from web pages.',
  authors: [{ name: 'Troy DeSpain' }],
  openGraph: {
    title: 'Recipe Summarizer',
    description: 'Summarize and structure recipes from web pages.',
    url: 'https://recipe-ai.troydespain.com',
    siteName: 'Recipe Summarizer',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="my-10 max-w-2xl mx-auto px-4">{children}</div>
      </body>
    </html>
  );
}
