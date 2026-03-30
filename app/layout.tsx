import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Providers } from "@/components/providers";
import { getMetadataBase } from "@/lib/site-url";

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
  metadataBase: getMetadataBase(),
  title: {
    default: "Router Review Storefront – Compare Wireless Routers And Reviews",
    template: "%s | Router Review Storefront",
  },
  description:
    "Browse wireless routers with Amazon affiliate links, YouTube reviews, and trusted third-party review articles in one place.",
  applicationName: "Router Review Storefront",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Router Review Storefront",
    title: "Router Review Storefront – Compare Wireless Routers And Reviews",
    description:
      "A simple storefront for comparing wireless routers with review videos, article reviews, and Amazon affiliate links.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Router Review Storefront – Compare Wireless Routers And Reviews",
    description:
      "Compare routers, watch reviews, read articles, and buy through Amazon affiliate links.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
