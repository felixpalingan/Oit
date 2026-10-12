import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Zap,
  ShieldCheck,
  Video,
  MessageSquare,
  Cpu,
  Layers,
  Lock,
  Server,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Heart,
  Terminal,
  Code2,
  Globe,
  Rocket,
  ArrowLeft,
  Users,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Oit — Vision, Architecture & Creator',
  description:
    'Learn about the mission, engineering philosophy, and the creator behind Oit — an ultra-lightweight, high-voltage real-time communication platform.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Oit — Vision, Architecture & Creator',
    description:
      'Learn about the mission, engineering philosophy, and the creator behind Oit — an ultra-lightweight, high-voltage real-time communication platform.',
    url: 'https://oit-seven.vercel.app/about',
    siteName: 'Oit',
    images: [
      {
        url: '/og-image.png',
        width: 1864,
        height: 928,
        alt: 'About Oit Platform & Creator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Oit — Vision, Architecture & Creator',
    description:
      'Learn about the mission, engineering philosophy, and the creator behind Oit — an ultra-lightweight, high-voltage real-time communication platform.',
    images: ['/og-image.png'],
    creator: '@felixpalingan',
  },
};

function GithubIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export default function AboutPage() {
  const authorPortfolioUrl = 'https://portfolio-felix-bariq.vercel.app';
  const siteUrl = 'https://oit-seven.vercel.app';

  const aboutJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': `${siteUrl}/about/#webpage`,
        url: `${siteUrl}/about`,
        name: 'About Oit — Vision, Architecture & Creator',
        description:
          'Learn about the mission, engineering philosophy, and the creator behind Oit — an ultra-lightweight real-time communication platform.',
        mainEntity: {
          '@id': `${authorPortfolioUrl}/#author`,
        },
      },
      {
        '@type': 'Person',
        '@id': `${authorPortfolioUrl}/#author`,
        name: 'Almakius Felix Bariq Hekopung',
        alternateName: 'Felix Palingan',
        url: authorPortfolioUrl,
        jobTitle: 'Full-Stack Software Engineer',
        sameAs: [
          authorPortfolioUrl,
          'https://www.linkedin.com/in/almakius-felix-bariq-hekopung/',
          'https://id.linkedin.com/in/almakius-felix-bariq-hekopung-a59695394',
          'https://github.com/felixpalingan',
          'https://iron-pixels.vercel.app',
          siteUrl,
        ],
      },
    ],
  };

  const coreValues = [
    {
      title: 'Zero Bloat, Zero Install',
      description:
        'Communication tools shouldn’t require 300MB+ desktop Electron binaries or heavy system drivers. Oit is engineered as a pure progressive web app (PWA) with immediate sub-second load times.',
      icon: Rocket,
    },
    {
      title: 'Radical Privacy by Design',
      description:
        'No telemetry tracking, no targeted advertisements, and no centralized eavesdropping. Database queries are isolated at the PostgreSQL kernel level using Row-Level Security (RLS) policies.',
      icon: Lock,
    },
    {
      title: 'Optimistic Real-Time Velocity',
      description:
        'Every text interaction updates locally in 0ms with automated rollback safety, backed by persistent PostgreSQL WAL change data capture and sub-100ms LiveKit WebRTC media streams.',
      icon: Zap,
    },
    {
      title: 'Open Source Community Ethos',
      description:
        '100% free under the MIT License. No paywalled HD screen sharing, no subscription fees for basic features, and no corporate lock-in.',
      icon: Heart,
    },
  ];

  const milestones = [
    {
      label: 'Core Protocol',
      title: 'Supabase Real-Time CDC & Optimistic UI',
      desc: 'Architected relational data models with PostgreSQL RLS and client-side Zustand store for instantaneous message feeds.',
    },
    {
      label: 'Media Streaming',
      title: 'LiveKit Cloud WebRTC SFU Integration',
      desc: 'Engineered sub-100ms audio and HD video rooms with floating background calls, screen sharing, and active speaker DSP.',
    },
    {
      label: 'Security Layer',
      title: 'Granular PIN Lock & Role Moderation',
      desc: 'Implemented custom numeric PIN verification for private rooms alongside 4-tier Owner/Admin/Moderator server hierarchies.',
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#050505] text-zinc-100 selection:bg-[#FF5C00] selection:text-white flex flex-col font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />

      {/* TOP HEADER */}
      <header className="sticky top-0 z-50 w-full bg-[#0a0a0c]/85 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src="/oit_logo.png"
                alt="Oit Logo"
                className="w-9 h-9 rounded-xl object-cover shadow-md shadow-[#FF5C00]/20 border border-zinc-800 group-hover:border-[#FF5C00] transition-colors"
              />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF5C00] rounded-full animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-[#FF5C00] group-hover:text-white transition-colors">
                Oit
              </span>
              <span className="text-[10px] text-zinc-400 font-medium tracking-wider -mt-1 hidden sm:inline">
                HIGH-VOLTAGE REAL-TIME
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-300">
            <Link href="/" className="hover:text-[#FF5C00] transition-colors">
              Home
            </Link>
            <Link href="/#features" className="hover:text-[#FF5C00] transition-colors">
              Capabilities
            </Link>
            <Link href="/#architecture" className="hover:text-[#FF5C00] transition-colors">
              Architecture
            </Link>
            <Link href="/#faq" className="hover:text-[#FF5C00] transition-colors">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/felixpalingan/Oit"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#141418] hover:bg-[#1f1f26] border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white transition-all"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>

            <Link
              href="/"
              className="px-4 py-2 bg-[#FF5C00] hover:bg-[#ff701a] text-white text-xs font-black rounded-xl shadow-lg shadow-[#FF5C00]/25 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>LAUNCH APP</span>
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN ARTICLE */}
      <main className="flex-1 w-full">
        {/* HERO SECTION */}
        <section className="relative w-full pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-8 overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#FF5C00]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

          <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#16161a] border border-[#FF5C00]/30 rounded-full text-xs font-bold text-[#FF5C00] shadow-sm mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mission, Vision &amp; Engineering Philosophy</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
              Built for Speed, Privacy &amp;{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5C00] via-amber-400 to-[#FF7A00]">
                Uncompromising Flow
              </span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl font-normal mb-8">
              Why we engineered a lightweight, open-source communication platform to liberate developer
              teams and digital communities from bloated, memory-hungry, and privacy-invasive desktop apps.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/"
                className="px-6 py-3 bg-[#FF5C00] hover:bg-[#ff701a] text-white text-xs sm:text-sm font-extrabold rounded-2xl shadow-xl shadow-[#FF5C00]/25 transition-all flex items-center gap-2"
              >
                <span>Try Oit Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href={authorPortfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-[#15151a] hover:bg-[#1c1c22] border border-zinc-800 text-zinc-300 hover:text-white text-xs sm:text-sm font-bold rounded-2xl transition-all flex items-center gap-2"
              >
                <span>Creator Portfolio</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* ORIGIN STORY SECTION */}
        <section className="w-full py-16 px-4 sm:px-8 border-y border-zinc-900 bg-[#09090c]">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center sm:text-left">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF5C00]">
                The Genesis
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
                The Problem with Modern Chat Tools
              </h2>
            </div>

            <div className="space-y-5 text-xs sm:text-sm text-zinc-300 leading-relaxed">
              <p>
                In the early days of modern web collaboration, applications like Discord and Slack arrived as
                refreshing, nimble alternatives to outdated legacy voice tools. However, over the past decade,
                these platforms have grown increasingly bloated. Today, simply running a desktop voice client
                can consume hundreds of megabytes of system RAM, trigger constant background telemetry updates,
                and lock essential capabilities like HD screen sharing behind aggressive subscription paywalls.
              </p>
              <p>
                As software engineers and active open-source contributors, we asked a fundamental question:
                <strong className="text-white">
                  {' '}
                  Why should talking with teammates or friends require a 250MB installer and heavy resource
                  overhead when modern web protocols already support sub-millisecond data channels and WebRTC?
                </strong>
              </p>
              <p>
                <strong>Oit</strong> was born from that frustration. Designed from day one around the concept of
                high-voltage efficiency, Oit removes every unnecessary layer of bloat. It leverages the raw
                power of modern web standards—LiveKit SFU cloud media routing, PostgreSQL change data capture (CDC),
                and Next.js App Router—to deliver instant, native-feeling communication right in the browser.
              </p>
            </div>
          </div>
        </section>

        {/* CORE VALUES */}
        <section className="w-full py-20 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF5C00]">
                Foundational Principles
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-2 mb-3">
                Our Engineering Core Values
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Every line of code and architectural decision in Oit is guided by four uncompromising standards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coreValues.map((val, idx) => {
                const IconComponent = val.icon;
                return (
                  <div
                    key={idx}
                    className="p-7 bg-[#111114] border border-zinc-800/80 hover:border-[#FF5C00]/50 rounded-3xl transition-all hover:-translate-y-1 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#FF5C00]/10 border border-[#FF5C00]/30 flex items-center justify-center text-[#FF5C00] mb-5 group-hover:bg-[#FF5C00] group-hover:text-white transition-colors">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-2">{val.title}</h3>
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{val.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* MEET THE CREATOR & E-E-A-T SECTION */}
        <section className="w-full py-20 px-4 sm:px-8 bg-[#09090c] border-t border-zinc-900">
          <div className="max-w-4xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF5C00]">
                Architect &amp; Lead Engineer
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-2 mb-3">
                Meet the Creator
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Dedicated engineering focused on high-performance web systems and developer ergonomics.
              </p>
            </div>

            <div className="p-8 sm:p-10 bg-[#121216] border border-zinc-800 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-[#FF5C00]/10 rounded-full blur-[100px] pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 text-center sm:text-left">
                <img
                  src="/oit_logo.png"
                  alt="Almakius Felix Bariq Hekopung"
                  className="w-24 h-24 rounded-3xl object-cover border-2 border-[#FF5C00] shadow-xl shadow-[#FF5C00]/20 shrink-0"
                />

                <div className="space-y-3 flex-1">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      Almakius Felix Bariq Hekopung
                    </h3>
                    <p className="text-xs font-semibold text-[#FF5C00]">
                      Full-Stack Software Engineer &bull; Alias: Felix Palingan
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    Almakius Felix Bariq Hekopung specializes in building real-time distributed web systems,
                    WebRTC media pipelines, and scalable database architectures. Oit represents his vision
                    of blending state-of-the-art backend synchronization with an iconic high-voltage design
                    aesthetic.
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
                    <a
                      href={authorPortfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#FF5C00] hover:bg-[#ff701a] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#FF5C00]/20 flex items-center gap-1.5"
                    >
                      <span>Official Portfolio Hub</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <a
                      href="https://github.com/felixpalingan"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#1b1b22] hover:bg-[#25252e] border border-zinc-700/80 text-zinc-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <GithubIcon className="w-3.5 h-3.5" />
                      <span>GitHub</span>
                    </a>

                    <a
                      href="https://www.linkedin.com/in/almakius-felix-bariq-hekopung/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#1b1b22] hover:bg-[#25252e] border border-zinc-700/80 text-zinc-200 text-xs font-semibold rounded-xl transition-all"
                    >
                      <span>LinkedIn</span>
                    </a>

                    <a
                      href="https://iron-pixels.vercel.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#1b1b22] hover:bg-[#25252e] border border-zinc-700/80 text-zinc-200 text-xs font-semibold rounded-xl transition-all"
                    >
                      <span>Iron Pixels</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="w-full py-16 px-4 sm:px-8 border-t border-zinc-900 bg-gradient-to-b from-[#0c0c10] to-[#050505]">
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
              Join the High-Voltage Movement
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mb-6">
              Create your account in seconds, launch your community server, and experience real-time communication without limits.
            </p>
            <Link
              href="/"
              className="px-7 py-3.5 bg-[#FF5C00] hover:bg-[#ff701a] text-white text-xs sm:text-sm font-black rounded-2xl shadow-xl shadow-[#FF5C00]/30 transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>START CHATTING NOW</span>
            </Link>
          </div>
        </section>
      </main>

      {/* SEMANTIC FOOTER */}
      <footer className="w-full bg-[#050505] border-t border-zinc-900 py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/oit_logo.png" alt="Oit" className="w-7 h-7 rounded-lg object-cover" />
            <div className="text-left">
              <span className="text-xs font-black text-white">Oit Platform</span>
              <p className="text-[10px] text-zinc-500">Fast, Lightweight &amp; Open-Source Communication</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-zinc-400">
            <Link href="/" className="hover:text-[#FF5C00] transition-colors font-medium">
              Home
            </Link>
            <Link href="/about" className="text-[#FF5C00] font-bold">
              About
            </Link>
            <a
              href={authorPortfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FF5C00] transition-colors font-medium flex items-center gap-1"
            >
              <span>Portfolio Hub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://github.com/felixpalingan/Oit"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FF5C00] transition-colors font-medium flex items-center gap-1"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
            <a
              href="https://www.linkedin.com/in/almakius-felix-bariq-hekopung/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FF5C00] transition-colors font-medium"
            >
              LinkedIn
            </a>
          </div>

          <p className="text-[11px] text-zinc-500">
            Engineered by{' '}
            <a
              href={authorPortfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-300 font-semibold hover:text-[#FF5C00] transition-colors"
            >
              Almakius Felix Bariq Hekopung
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
