'use client';

import React, { useState } from 'react';
import {
  Zap,
  ShieldCheck,
  Video,
  MessageSquare,
  Users,
  Radio,
  Lock,
  Server,
  ChevronDown,
  Check,
  ExternalLink,
  Sparkles,
  Cpu,
  Layers,
  Globe,
  Activity,
  ArrowRight,
  HelpCircle,
  Award,
  Smartphone,
} from 'lucide-react';

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

interface PublicLandingViewProps {
  children: React.ReactNode;
}

export default function PublicLandingView({ children }: PublicLandingViewProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const scrollToAuth = () => {
    const authElement = document.getElementById('auth-section');
    if (authElement) {
      authElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const faqs = [
    {
      question: 'What is Oit?',
      answer:
        'Oit is a lightweight, high-performance real-time communication platform engineered for modern teams and tech communities. It combines instant messaging, low-latency WebRTC voice and video rooms powered by LiveKit SFU, and encrypted PIN-locked private channels directly in your web browser with zero bloat.',
    },
    {
      question: 'Who created and engineered Oit?',
      answer:
        'Oit was created, architected, and engineered by Almakius Felix Bariq Hekopung (also known as Felix Palingan), a Full-Stack Software Engineer specializing in real-time distributed systems and modern web technologies. You can explore his work on his official Portfolio Hub (portfolio-felix-bariq.vercel.app).',
      authorLink: 'https://portfolio-felix-bariq.vercel.app',
    },
    {
      question: 'Is Oit free to use?',
      answer:
        'Yes! Oit is 100% free and open-source under the MIT license. You can sign up, create community servers, invite members, and host HD video/audio calls with zero subscription paywalls or hidden fees.',
    },
    {
      question: 'How does voice and video calling work in Oit?',
      answer:
        'Oit utilizes LiveKit Cloud Selective Forwarding Unit (SFU) WebRTC infrastructure. This delivers sub-100ms ultra low-latency audio, adaptive bitrate HD video streams, screen sharing, and active speaker DSP metering with persistent background calls.',
    },
    {
      question: 'How are messages and channels secured in Oit?',
      answer:
        'Security is enforced at multiple layers: PostgreSQL Row-Level Security (RLS) policies restrict all queries based on authenticated JWT session claims, LiveKit tokens are cryptographically generated and scoped server-side, and sensitive rooms feature custom numeric PIN code verification.',
    },
    {
      question: 'Can Oit be installed on mobile devices or desktop?',
      answer:
        'Yes. Oit is a fully responsive Progressive Web App (PWA). You can install it directly from Chrome, Safari, Edge, or Brave onto iOS, Android, macOS, or Windows with offline caching and native app behavior without downloading heavy 200MB+ desktop binaries.',
    },
  ];

  const comparisonRows = [
    {
      feature: 'Client Footprint',
      oit: 'Instant Web / Lightweight PWA (0 MB Install)',
      discord: 'Heavy Electron Client (~250 MB+)',
      slack: 'Heavy Desktop App (~300 MB+)',
    },
    {
      feature: 'Voice & Video Latency',
      oit: 'Sub-100ms WebRTC (LiveKit Cloud SFU)',
      discord: 'Variable SFU Media Latency',
      slack: 'Traditional Huddle / WebRTC Stream',
    },
    {
      feature: 'Privacy & Data Protection',
      oit: 'Database RLS & Room PIN Locks',
      discord: 'Centralized Telemetry & Tracking',
      slack: 'Enterprise Surveillance Logs',
    },
    {
      feature: 'Paywalled Features',
      oit: 'None (100% Free & Open Source)',
      discord: 'Paywalled Nitro (HD Streams, Emojis)',
      slack: 'Paywalled 90-Day Message History',
    },
    {
      feature: 'Resource Consumption',
      oit: 'Minimal RAM & CPU Background Impact',
      discord: 'High RAM Background Usage',
      slack: 'High Memory Footprint per Workspace',
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#050505] text-zinc-100 selection:bg-[#FF5C00] selection:text-white flex flex-col font-sans">
      {/* 1. TOP STICKY NAVIGATION BAR */}
      <header className="sticky top-0 z-50 w-full bg-[#0a0a0c]/85 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Brand Title */}
          <a href="#" className="flex items-center gap-3 group">
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
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-300">
            <a href="#features" className="hover:text-[#FF5C00] transition-colors">
              Capabilities
            </a>
            <a href="#architecture" className="hover:text-[#FF5C00] transition-colors">
              Architecture
            </a>
            <a href="#comparison" className="hover:text-[#FF5C00] transition-colors">
              Comparison
            </a>
            <a href="#faq" className="hover:text-[#FF5C00] transition-colors">
              FAQ
            </a>
            <a href="/about" className="text-[#FF5C00] hover:text-white transition-colors">
              About
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/felixpalingan/Oit"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#141418] hover:bg-[#1f1f26] border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white transition-all shadow-sm"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>

            <button
              type="button"
              onClick={scrollToAuth}
              className="px-4 py-2 bg-[#FF5C00] hover:bg-[#ff701a] text-white text-xs font-black rounded-xl shadow-lg shadow-[#FF5C00]/25 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>ENTER APP</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN SEMANTIC CONTENT */}
      <main className="flex-1 w-full">
        {/* 2. HERO SECTION */}
        <section className="relative w-full pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-8 overflow-hidden">
          {/* Neon Ambient Background Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#FF5C00]/10 rounded-full blur-[140px] pointer-events-none -z-10" />
          <div className="absolute top-1/2 right-10 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: High-Impact Copy & Value Pillars */}
            <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
              {/* Product Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#16161a] border border-[#FF5C00]/30 rounded-full text-xs font-bold text-[#FF5C00] shadow-sm shadow-[#FF5C00]/10">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Real-Time Communication Platform</span>
              </div>

              {/* Main Headline (H1) */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                Ultra Low-Latency Voice, Video &amp;{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5C00] via-amber-400 to-[#FF7A00]">
                  Real-Time Messaging
                </span>
              </h1>

              {/* Comprehensive Descriptive Copy */}
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl font-normal">
                Connect with developer teams, gaming guilds, and community spaces with zero bloat.
                Experience sub-100ms instant messaging powered by PostgreSQL changefeeds,
                crystal-clear WebRTC voice and video rooms powered by LiveKit SFU, and encrypted
                PIN-locked private channels with granular role moderation.
              </p>

              {/* Quick KPI Stat Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl pt-2">
                <div className="p-3.5 bg-[#121216] border border-zinc-800/80 rounded-2xl">
                  <div className="text-lg sm:text-xl font-black text-[#FF5C00]">&lt; 100ms</div>
                  <div className="text-[11px] text-zinc-400 font-medium">Chat &amp; Signaling Latency</div>
                </div>
                <div className="p-3.5 bg-[#121216] border border-zinc-800/80 rounded-2xl">
                  <div className="text-lg sm:text-xl font-black text-white">LiveKit SFU</div>
                  <div className="text-[11px] text-zinc-400 font-medium">Adaptive WebRTC Media</div>
                </div>
                <div className="p-3.5 bg-[#121216] border border-zinc-800/80 rounded-2xl">
                  <div className="text-lg sm:text-xl font-black text-emerald-400">Postgres RLS</div>
                  <div className="text-[11px] text-zinc-400 font-medium">Database-Level Security</div>
                </div>
                <div className="p-3.5 bg-[#121216] border border-zinc-800/80 rounded-2xl">
                  <div className="text-lg sm:text-xl font-black text-amber-400">0 MB Install</div>
                  <div className="text-[11px] text-zinc-400 font-medium">Instant Browser PWA</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={scrollToAuth}
                  className="px-6 py-3.5 bg-[#FF5C00] hover:bg-[#ff701a] text-white text-xs sm:text-sm font-extrabold rounded-2xl shadow-xl shadow-[#FF5C00]/30 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <span>Start Chatting Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#architecture"
                  className="px-5 py-3.5 bg-[#15151a] hover:bg-[#1c1c22] border border-zinc-800 text-zinc-300 hover:text-white text-xs sm:text-sm font-bold rounded-2xl transition-all"
                >
                  Explore Architecture
                </a>
              </div>
            </div>

            {/* Right Column: Embedded Interactive Auth Card */}
            <div className="lg:col-span-5 flex justify-center w-full" id="auth-section">
              <div className="w-full max-w-md relative">
                {/* Neon Background Accent on Auth Card */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#FF5C00]/40 to-amber-500/20 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 -z-10" />
                {children}
              </div>
            </div>
          </div>
        </section>

        {/* 3. VISUAL SHOWCASE BANNER */}
        <section className="w-full py-12 px-4 sm:px-8 border-y border-zinc-900 bg-[#09090b]">
          <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF5C00] mb-2">
              Intuitive High-Voltage Interface
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Designed for Flow, Speed &amp; Community Connection
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mb-8">
              A distraction-free dark workspace featuring server sidebars, persistent floating background calls,
              real-time message status, and instant member management without lag.
            </p>

            <div className="relative w-full rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl shadow-black/80 group">
              <img
                src="/og-image.png"
                alt="Oit Real-Time Messaging & Community Workspace Dashboard"
                className="w-full h-auto object-cover group-hover:scale-[1.01] transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </section>

        {/* 4. FOUR CORE CAPABILITIES GRID */}
        <section id="features" className="w-full py-16 sm:py-24 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#141418] border border-zinc-800 rounded-full text-xs font-bold text-[#FF5C00] mb-3">
                <Layers className="w-3.5 h-3.5" />
                <span>Engineered for Performance</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-4">
                Core Architectural Pillars of Oit
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Every component is built for instantaneous response times, secure authentication boundaries,
                and seamless media synchronization.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1: Real-Time Chat */}
              <div className="p-6 bg-[#111114] border border-zinc-800 hover:border-[#FF5C00]/50 rounded-3xl transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 rounded-2xl bg-[#FF5C00]/10 border border-[#FF5C00]/30 flex items-center justify-center text-[#FF5C00] mb-5 group-hover:bg-[#FF5C00] group-hover:text-white transition-colors">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Sub-Millisecond Chat</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Optimistic local state dispatch provides instant feedback while Supabase PostgreSQL WAL replication
                  synchronizes messages across active clients without polling.
                </p>
              </div>

              {/* Feature 2: WebRTC Voice & Video */}
              <div className="p-6 bg-[#111114] border border-zinc-800 hover:border-[#FF5C00]/50 rounded-3xl transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">LiveKit SFU Video Rooms</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Enterprise-grade WebRTC Selective Forwarding Unit (SFU) delivers HD group video calling, crystal-clear audio,
                  screen sharing, and active speaker DSP detection.
                </p>
              </div>

              {/* Feature 3: Security & Encryption */}
              <div className="p-6 bg-[#111114] border border-zinc-800 hover:border-[#FF5C00]/50 rounded-3xl transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">PIN-Locked Channels &amp; RLS</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Strict Row-Level Security at the PostgreSQL layer ensures isolated data access, complemented by
                  custom numeric PIN access verification on private channels.
                </p>
              </div>

              {/* Feature 4: Role Hierarchy */}
              <div className="p-6 bg-[#111114] border border-zinc-800 hover:border-[#FF5C00]/50 rounded-3xl transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-5 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <Server className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">4-Tier Server Hierarchy</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Full control over your community spaces with Owner, Admin, Moderator, and Member permissions,
                  instant invite links, and real-time membership synchronization.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. FULL-STACK SYSTEM ARCHITECTURE */}
        <section id="architecture" className="w-full py-16 sm:py-24 px-4 sm:px-8 bg-[#08080a] border-t border-zinc-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF5C00]">
                Engineering Blueprint
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-2 mb-4">
                Full-Stack Real-Time Architecture
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Oit combines cutting-edge cloud protocols with reactive frontend state management to deliver an unrivaled
                communication experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Architecture Tier 1 */}
              <div className="p-7 bg-[#121216] border border-zinc-800/80 rounded-3xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-[#FF5C00] uppercase tracking-wider">Tier 1: Client</span>
                    <Cpu className="w-4 h-4 text-zinc-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Reactive Browser PWA</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    Built on Next.js 16 App Router, React 19, and Zustand. Handles optimistic UI updates, active call state,
                    and cached offline asset delivery.
                  </p>
                </div>
                <div className="pt-4 border-t border-zinc-800/60 text-[11px] text-zinc-500 font-mono">
                  Next.js 16 • React 19 • Zustand • Tailwind v4
                </div>
              </div>

              {/* Architecture Tier 2 */}
              <div className="p-7 bg-[#121216] border border-zinc-800/80 rounded-3xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-[#FF5C00] uppercase tracking-wider">Tier 2: Backend</span>
                    <Activity className="w-4 h-4 text-zinc-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Supabase Database &amp; Realtime</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    PostgreSQL storage with Row-Level Security (RLS) policies. Change Data Capture (CDC) streams real-time database
                    events directly to connected clients over WebSockets.
                  </p>
                </div>
                <div className="pt-4 border-t border-zinc-800/60 text-[11px] text-zinc-500 font-mono">
                  PostgreSQL • Row-Level Security • CDC WAL • Supabase Auth
                </div>
              </div>

              {/* Architecture Tier 3 */}
              <div className="p-7 bg-[#121216] border border-zinc-800/80 rounded-3xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-[#FF5C00] uppercase tracking-wider">Tier 3: Media</span>
                    <Radio className="w-4 h-4 text-zinc-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">LiveKit Cloud SFU Engine</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    Global edge infrastructure for WebRTC media routing. Selective Forwarding Unit (SFU) delivers sub-100ms audio/video,
                    adaptive bitrates, and screen sharing.
                  </p>
                </div>
                <div className="pt-4 border-t border-zinc-800/60 text-[11px] text-zinc-500 font-mono">
                  LiveKit SFU • WebRTC • Adaptive Bitrate • Audio DSP
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. COMPARISON MATRIX: OIT VS TRADITIONAL APPS */}
        <section id="comparison" className="w-full py-16 sm:py-24 px-4 sm:px-8 border-t border-zinc-900">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF5C00]">
                Honest Benchmark
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-2 mb-4">
                Why Choose Oit Over Traditional Bloat?
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Modern collaboration shouldn&apos;t require 300MB downloads, excessive background RAM consumption, or paywalled streaming perks.
              </p>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-[#101013] shadow-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-[#16161c]">
                    <th className="py-4 px-5 text-zinc-400 font-bold uppercase tracking-wider text-[11px]">Feature / Attribute</th>
                    <th className="py-4 px-5 text-[#FF5C00] font-black uppercase tracking-wider text-[11px] bg-[#FF5C00]/5">
                      ⚡ Oit
                    </th>
                    <th className="py-4 px-5 text-zinc-400 font-bold uppercase tracking-wider text-[11px]">Discord</th>
                    <th className="py-4 px-5 text-zinc-400 font-bold uppercase tracking-wider text-[11px]">Slack</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {comparisonRows.map((row, index) => (
                    <tr key={index} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="py-4 px-5 font-bold text-white">{row.feature}</td>
                      <td className="py-4 px-5 font-semibold text-[#FF5C00] bg-[#FF5C00]/5">{row.oit}</td>
                      <td className="py-4 px-5 text-zinc-400">{row.discord}</td>
                      <td className="py-4 px-5 text-zinc-400">{row.slack}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 7. INTERACTIVE FAQ ACCORDION */}
        <section id="faq" className="w-full py-16 sm:py-24 px-4 sm:px-8 bg-[#09090c] border-t border-zinc-900">
          <div className="max-w-4xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#141418] border border-zinc-800 rounded-full text-xs font-bold text-[#FF5C00] mb-3">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Got Questions?</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Everything you need to know about Oit, system security, and developer attribution.
              </p>
            </div>

            <div className="space-y-3.5">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="border border-zinc-800/80 rounded-2xl bg-[#121215] overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      className="w-full py-4 px-5 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-white hover:text-[#FF5C00] transition-colors cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${
                          isOpen ? 'rotate-180 text-[#FF5C00]' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/40 pt-3">
                        <p>{faq.answer}</p>
                        {faq.authorLink && (
                          <div className="mt-2.5">
                            <a
                              href={faq.authorLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#FF5C00] hover:underline font-semibold"
                            >
                              <span>Visit Creator Portfolio Hub</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 8. BOTTOM CALL TO ACTION BANNER */}
        <section className="w-full py-16 px-4 sm:px-8 border-t border-zinc-800 bg-gradient-to-b from-[#0e0e12] to-[#050505]">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
            <img
              src="/oit_logo.png"
              alt="Oit Logo"
              className="w-14 h-14 rounded-2xl object-cover shadow-xl shadow-[#FF5C00]/20 border border-zinc-800 mb-4"
            />
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
              Ready to Experience High-Voltage Communication?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mb-6">
              Create your account in seconds, launch your server, and start talking with crystal-clear audio and instant chat.
            </p>
            <button
              type="button"
              onClick={scrollToAuth}
              className="px-7 py-3.5 bg-[#FF5C00] hover:bg-[#ff701a] text-white text-xs sm:text-sm font-black rounded-2xl shadow-xl shadow-[#FF5C00]/30 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>LAUNCH OIT NOW</span>
            </button>
          </div>
        </section>
      </main>

      {/* 9. SEMANTIC FOOTER */}
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
            <a href="/about" className="hover:text-[#FF5C00] transition-colors font-medium">
              About Oit
            </a>
            <a
              href="https://portfolio-felix-bariq.vercel.app"
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
              className="hover:text-[#FF5C00] transition-colors font-medium flex items-center gap-1"
            >
              <span>LinkedIn</span>
            </a>
            <a
              href="https://iron-pixels.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FF5C00] transition-colors font-medium"
            >
              Iron Pixels
            </a>
          </div>

          <p className="text-[11px] text-zinc-500">
            Engineered by{' '}
            <a
              href="https://portfolio-felix-bariq.vercel.app"
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
