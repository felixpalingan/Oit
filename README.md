# ⚡ Oit — High-Voltage Instant Messaging, RBAC Moderation & Live WebRTC Group Calls

[![Production Live App](https://img.shields.io/badge/Production-Live%20App-ff5c00?style=for-the-badge&logo=vercel&logoColor=white)](https://oit-seven.vercel.app)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.2.12-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Realtime-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![LiveKit WebRTC](https://img.shields.io/badge/LiveKit-Cloud%20WebRTC-FF4F00?style=for-the-badge&logo=livekit&logoColor=white)](https://livekit.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**Oit** adalah platform komunikasi *real-time full-stack* kelas enterprise yang menggabungkan obrolan pesan instan, komunikasi suara/video WebRTC latensi ultra-rendah, sistem moderasi berbasis peran (RBAC), audit log komprehensif, serta penanganan error berkualifikasi industri. Dirancang dengan estetika **Oit Signature High-Voltage Dark** (`#000000` base, `#161619` surfaces, dan `#FF5C00` Vibrant Orange accent) serta arsitektur navigasi *single-DOM responsive mobile-first*.

🌐 **Live Demo Application**: [https://oit-seven.vercel.app](https://oit-seven.vercel.app)

---

## 🌟 Fitur Utama (A - Z Feature Spectrum)

### 💬 1. Obrolan Fundamental & Fitur Pesan Lanjutan
- **Edit & Hapus Pesan (Ticket 7)**: Fitur edit inline (`is_edited`) dan *soft delete* (`is_deleted`). Pemilik pesan serta Admin/Moderator dapat menghapus pesan anggota dengan posisi hirarki di bawahnya.
- **Quote Reply & Mentions (Ticket 8)**: Balas pesan dengan *quote preview* ber-FK `reply_to_id` self-referencing. Fitur mention `@username` yang interaktif, dapat diklik untuk membuka Kartu Profil Pengguna.
- **Mention Highlighting & White Glassmorphic Badge**: Pesan dari orang lain yang meng-tag pengguna disorot dengan batas oranye *high-voltage*, sedangkan tag dalam gelembung pesan sendiri menggunakan badge *white glassmorphism* (`bg-white/25 border-white/40`) untuk kontras optimal.
- **Web Push Notifications & Dual-Tone Ringtone**: Notifikasi push browser otomatis (`Notification` API) untuk pesan & panggilan masuk, serta synthesizer dering audio Web Audio API pada `IncomingCallModal`.
- **Indikator Unread ala Discord**: Lencana titik notifikasi oranye/merah menyala pada logo Oit saat ada pesan baru belum dibaca.

### 🛡️ 2. Sistem Moderasi Komunitas & Keamanan RBAC (Tickets 10, 11, 12)
- **Skema Peran & Hirarki Bobot**: Mendukung 4 tingkatan peran: 👑 **Owner** (4), 🛡️ **Admin** (3), ⚔️ **Moderator** (2), dan 👤 **Member** (1).
- **Mute Berdurasi & Lock Input**: Membungkam anggota selama 10 menit (`muted_until`). Pengguna yang dibungkam terkunci 100% dari pengetikan teks, tombol smiley, tombol lampiran, dan pengiriman pesan.
- **Kick & Ban Permanen**: Mengeluarkan atau melarang anggota secara permanen (`server_bans`). Pengguna yang di-ban ditolak secara mutlak saat mencoba bergabung kembali via ID Server/Kode Undangan.
- **Pembersihan Ikon Real-Time**: Ikon server di sidebar navigasi kiri (*LeftNavRail*) **langsung hilang seketika** tanpa perlu refresh browser saat pengguna di-kick atau di-ban.
- **Dasbor Audit Log Real-Time**: Mencatat setiap tindakan moderasi (KICK, BAN, MUTE, UPDATE_ROLE) ke tabel `audit_logs` dengan format waktu relatif (*time-ago*), ikon aksi melingkar, dan pembaruan *real-time* via CDC listener.

### 🧱 3. Stabilitas & Penanganan Edge Cases (Tickets 13, 14)
- **Validasi File Size & Format (25MB Limit)**: Membatasi berkas maksimal 25MB di sisi *client*. Jika melebihi batas, memicu **Overlaid Toast Notification** `FILE TOO LARGE`.
- **UI Upload Terinterupsi (Red Failed Upload State)**: Jika koneksi internet terputus saat mengunggah berkas, progress bar berubah menjadi **merah solid** dengan label `📡 GAGAL MENGUNGGAH` dan tombol ikon **Retry** (`RotateCcw`).
- **404 Route Interceptor & Deleted Entity Fallback**: Mencegat rute tak valid atau ruangan terhapus, mengalihkan pengguna secara mulus ke layar utama (DM Welcome Screen) tanpa *White Screen of Death*, disertai **Floating Toast Notification** `Akses Ditolak: Ruangan ini sudah tidak tersedia atau telah dihapus.`.

### 👥 4. Panel Anggota Kanan Ala Discord (`ServerMembersSidebar`)
- **Tampilan Anggota Kanan (Image 5)**: Memunculkan panel kanan `MEMBERS — [Count]` yang mengurutkan anggota berdasarkan hirarki role (Owner > Admin > Moderator > Member).
- **Lencana Role & Status Mute**: Menampilkan ikon mahkota 👑, perisai admin 🛡️, perisai mod ⚔️, indikator titik status online 🟢, serta label merah `(BUNGKAM)`.
- **Menu Aksi Moderasi Cepat**: Mengklik ikon titik tiga pada anggota memunculkan menu konteks cepat untuk Mute 10 Menit, Kick, Ban Permanen, atau Mengubah Peran.

### 🎙️ 5. WebRTC Suara & Video Latensi Ultra-Rendah (LiveKit Cloud SFU)
- **Multi-Participant Rooms**: Panggilan grup tanpa batas waktu dengan transmisi audio/video HD.
- **Pendeteksi Pembicara Aktif (*Active Speaker Glow*)**: Indikator visual menyala terang pada ubin peserta yang sedang berbicara.
- **Floating Live Pod (`● Live`)**: Mengecilkan tampilan panggilan tanpa memutus koneksi WebRTC, memungkinkan pengguna tetap mengobrol pesan teks.
- **Web Audio API Hardware Cleanups**: Pengukur spektrum audio mikrofon asli dan protokol pemutusan `MediaStreamTrack` (`track.stop()`) instan saat modal ditutup.

---

## 🏛️ Arsitektur Sistem & Spesifikasi Rekayasa Perangkat Lunak

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
| - Relasi Servers, Channels, Members  |   | - App-wide User Presence Tracking|   | - Adaptive Stream Bitrate Encoding  |
| - Audit Logs & Server Bans Tables    |   | - Realtime Kick/Ban & Mute CDC   |   | - Active Speaker Audio Analyzer     |
| - Storage Engine (chat-attachments)  |   | - Door Knock & Call Signaling    |   | - Web Audio API Synthesizer         |
+--------------------------------------+   +-----------------------------------+   +-----------------------------------+
```

### 1. Root Client Orchestrator & State Hydration (`src/app/page.tsx`)
- **Root State & Modal Container**: Berfungsi sebagai *root orchestrator* untuk otentikasi sesi JWT Supabase, presensi global, pembaruan keanggotaan *real-time*, serta penanganan *toast notification* melayang (`ToastNotification.tsx`).
- **Single DOM Mobile Off-Canvas Drawer**: Navigasi seluler menggunakan transisi CSS Transform 60fps (`translate-x-0` vs `-translate-x-full`) tanpa duplikasi komponen DOM, mencegah insialisasi ulang WebSocket SDK.

### 2. Change Data Capture / CDC Engine (Supabase Realtime)
- **`public:server_members` & `public:server_bans`**: Mendengarkan event `DELETE` dan `INSERT` dengan `REPLICA IDENTITY FULL` untuk mencabut akses pengguna dan menghapus ikon server secara *real-time* tanpa refresh peramban (F5).
- **`public:audit_logs`**: Menyiarkan transaksi log moderasi baru secara langsung ke Dasbor Audit Log di `EditServerModal.tsx`.
- **`global_online_presence`**: Mengumpulkan ID pengguna aktif ke dalam `Set<string>` (`onlineUserIds`) secara zero-polling.

---

## 🗄️ Skema Basis Data PostgreSQL & Migrasi SQL (`supabase/moderation_rbac_audit.sql`)

```sql
-- 1. Tabel Profil Pengguna (public.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT DEFAULT 'Navigating the digital ether.',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabel Server Komunitas (public.servers)
CREATE TABLE IF NOT EXISTS public.servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon_url TEXT,
  is_private BOOLEAN DEFAULT false,
  owner_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabel Keanggotaan Server (public.server_members)
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

-- 4. Tabel Ban Permanen Server (public.server_bans)
CREATE TABLE IF NOT EXISTS public.server_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  banned_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason TEXT DEFAULT 'Pelanggaran aturan server',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(server_id, user_id)
);

-- 5. Tabel Audit Log Server (public.audit_logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- e.g. 'KICK_MEMBER', 'BAN_MEMBER', 'MUTE_MEMBER', 'UPDATE_ROLE'
  target_id UUID,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Tabel Pesan Obrolan (public.messages)
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

-- 7. Publikasi Idempoten Supabase Realtime CDC
DO $$ 
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.server_members; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.server_bans; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.messages; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
```

---

## 📊 Diagram Alur Transaksi Data (Data Flow Lifecycle)

```
[ Aksi Moderasi / Pengiriman Pesan / File Upload ]
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│ Client-side Validation (25MB Limit / Mute Check / RBAC)  │
└─────────────────────┬────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│ Supabase Client: INSERT/UPDATE into PostgreSQL           │
└─────────────────────┬────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│ PostgreSQL WAL (Write-Ahead Log) Transaction Committed    │
│ + Audit Logs Row Recorded                                │
└─────────────────────┬────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│ Supabase Realtime CDC Broadcasts Event (DELETE/INSERT)   │
└─────────────────────┬────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│ Target Clients Receive Event -> Instant Icon Removal /   │
│ Toast Notification Triggered / Input Locked              │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Teknologi (Tech Architecture Summary)

| Layer | Teknologi & Library | Deskripsi |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 16.2.12** (App Router & Turbopack) | Server-Side Rendering (SSR), API Routes, dan kompilasi instan. |
| **UI Library & Styling** | **React 19**, **TailwindCSS**, **Lucide React** | Antarmuka komponen modular dengan estetika *High-Voltage Dark*. |
| **State Management** | **Zustand** + `persist` middleware | Manajemen status global ringan yang tersimpan di `localStorage`. |
| **Database & Auth** | **Supabase Postgres Database & Auth** | Otentikasi sesi JWT, aturan keamanan RLS (*Row Level Security*). |
| **Realtime Engine** | **Supabase CDC & Presence Channels** | Pelacakan presensi pengguna, siaran ketuk pintu, dan centang baca pesan. |
| **Storage Engine** | **Supabase Storage** | Penyimpanan berkas media obrolan, avatar PFP, dan ikon server. |
| **WebRTC Infrastructure**| **LiveKit Cloud SFU Engine** | Server Media SFU WebRTC untuk panggilan suara, video, & *screen sharing*. |
| **Visitor Analytics** | **Vercel Analytics (`@vercel/analytics`)** | Pelacakan statistik tayangan halaman & pengunjung situs *real-time*. |

---

## ⚡ Panduan Instalasi Lokal (Local Setup Guide)

### 1. Kloning & Instalasi Dependensi
```bash
git clone https://github.com/felixpalingan/Oit.git
cd Oit
npm install
```

### 2. Konfigurasi Environment Variables (`.env.local`)
Buat berkas `.env.local` di direktori akar proyek:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

LIVEKIT_URL=wss://your-livekit-domain.livekit.cloud
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
```

### 3. Jalankan Server Dev Local
```bash
npm run dev
```
Buka `http://localhost:3000` di peramban Anda.

---

## 👨‍💻 Lisensi & Hak Cipta
Dirancang dan dikembangkan oleh **Felix Palingan** sebagai platform komunikasi instan *real-time full-stack enterprise*.
Lisensi di bawah **MIT License**.
