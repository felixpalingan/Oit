import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const viewport: Viewport = {
  themeColor: "#FF5C00",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://oit.app"),
  title: {
    default: "Oit — Real-Time Messaging & Voice/Video Rooms",
    template: "%s | Oit",
  },
  description:
    "Fast, lightweight, and modern real-time communication platform with instant chat, encrypted channels, and low-latency voice and video rooms.",
  keywords: [
    "Oit",
    "instant messaging",
    "realtime chat",
    "voice channels",
    "video call",
    "group chat",
    "discord alternative",
    "collaboration",
  ],
  authors: [{ name: "Oit Team" }],
  creator: "Oit",
  publisher: "Oit",
  icons: {
    icon: [
      { url: "/oit_logo.png", sizes: "32x32", type: "image/png" },
      { url: "/oit_logo.png", sizes: "192x192", type: "image/png" },
      { url: "/oit_logo.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/oit_logo.png",
    apple: [{ url: "/oit_logo.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Oit — Real-Time Messaging & Voice/Video Rooms",
    description:
      "Fast, lightweight, and modern real-time communication platform with instant chat, encrypted channels, and low-latency voice and video rooms.",
    url: "https://oit.app",
    siteName: "Oit",
    images: [
      {
        url: "/oit_logo.png",
        width: 512,
        height: 512,
        alt: "Oit Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Oit — Real-Time Messaging & Voice/Video Rooms",
    description:
      "Fast, lightweight, and modern real-time communication platform with instant chat, encrypted channels, and low-latency voice and video rooms.",
    images: ["/oit_logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#050505] text-zinc-100">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
