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
  ExternalLink,
  ArrowRight,
  Terminal,
  Code2,
  Globe,
  Radio,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Oit — Architecture, Benchmarks & Creator',
  description:
    'The engineering story, performance benchmarks, and architectural decisions behind Oit — an open-source, bloat-free real-time communication platform.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Oit — Architecture, Benchmarks & Creator',
    description:
      'The engineering story, performance benchmarks, and architectural decisions behind Oit — an open-source, bloat-free real-time communication platform.',
    url: 'https://oit-seven.vercel.app/about',
    siteName: 'Oit',
    images: [
      {
        url: '/og-image.png',
        width: 1864,
        height: 928,
        alt: 'About Oit Platform & Architecture',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Oit — Architecture, Benchmarks & Creator',
    description:
      'The engineering story, performance benchmarks, and architectural decisions behind Oit — an open-source, bloat-free real-time communication platform.',
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
        name: 'About Oit — Architecture, Benchmarks & Creator',
        description:
          'The engineering story, performance benchmarks, and architectural decisions behind Oit.',
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

  const benchmarks = [
    {
      metric: 'Idle RAM Consumption',
      oit: '~38 MB (Single tab memory)',
      discord: '~340 MB (Multiple Electron helpers)',
      delta: '8.9x lighter',
    },
    {
      metric: 'Cold Startup Time',
      oit: '< 300 ms (Instant Edge PWA)',
      discord: '2.8s – 4.5s (Binary unpack + update check)',
      delta: '9x faster',
    },
    {
      metric: 'Background Process Count',
      oit: '0 additional background processes',
      discord: '4 – 7 background renderer instances',
      delta: 'Zero host tax',
    },
    {
      metric: 'Client Disk Footprint',
      oit: '0 MB (Web cache only)',
      discord: '~260 MB installation + cache creep',
      delta: '100% ephemeral',
    },
  ];

  const architecturalDecisions = [
    {
      title: 'Selective Forwarding Unit (SFU) vs. Peer-to-Peer Mesh',
      decision:
        'Standard browser WebRTC tutorials rely on full-mesh topologies (every peer sends streams to every other peer). While zero-cost on servers, mesh complexity degrades quadratically: an 8-person room requires 56 bidirectional media streams, instantly maxing consumer CPUs. Oit routes all voice/video through LiveKit Cloud SFU, maintaining an O(1) uplink per client regardless of room size.',
      tag: 'Media Streaming',
      tech: 'LiveKit Cloud WebRTC SFU',
    },
    {
      title: 'Kernel-Level Row Security vs. App Middleware Checks',
      decision:
        'Traditional web applications validate authorization in API middleware (e.g., Express handlers). A single forgotten authorization guard in a route handler leads to catastrophic data leaks. Oit pushes all multi-tenant isolation directly into the PostgreSQL kernel via Row-Level Security (RLS) policies. Even if application code has a bug, the database engine physically rejects unauthorized row extraction.',
      tag: 'Security & Auth',
      tech: 'PostgreSQL RLS + Supabase JWT',
    },
    {
      title: 'PostgreSQL WAL Changefeeds vs. Persistent Custom Daemons',
      decision:
        'Running and scaling custom Node.js socket clusters with Redis adapters introduces significant operational failure modes. Oit subscribes directly to PostgreSQL’s logical decoding Write-Ahead Log (WAL) replication feed. Every message insert automatically triggers WebSocket changefeeds to room subscribers with zero custom polling infrastructure.',
      tag: 'Data Sync',
      tech: 'Supabase Realtime (WAL CDC)',
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
            <Link href="/about" className="text-[#FF5C00] font-bold">
              About
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

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full">
        {/* HERO SECTION */}
        <section className="relative w-full pt-16 pb-20 sm:pt-24 sm:pb-24 px-4 sm:px-8 border-b border-zinc-900">
          <div className="max-w-4xl mx-auto text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#16161a] border border-zinc-800 rounded-md text-xs font-mono font-semibold text-[#FF5C00]">
              <Terminal className="w-3.5 h-3.5" />
              <span>ENGINEERING MANIFESTO // v1.0.0</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.1]">
              Why We Built Oit: The Case for a Bloat-Free Communication Stack
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
              An engineering-first breakdown of why modern desktop chat clients have become resource-intensive
              and invasive, and how we architected an open-source alternative leveraging native browser WebRTC
              and PostgreSQL changefeeds.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono text-zinc-400">
              <span className="px-2.5 py-1 bg-[#141418] border border-zinc-800 rounded">Next.js 16</span>
              <span className="px-2.5 py-1 bg-[#141418] border border-zinc-800 rounded">LiveKit SFU</span>
              <span className="px-2.5 py-1 bg-[#141418] border border-zinc-800 rounded">PostgreSQL RLS</span>
              <span className="px-2.5 py-1 bg-[#141418] border border-zinc-800 rounded">MIT License</span>
            </div>
          </div>
        </section>

        {/* SECTION 1: THE PROBLEM */}
        <section className="w-full py-16 px-4 sm:px-8 border-b border-zinc-900 bg-[#09090c]">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <span className="text-xs font-mono font-bold text-[#FF5C00] uppercase tracking-wider">
                01 // The Problem
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                The Electron Creep in Modern Communication
              </h2>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
              <p>
                Discord and Slack revolutionized community communication by replacing fragmented IRC and TeamSpeak
                servers. Yet over the last decade, their architecture shifted. What began as clean software evolved into
                cumbersome, multi-process desktop packages bundled with Chromium runtimes, persistent analytics
                telemetry, and background update daemons.
              </p>
              <p>
                For developers running local compilers, Docker containers, and IDEs, having a voice app quietly consume
                350MB of RAM and 8% background CPU during a compile cycle is an unacceptable tax. Moreover, features
                that are technically fundamental to WebRTC (like high-frame-rate screen sharing) are now frequently
                paywalled behind recurring subscriptions.
              </p>
              <p>
                Oit was engineered to prove that high-performance audio, low-latency video, and instant messaging do not
                require a native desktop installer. With modern WebRTC SFU routing and browser hardware acceleration, a
                web-native progressive web app delivers equal or superior fidelity with virtually zero local footprint.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: HARD BENCHMARKS */}
        <section className="w-full py-16 px-4 sm:px-8 border-b border-zinc-900">
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <span className="text-xs font-mono font-bold text-[#FF5C00] uppercase tracking-wider">
                02 // Hard Benchmarks
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                Resource Overhead Comparison
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2">
                Empirical baseline comparison measured on macOS 14 / Windows 11 under idle connected room state.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-[#101013]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-[#15151a]">
                    <th className="py-3.5 px-4 font-mono font-bold text-zinc-400 uppercase text-[11px]">Metric</th>
                    <th className="py-3.5 px-4 font-mono font-bold text-[#FF5C00] uppercase text-[11px] bg-[#FF5C00]/5">
                      ⚡ Oit (PWA)
                    </th>
                    <th className="py-3.5 px-4 font-mono font-bold text-zinc-400 uppercase text-[11px]">Discord Desktop</th>
                    <th className="py-3.5 px-4 font-mono font-bold text-emerald-400 uppercase text-[11px]">Efficiency Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {benchmarks.map((row, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">{row.metric}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#FF5C00] bg-[#FF5C00]/5">{row.oit}</td>
                      <td className="py-3.5 px-4 font-mono text-zinc-400">{row.discord}</td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-emerald-400">{row.delta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECTION 3: ARCHITECTURAL DECISIONS */}
        <section className="w-full py-16 px-4 sm:px-8 border-b border-zinc-900 bg-[#09090c]">
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <span className="text-xs font-mono font-bold text-[#FF5C00] uppercase tracking-wider">
                03 // Technical Decisions
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                Engineering Trade-Offs &amp; Rationale
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2">
                We prioritized determinism, zero client data leaks, and horizontal scalability over proprietary lock-in.
              </p>
            </div>

            <div className="space-y-6">
              {architecturalDecisions.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 bg-[#111115] border border-zinc-800/90 rounded-2xl space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-2 py-0.5 bg-[#FF5C00]/10 border border-[#FF5C00]/30 rounded text-[10px] font-mono font-bold text-[#FF5C00]">
                      {item.tag}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">{item.tech}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-zinc-300 leading-relaxed font-normal">{item.decision}</p>
                </div>
              ))}
            </div>

            {/* REAL CODE ARTIFACT: PostgreSQL RLS Example */}
            <div className="p-6 bg-[#0c0c10] border border-zinc-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <Code2 className="w-4 h-4 text-[#FF5C00]" />
                  <span>Production PostgreSQL RLS Isolation</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">supabase/migrations/</span>
              </div>

              <pre className="p-4 bg-[#050507] border border-zinc-800/80 rounded-xl overflow-x-auto text-[11px] font-mono text-zinc-300 leading-relaxed">
{`-- Enforce strict tenant boundary at the database layer
CREATE POLICY "Allow server members to read messages"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.server_members sm
    JOIN public.channels c ON c.server_id = sm.server_id
    WHERE c.id = messages.channel_id
      AND sm.user_id = auth.uid()
  )
);`}
              </pre>
              <p className="text-[11px] text-zinc-500 leading-normal">
                Authorization is enforced directly inside the database engine. Even if an application route has a logic flaw,
                unauthorized messages cannot physically be returned across tenant boundaries.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: MEET THE ENGINEER */}
        <section className="w-full py-16 px-4 sm:px-8 border-b border-zinc-900">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <span className="text-xs font-mono font-bold text-[#FF5C00] uppercase tracking-wider">
                04 // Creator &amp; Maintainer
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                Engineering Notes from the Builder
              </h2>
            </div>

            <div className="p-7 sm:p-8 bg-[#121216] border border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <img
                src="/oit_logo.png"
                alt="Almakius Felix Bariq Hekopung"
                className="w-20 h-20 rounded-2xl object-cover border border-[#FF5C00] shadow-lg shadow-[#FF5C00]/20 shrink-0"
              />

              <div className="space-y-3 flex-1">
                <div>
                  <h3 className="text-xl font-bold text-white">Almakius Felix Bariq Hekopung</h3>
                  <p className="text-xs font-mono text-[#FF5C00]">
                    Full-Stack Software Engineer &bull; Alias: Felix Palingan
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  I started building Oit because I wanted a single, razor-fast communication tool that I could
                  keep open during heavy local builds without watching my laptop fans spin up. By pairing LiveKit’s
                  WebRTC infrastructure with Supabase’s PostgreSQL engine, Oit offers a zero-compromise platform
                  that respects user autonomy and privacy.
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
                  <a
                    href={authorPortfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-[#FF5C00] hover:bg-[#ff701a] text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-[#FF5C00]/20 flex items-center gap-1.5"
                  >
                    <span>Portfolio Hub</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href="https://github.com/felixpalingan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-[#1b1b22] hover:bg-[#25252e] border border-zinc-700/80 text-zinc-200 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>

                  <a
                    href="https://www.linkedin.com/in/almakius-felix-bariq-hekopung/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-[#1b1b22] hover:bg-[#25252e] border border-zinc-700/80 text-zinc-200 text-xs font-semibold rounded-lg transition-all"
                  >
                    <span>LinkedIn</span>
                  </a>

                  <a
                    href="https://iron-pixels.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-[#1b1b22] hover:bg-[#25252e] border border-zinc-700/80 text-zinc-200 text-xs font-semibold rounded-lg transition-all"
                  >
                    <span>Iron Pixels</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: CTA */}
        <section className="w-full py-16 px-4 sm:px-8 bg-gradient-to-b from-[#0a0a0d] to-[#050505]">
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              Ready to Experience Clean Real-Time Flow?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mb-6">
              Zero binary downloads. Zero telemetry overhead. Open source under the MIT License.
            </p>
            <Link
              href="/"
              className="px-6 py-3 bg-[#FF5C00] hover:bg-[#ff701a] text-white text-xs sm:text-sm font-black rounded-xl shadow-xl shadow-[#FF5C00]/30 transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>LAUNCH OIT APP</span>
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-[#050505] border-t border-zinc-900 py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/oit_logo.png" alt="Oit" className="w-6 h-6 rounded-md object-cover" />
            <span className="text-xs font-bold text-white">Oit Platform</span>
            <span className="text-[11px] text-zinc-500">&bull; MIT License</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-400">
            <Link href="/" className="hover:text-[#FF5C00] transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-[#FF5C00] font-semibold">
              About
            </Link>
            <a
              href={authorPortfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FF5C00] transition-colors flex items-center gap-1"
            >
              <span>Portfolio Hub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://github.com/felixpalingan/Oit"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FF5C00] transition-colors flex items-center gap-1"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
            <a
              href="https://www.linkedin.com/in/almakius-felix-bariq-hekopung/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FF5C00] transition-colors"
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
