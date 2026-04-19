import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import BackgroundEffects from '@/components/BackgroundEffects';
import AdContainer from '@/components/AdContainer';
import MobileOnlyTagScript from '@/components/MobileOnlyTagScript';
import PopunderScript from '@/components/PopunderScript';
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#020617] min-h-screen relative`}
      >
        <BackgroundEffects />
        <MobileOnlyTagScript />
        <PopunderScript />
        <AdContainer />

        <div className="fixed left-3 top-3 z-[50] block mobile-ad-hidden">
          <div className="w-[160px] h-[600px] overflow-hidden">
            <div id="left-ad" className="w-[160px] h-[600px] overflow-hidden" />
          </div>
        </div>

        <div className="fixed right-3 top-3 z-[50] block mobile-ad-hidden">
          <div className="w-[160px] h-[600px] overflow-hidden">
            <div id="right-ad" className="w-[160px] h-[600px] overflow-hidden" />
          </div>
        </div>

        <div className="absolute top-3 left-[518px] z-[60] block mobile-ad-hidden">
          <div className="w-[728px] h-[90px] overflow-hidden">
            <div id="top-ad" className="w-[728px] h-[90px] overflow-hidden" />
          </div>
        </div>

        <div className="fixed left-3 bottom-3 z-[50] block mobile-ad-hidden">
          <div className="w-[160px] h-[600px] overflow-hidden">
            <div id="left-ad-bottom" className="w-[160px] h-[600px] overflow-hidden" />
          </div>
        </div>

        <div className="fixed right-3 bottom-3 z-[50] block mobile-ad-hidden">
          <div className="w-[160px] h-[600px] overflow-hidden">
            <div id="right-ad-bottom" className="w-[160px] h-[600px] overflow-hidden" />
          </div>
        </div>

        <main className="relative z-10 w-full lg:pl-[190px] lg:pr-[190px] pb-24 lg:pb-0">
          {children}
        </main>

        <div className="relative z-20 w-full flex justify-center pb-3">
          <div className="flex items-end gap-3">
            <div className="hidden xl:block w-[300px] h-[250px] overflow-hidden">
              <div id="bottom-left-fill" className="w-[300px] h-[250px] overflow-hidden" />
            </div>

            <div className="w-full max-w-[728px] h-[90px] overflow-hidden">
              <div id="bottom-ad" className="w-full max-w-[728px] h-[90px] overflow-hidden" />
            </div>

            <div className="hidden xl:block w-[300px] h-[250px] overflow-hidden">
              <div id="bottom-right-fill" className="w-[300px] h-[250px] overflow-hidden" />
            </div>
          </div>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
