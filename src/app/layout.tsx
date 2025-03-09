import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import Script from 'next/script'; // Import next/script

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Diamond Certificate Analyzer',
  description: 'Upload your diamond certificate and get an easy-to-understand analysis of your diamond\'s specifications.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body className={`${inter.className} bg-blue-50`}>
        <Navigation />
        <main className="container mx-auto px-4 py-8">{children}</main>

        {/* Google Analytics using next/script */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-TC3TFPR9E5"
          strategy="afterInteractive" // Load after the page is interactive
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-TC3TFPR9E5');
          `}
        </Script>
      </body>
    </html>
  );
}