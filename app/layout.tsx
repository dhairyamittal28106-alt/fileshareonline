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
