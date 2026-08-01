# ⚡ Oit — High-Voltage Instant Messaging & Live WebRTC Group Calls

[![Production Live App](https://img.shields.io/badge/Production-Live%20App-ff5c00?style=for-the-badge&logo=vercel&logoColor=white)](https://oit-seven.vercel.app)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.2.12-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Realtime-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![LiveKit WebRTC](https://img.shields.io/badge/LiveKit-Cloud%20WebRTC-FF4F00?style=for-the-badge&logo=livekit&logoColor=white)](https://livekit.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**Oit** adalah platform komunikasi *real-time full-stack* kelas enterprise yang menggabungkan obrolan pesan instan, komunikasi suara/video WebRTC latensi ultra-rendah, serta sistem server dan channel bergaya komunitatif. Dirancang dengan estetika **Oit Signature High-Voltage Dark** (`#000000` base, `#161619` surfaces, dan `#FF5C00` Vibrant Orange accent) serta sistem navigasi *responsive mobile-first*.

🌐 **Live Demo**: [https://oit-seven.vercel.app](https://oit-seven.vercel.app)

---

## 🌟 Fitur Utama (A - Z Feature Spectrum)

### 📱 1. Responsive Mobile-First UX & Slide-Out Drawer
- **Single DOM Unified Drawer**: Navigasi mobile menggunakan *off-canvas drawer* 60fps CSS transform (`translate-x-0` vs `-translate-x-full`) yang halus tanpa duplikasi komponen DOM.
- **Header Hamburger Menu (`☰`)**: Akses sekali sentuh ke daftar server dan channel dari layar HP.
- **Ergonomi Sentuh Mobile**: Form, tombol, dan area pesan yang disesuaikan untuk layar HP berbagai ukuran.

### 📸 2. PFP Profile Picture & Server Icon Uploads
- **Custom PFP Sejak Registrasi**: Pengguna dapat mengunggah foto profil (*Avatar*) sejak pertama kali mendaftar akun di **Register Screen**.
- **Server Icon Customization**: Pemilik server dapat mengunggah logo/ikon server kustom saat membuat atau mengedit server.
- **Supabase Storage Integration**: Terhubung ke bucket `chat-attachments` dengan *Base64 fallback* otomatis.

### 🎙️ 3. WebRTC Suara & Video Latensi Ultra-Rendah (LiveKit Cloud SFU)
- **Multi-Participant Rooms**: Panggilan grup tanpa batas waktu dengan transmisi audio/video HD.
- **Pendeteksi Pembicara Aktif (*Active Speaker Glow*)**: Indikator visual menyala terang pada ubin peserta yang sedang berbicara.
- **Floating Live Pod (`● Live`)**: Mengecilkan tampilan panggilan tanpa memutus koneksi WebRTC, memungkinkan pengguna tetap mengobrol pesan teks.
- **Hardware Device Selection & Persist**: Pemilihan kamera dan mikrofon spesifik yang tersimpan di `localStorage` melalui Zustand.

### ⚡ 4. Pelacakan Presensi Suara & User Real-Time (Supabase CDC & Presence)
- **Status Online / Offline Real-Time**: Indikator 🟢 **Online** dan ⚪ **Offline** app-wide secara presisi menggunakan Supabase Presence.
- **Presensi Anggota Sebelum Bergabung**: Pengguna dapat melihat daftar anggota yang berada di dalam Voice Channel secara *real-time* dari sidebar **SEBELUM & SESUDAH** mengklik untuk bergabung.
- **Status Read Centang Ganda (`✔` -> `✔✔`)**: Pesan obrolan memperbarui status pembacaan secara *real-time* saat penerima membuka obrolan.

### 👥 5. Direktori Anggota & Kartu Profil Pengguna (User Popover)
- **Kartu Profil Pengguna (`UserProfileCardModal`)**: Mengklik foto profil siapa saja di obrolan, header DM, atau daftar anggota server memunculkan popover berisi foto profil, lencana verifikasi, dan deskripsi **About Me (Bio)**.
- **Modal Daftar Anggota Server (`Server Members`)**: Menampilkan seluruh anggota terdaftar lengkap dengan foto profil, tag username, status online, dan lencana mahkota emas (`👑 Owner`).
- **Pengaturan Detail Server (`Edit Server Settings`)**: Modal untuk mengubah nama server, mengunggah ikon baru, mengubah status Private/Public, atau menghapus server.

### 🖼️ 6. Pratinjau Gambar Layar On-Screen Lightbox & Download
- **On-Screen Pop-Up Lightbox (`ImageLightboxModal`)**: Mengklik gambar di dalam obrolan membuka tampilan penuh di tengah layar dengan latar belakang *dark backdrop blur* tanpa berpindah ke tab browser baru.
- **Direct Download Button**: Mengunduh berkas gambar langsung ke perangkat pengguna menggunakan mekanisme Blob URL.

### 🚪 7. Keamanan Private Channel & Sistem Door Knocking
- **Keamanan Saluran Private (`🔒`)**: Channel private terlindungi oleh kata sandi.
- **System Knock-Knock**: Calon pengunjung dapat melakukan "ketuk pintu" yang memicu notifikasi siaran *real-time* ke anggota ruangan untuk persetujuan masuk.

### 🔊 8. Meteran Suara Mikrofon Asli & Hardware Cleanups (Web Audio API)
- **Real-Time Input Metering**: Di modal **User Settings**, indikator volume mikrofon mengukur dan menampilkan level spektrum audio asli dari mikrofon fisik pengguna (`AudioContext` & `AnalyserNode`).
- **Strict Cleanup Protocol**: Mematikan seluruh *track MediaStream* dan menghentikan `AudioContext` saat modal ditutup, menjamin lampu mikrofon/kamera di laptop/HP pengguna mati seketika.

---

## 🏛️ Arsitektur Sistem & Spesifikasi Rekayasa Perangkat Lunak (System Engineering Architecture)

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
| - Auth Sessi JWT & Public Users      |   | - Postgres WAL Replication    |   | - Selective Forwarding Unit (SFU)   |
| - Relasi Servers, Channels, Members  |   | - App-wide User Presence Tracking|   | - Adaptive Stream Bitrate Encoding  |
| - Storage Engine (chat-attachments)  |   | - Door Knock & Call Signaling    |   | - Active Speaker Audio Analyzer     |
+--------------------------------------+   +-----------------------------------+   +-----------------------------------+
```

### 1. Client Runtime & Hydration Engine (Next.js 16 + React 19 + Zustand)

- **Single-Page Application (SPA) Root Orchestrator (`src/app/page.tsx`)**:
  - Mengelola sesi JWT Supabase Auth (`getSession()` & `onAuthStateChange()`).
  - Mengatur *hydration* profil pengguna (`public.users`), daftar kontak, dan status server.
  - Berfungsi sebagai **Root-Level Modal Renderer** (`fixed inset-0 z-50/z-[60]`) untuk membebaskan modal dari pembatasan kontainer anak (*CSS Stacking Context Trap*).

- **Global State & Persist Middleware (`src/store/useAppStore.ts`)**:
  - **Transient State**: `isMobileDrawerOpen`, `activeCallRoomId`, `knockNotification`.
  - **Persisted State**: `activeServerId`, `activeChannelId`, `activeChannelName`, `selectedAudioDeviceId`, `selectedVideoDeviceId`.
  - Menggunakan `localStorage` (`oit-app-storage`) sehingga preferensi server, channel, dan perangkat keras mikrofon/kamera tetap tersimpan saat pengguna melakukan reload browser (F5).

- **Mobile Off-Canvas Drawer (60fps GPU Transform)**:
  - Menggunakan **Single DOM Container** dengan transisi CSS Transform (`translate-x-0` vs `-translate-x-full`).
  - Mencegah insialisasi ulang WebSocket Supabase JS SDK ganda yang sering menjadi penyebab utama crash *hydration error* di perangkat seluler.

---

### 2. Engine Real-Time & Change Data Capture / CDC (Supabase Realtime)

Aplikasi memanfaatkan saluran WebSocket biderional Supabase Realtime dengan 4 fungsionalitas utama:

1. **Global Online Presence (`global_online_presence`)**:
   - Client mendaftarkan `user_id` ke saluran presensi.
   - Event `presence.on('sync')` mengumpulkan seluruh ID aktif ke dalam struktur data **`Set<string>` (`onlineUserIds`)**.
   - Indikator 🟢 **Online** / ⚪ **Offline** di seluruh UI ter-update otomatis secara *zero polling*.

2. **Server Voice Presence (`server_voice_presence:${activeServerId}`)**:
   - Memacak daftar anggota di dalam Voice Channel secara *live* **sebelum pengguna bergabung**.

3. **Realtime Call & Door Knock Signaling (`global:call_signaling` & `room_requests`)**:
   - Panggilan langsung memancarkan event `incoming_call` ke target user untuk memicu dering panggilan (`IncomingCallModal`).
   - Sistem pintu saluran private memancarkan event `knock` untuk meminta izin masuk ke pemilik ruangan.

4. **Messages Replication (`public:messages`)**:
   - Mengamati transaksi `INSERT` dan `UPDATE` pada tabel `messages`.
   - Mengubah status centang pesan (`✔` -> `✔✔`) secara otomatis ketika penerima membaca obrolan.

---

### 3. Media Pipeline WebRTC & SFU Architecture (LiveKit Cloud)

- **Selective Forwarding Unit (SFU) vs Mesh P2P**:
  - Berbeda dari P2P Mesh ($N \times (N-1)$ stream) yang memboroskan bandwidth, Oit menggunakan SFU LiveKit Cloud. Client hanya mengunggah **1 upstream media stream**, lalu server SFU mendistribusikan stream yang telah di-encode (*adaptive bitrate*) ke peserta lain.

- **Protokol Token JWT (`/api/livekit`)**:
  - Client meminta token via `GET /api/livekit?room=call_1&username=alex`.
  - Server Next.js memverifikasi `LIVEKIT_API_KEY` & `LIVEKIT_API_SECRET`, memproduksi token JWT berizin *Room Join*, lalu menyerahkannya ke client untuk *ICE/DTLS Handshake*.

- **Web Audio API Metering & Cleanup Protocol**:
  - Membuka stream audio `getUserMedia({ audio: { deviceId: { exact: selectedMic } } })`.
  - Menghubungkan ke `AudioContext` & `AnalyserNode` (`fftSize = 256`) untuk menghitung persentase volume RMS (0% - 100%).
  - **Cleanup Protocol**: Saat modal ditutup, `stopAllMediaStreams()` mematikan seluruh `MediaStreamTrack` (`track.stop()`) dan menutup `AudioContext` agar lampu fisik mikrofon/kamera di laptop/HP pengguna mati total.

- **Floating Live Pod (Background WebRTC Continuity)**:
  - Saat tampilan panggilan diperkecil (*Minimize*), sesi WebRTC LiveKit tetap **100% aktif** di latar belakang melalui `<RoomAudioRenderer />` dan pod melayang `● Live`.

---

### 4. Lapisan Database & Storage Layer (PostgreSQL + RLS + Supabase Storage)

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
CREATE TABLE IF NOT EXISTS public.server_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(server_id, user_id)
);

-- 4. Tabel Saluran Obrolan & Suara (public.channels)
CREATE TABLE IF NOT EXISTS public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text',
  is_private BOOLEAN DEFAULT false,
  password TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabel Pesan Obrolan (public.messages)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT,
  sender_id UUID NOT NULL,
  receiver_id UUID,
  channel_id UUID,
  attachment_url TEXT,
  file_name TEXT,
  file_size TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

> **Catatan Pembersihan Database**: Untuk mereset ulang seluruh data ke 0, gunakan skrip [supabase/wipe_clean_database.sql](file:///c:/Users/Felix/Documents/proyek/Oit/supabase/wipe_clean_database.sql). Skrip penambahan kolom bio tersedia di [supabase/add_bio_column.sql](file:///c:/Users/Felix/Documents/proyek/Oit/supabase/add_bio_column.sql).

---

## 📊 Diagram Alur Transaksi Data (Data Flow Lifecycle)

```
[ Pengguna Mengetik Pesan / Mengirim Gambar ]
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│ Client-side Optimistic State / Base64 Fallback Check      │
└─────────────────────┬────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│ Supabase Client: INSERT into public.messages             │
└─────────────────────┬────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│ PostgreSQL WAL (Write-Ahead Log) Transaction Committed    │
└─────────────────────┬────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│ Supabase Realtime CDC: WebSocket Broadcast to Channel     │
└─────────────────────┬────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│ Target Client Receives Message -> Re-sorts DM List ->    │
│ Updates Read Receipt (is_read = true)                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Teknologi (Tech Architecture Summary)

| Layer | Teknologi & Library | Deskripsi |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 16.2.12** (App Router & Turbopack) | Server-Side Rendering (SSR), API Routes, dan kompilasi instan. |
| **UI Library & Styling** | **React 19**, **TailwindCSS**, **Lucide React** | Antarmuka komponen modular dengan estetika *Glassmorphic Dark*. |
| **State Management** | **Zustand** + `persist` middleware | Manajemen status global ringan yang tersimpan di `localStorage`. |
| **Database & Auth** | **Supabase Postgres Database & Auth** | Otentikasi sesi JWT, aturan keamanan RLS (*Row Level Security*). |
| **Realtime Engine** | **Supabase CDC & Presence Channels** | Pelacakan presensi pengguna, siaran ketuk pintu, dan centang baca pesan. |
| **Storage** | **Supabase Storage Engine** | Penyimpanan berkas media obrolan, avatar PFP, dan ikon server. |
| **WebRTC Infrastructure**| **LiveKit Cloud SFU Engine** | Server Media SFU WebRTC untuk panggilan suara, video, & *screen sharing*. |
| **Visitor Analytics** | **Vercel Analytics (`@vercel/analytics`)** | Pelacakan statistik tayangan halaman & pengunjung situs *real-time*. |

---

## ⚡ Panduan Instalasi Lokal (Local Setup Guide)

### 1. Prasyarat System
- **Node.js**: `v20.x` atau lebih baru
- **Package Manager**: `npm` atau `yarn`

### 2. Kloning & Instalasi Dependensi
```bash
git clone https://github.com/felixpalingan/Oit.git
cd Oit
npm install
```

### 3. Konfigurasi Environment Variables (`.env.local`)
Buat berkas `.env.local` di direktori akar proyek:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

LIVEKIT_URL=wss://your-livekit-domain.livekit.cloud
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
```

### 4. Jalankan Server Dev Local
```bash
npm run dev
```
Buka `http://localhost:3000` di peramban Anda.

---

## 👨‍💻 Lisensi & Hak Cipta
Dirancang dan dikembangkan oleh **Felix Palingan** sebagai proyek portofolio kelas *Full-Stack Real-Time Communication Platform*.
Lisensi di bawah **MIT License**.
