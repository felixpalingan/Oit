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
};

const getSiteUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'https://oit-seven.vercel.app';
};
const siteUrl = getSiteUrl().replace(/\/$/, '');

const authorPortfolioUrl = "https://portfolio-felix-bariq.vercel.app";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${siteUrl}/#webapp`,
      "name": "Oit",
      "url": siteUrl,
      "applicationCategory": "CommunicationApplication",
      "operatingSystem": "Web, iOS, Android, macOS, Windows",
      "browserRequirements": "Requires JavaScript. Requires HTML5.",
      "softwareVersion": "1.0.0",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      "description":
        "Fast, lightweight, and modern real-time communication platform with instant chat, encrypted channels, and low-latency voice and video rooms.",
      "image": `${siteUrl}/oit_logo.png`,
      "featureList": [
        "Real-Time Instant Messaging with Optimistic UI",
        "Ultra Low-Latency LiveKit WebRTC Voice & Video Rooms",
        "Encrypted & PIN-Locked Private Channels",
        "Granular Role & Server Permission Management",
        "Interactive Presence & Active Call Signals",
        "Progressive Web App (PWA) Support",
      ],
      "author": {
        "@id": `${authorPortfolioUrl}/#author`,
      },
      "creator": {
        "@id": `${authorPortfolioUrl}/#author`,
      },
    },
    {
      "@type": "Person",
      "@id": `${authorPortfolioUrl}/#author`,
      "name": "Almakius Felix Bariq Hekopung",
      "alternateName": "Felix Palingan",
      "url": authorPortfolioUrl,
      "jobTitle": "Full-Stack Software Engineer",
      "sameAs": [
        authorPortfolioUrl,
        "https://www.linkedin.com/in/almakius-felix-bariq-hekopung/",
        "https://id.linkedin.com/in/almakius-felix-bariq-hekopung-a59695394",
        "https://github.com/felixpalingan",
        "https://iron-pixels.vercel.app",
        siteUrl,
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      "url": siteUrl,
      "name": "Oit",
      "description": "High-Voltage Real-Time Communication Platform",
      "publisher": {
        "@id": `${authorPortfolioUrl}/#author`,
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Oit?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "Oit is a lightweight, high-performance real-time communication platform featuring instant messaging, low-latency WebRTC voice and video calls, and PIN-secured channels.",
          },
        },
        {
          "@type": "Question",
          "name": "Who created Oit?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "Oit was created and engineered by Almakius Felix Bariq Hekopung (Felix Palingan) as a high-voltage, low-latency alternative to traditional communication platforms.",
          },
        },
        {
          "@type": "Question",
          "name": "Is Oit free to use?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "Yes, Oit is completely free to use directly from your web browser with zero installation required.",
          },
        },
        {
          "@type": "Question",
          "name": "How does voice and video calling work in Oit?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "Oit uses LiveKit WebRTC cloud infrastructure to deliver sub-100ms ultra low-latency audio and HD video rooms with screen sharing and active speaker detection.",
          },
        },
        {
          "@type": "Question",
          "name": "How are messages and channels secured in Oit?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "Oit enforces strict Row-Level Security (RLS) policies at the PostgreSQL database level, cryptographically scoped session tokens, and PIN code verification for locked channels.",
          },
        },
      ],
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  title: {
    default: "Oit — Real-Time Messaging & Voice/Video Rooms",
    template: "%s | Oit",
  },
  description:
    "Fast, lightweight, and modern real-time communication platform with instant chat, encrypted channels, and low-latency voice and video rooms.",
  keywords: [
    "Oit",
    "Almakius Felix Bariq Hekopung",
    "Felix Palingan",
    "instant messaging",
    "realtime chat",
    "voice channels",
    "video call",
    "group chat",
    "discord alternative",
    "collaboration",
    "WebRTC",
    "LiveKit",
  ],
  authors: [{ name: "Almakius Felix Bariq Hekopung", url: authorPortfolioUrl }],
  creator: "Almakius Felix Bariq Hekopung",
  publisher: "Almakius Felix Bariq Hekopung",
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
    url: siteUrl,
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
    card: "summary_large_image",
    title: "Oit — Real-Time Messaging & Voice/Video Rooms",
    description:
      "Fast, lightweight, and modern real-time communication platform with instant chat, encrypted channels, and low-latency voice and video rooms.",
    images: ["/oit_logo.png"],
    creator: "@felixpalingan",
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
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "u4LJw861Sd1D-bEjorhvvNzYhsOaDRd8unleA61RqHg",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
