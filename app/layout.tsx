import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from 'next/script';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata
export const metadata: Metadata = {
  title: "SHAREDROP",
  description: "Secure P2P File Sharing",
  other: {
    "google-adsense-account": "ca-pub-8295491395007414"
  },
  verification: {
    google: "vQRyg2EFVrK_goOXF3R6bQPn0uXhSlzUmkOAbdzgb28",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-8295491395007414" />
        <meta name="monetag" content="fe045356d3a3c4f9ea6bdc7c61da7497" />
        {/* Multitag / Epic Tag */}
        <Script 
          src="https://quge5.com/88/tag.min.js" 
          data-zone="227979" 
          strategy="afterInteractive" 
          data-cfasync="false"
        />
        {/* Popunder Ad (Anti-Adblock) */}
        <Script 
          src="https://ruffianattorneymargarine.com/b5/69/eb/b569eb7b791361d8ac7541e832179947.js" 
          strategy="afterInteractive" 
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        {/* Social Bar (Anti-Adblock) */}
        <Script 
          src="https://ruffianattorneymargarine.com/0d/14/aa/0d14aa83af9eea8f8000642c5b5aebf.js" 
          strategy="afterInteractive" 
        />
      </body>
    </html>
  );
}
