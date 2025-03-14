import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import Script from 'next/script'; // Import the next/script component

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DiamondAI',
  description: 'Upload your diamond certificate and get an easy-to-understand analysis of your diamond\'s specifications.',
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💎</text></svg>',
        type: 'image/svg+xml',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Head can remain empty or include metadata if needed */}
      </head>
      <body className={`${inter.className} bg-blue-50`}>
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>

        {/* Google Analytics using next/script */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-TC3TFPR9E5"
          strategy="afterInteractive" // Loads after the page is interactive
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive" // Ensures initialization happens after the script loads
        >
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