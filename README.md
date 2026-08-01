# ⚡ Oit — High-Performance Real-Time Communication & Community Platform

[![Production Live App](https://img.shields.io/badge/Production-Live%20App-ff5c00?style=for-the-badge&logo=vercel&logoColor=white)](https://oit-seven.vercel.app)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.2.12-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Realtime-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![LiveKit WebRTC](https://img.shields.io/badge/LiveKit-Cloud%20WebRTC-FF4F00?style=for-the-badge&logo=livekit&logoColor=white)](https://livekit.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**Oit** is a full-stack, enterprise-grade real-time communication platform engineered for high-concurrency instant messaging, low-latency audio/video WebRTC group calling, granular role-based access control (RBAC), and robust system-wide fault tolerance.

Designed with **Oit Signature High-Voltage Dark Aesthetic** (`#000000` base, `#161619` surfaces, and `#FF5C00` Vibrant Orange accent), the application features a single-DOM mobile-first layout engine capable of rendering dynamic community workspaces, rich media streams, and real-time audio visualizers with zero performance degradation.

🌐 **Production Application**: [https://oit-seven.vercel.app](https://oit-seven.vercel.app)

---

## 🚀 Key Engineering Highlights

### ⚡ 1. Sub-100ms Real-Time Data Pipeline
- **Change Data Capture (CDC)**: Built on Supabase Realtime Engine (PostgreSQL WAL replication) over persistent WebSockets for zero-polling state updates.
- **Global Presence Tracking**: Tracks user online/offline status, room voice membership, and read receipts (`✔` to `✔✔`) in real time using non-blocking in-memory `Set<string>` lookups.
- **Instant Peer Signaling**: Low-latency event dispatching for incoming calls, dual-toneWeb Audio synthesizer chimes, and door-knocking room access requests.

### 🛡️ 2. Enterprise Role-Based Access Control (RBAC) & Audit Logs
- **Hierarchical Governance**: Strict role weight hierarchy (`Owner > Admin > Moderator > Member`) governing administrative permissions across channels and servers.
- **Real-Time Moderation Actions**: Time-bound user mutes (`muted_until`) with client-side input locks, room ejection (Kick), and permanent server bans (`server_bans`).
- **Instant Eviction & Sidebar Sync**: Utilizes PostgreSQL `REPLICA IDENTITY FULL` to propagate `DELETE` and `INSERT` events, immediately revoking access and removing server navigation icons without browser reloads.
- **Real-Time Audit Trail**: Every administrative action (Mute, Kick, Ban, Role Mutation) is recorded in an immutable `audit_logs` table and streamed live to the audit dashboard.

### 🎙️ 3. Low-Latency SFU WebRTC Infrastructure
- **Selective Forwarding Unit (SFU)**: Powered by LiveKit Cloud, replacing traditional mesh P2P topology ($N \times (N-1)$ streams) with a single upstream encode stream distributed via adaptive bitrate algorithms.
- **Active Speaker Recognition**: DSP-driven audio level measurement with visual glow indicators on active speakers.
- **Background Media Continuity**: Floating live pod (`● Live`) maintains active WebRTC tracks in the background while users navigate text channels.
- **Web Audio API Hardware Cleanups**: Real-time microphone spectrum analyzer (`AnalyserNode`) with strict media track cleanup (`track.stop()`) to release camera/mic hardware instantly upon modal dismissal.

### 🧱 4. Resilient Client-Side Validation & Graceful Fault Handling
- **Client-Side File Limiter (25MB)**: Strict pre-upload validation preventing large payload network congestion, coupled with floating toast notifications (`FILE TOO LARGE`).
- **Interrupted Connection Recovery**: Detects network disconnects during file uploads, transitioning the progress UI into a high-visibility error state (`📡 GAGAL MENGUNGGAH`) with an instant retry action.
- **Smart 404 Route Interception**: Intercepts attempts to access deleted servers or invalid routes, gracefully redirecting users to the primary workspace with context-aware floating alerts (`Akses Ditolak`).

---

## 🏛️ System Architecture

```
                                  +---------------------------------------+
                                  |    Client Browser / Mobile PWA        |
                                  | (Next.js 16 + React 19 + Zustand)     |
                                  +-------------------+-------------------+
                                                      |
                   +----------------------------------+----------------------------------+
                   |                                  |                                  |
                   v                                  v                                  v
+------------------+-------------------+   +----------+--------------------+   +-------------+---------------------+
|      Supabase Auth & Database        |   |    Supabase Realtime Engine   |   |   LiveKit Cloud SFU Engine          |
|      (PostgreSQL + RLS Policies)     |   |    (WebSocket / CDC / Presence)  |   |   (WebRTC Low-Latency SFU)      |
+------------------+-------------------+   +----------+--------------------+   +-------------+---------------------+
| - Auth Session JWT & Public Users    |   | - Postgres WAL Replication (CDC)  |   | - Selective Forwarding Unit (SFU)   |
| - Relational Schema & Constraints    |   | - App-Wide Presence Tracking      |   | - Adaptive Bitrate Media Streams    |
| - Row-Level Security (RLS) Policies  |   | - Realtime Moderation State Sync  |   | - Active Speaker Audio Analyzer     |
| - Supabase Storage (chat-attachments)|   | - Signaling & Notification Push   |   | - Web Audio API DSP Metering        |
+--------------------------------------+   +-----------------------------------+   +-----------------------------------+
```

---

## 💻 Tech Stack & Architectural Decisions

| Layer | Technology | Engineering Rationale |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16.2.12** (Turbopack) | App Router SSR, optimized route handlers, and sub-second cold starts. |
| **UI Library** | **React 19**, **TailwindCSS**, **Lucide** | Modular, glassmorphic dark theme components with GPU-accelerated CSS transforms. |
| **State Engine**| **Zustand** + `persist` | Lightweight global store for active servers/channels, hardware IDs, and call states. |
| **Database/Auth**| **Supabase PostgreSQL** | Relational schema integrity, JWT session handling, and strict RLS policies. |
| **Realtime** | **Supabase CDC & Presence** | Real-time WAL replication over WebSockets for zero-polling UX. |
| **Media Engine** | **LiveKit Cloud SFU** | Scalable multi-party audio/video WebRTC streaming with low CPU overhead. |
| **Analytics** | **Vercel Analytics** | Production traffic monitoring and web performance metrics. |

---

## 🗄️ Database Schema (DDL)

```sql
-- 1. User Profiles Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT DEFAULT 'Navigating the digital ether.',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Servers Table
CREATE TABLE IF NOT EXISTS public.servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon_url TEXT,
  is_private BOOLEAN DEFAULT false,
  owner_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Server Members Table (with RBAC & Mute state)
ALTER TABLE public.server_members REPLICA IDENTITY FULL;
CREATE TABLE IF NOT EXISTS public.server_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'moderator', 'member'
  muted_until TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(server_id, user_id)
);

-- 4. Server Bans Table
CREATE TABLE IF NOT EXISTS public.server_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  banned_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason TEXT DEFAULT 'Pelanggaran aturan server',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(server_id, user_id)
);

-- 5. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'KICK_MEMBER', 'BAN_MEMBER', 'MUTE_MEMBER', 'UPDATE_ROLE'
  target_id UUID,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Messages Table (with Quote Reply & Soft Delete)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT,
  sender_id UUID NOT NULL,
  receiver_id UUID,
  channel_id UUID,
  reply_to_id UUID REFERENCES public.messages(id),
  attachment_url TEXT,
  file_name TEXT,
  file_size TEXT,
  is_read BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Realtime CDC Publication
DO $$ 
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.server_members; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.server_bans; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.messages; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
```

---

## ⚡ Local Development Setup

### 1. Prerequisites
- **Node.js**: `v20.x` or higher
- **Package Manager**: `npm` or `yarn`

### 2. Clone Repository & Install Dependencies
```bash
git clone https://github.com/felixpalingan/Oit.git
cd Oit
npm install
```

### 3. Environment Variables (`.env.local`)
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

LIVEKIT_URL=wss://your-livekit-domain.livekit.cloud
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
```

### 4. Run Local Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` in your browser.

---

## 👤 Author & Credits

Designed and engineered by **Felix** as a flagship full-stack real-time system portfolio project.

Released under the **MIT License**.
