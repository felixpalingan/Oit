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

### 🎙️ 3. WebRTC Suara & Video Latensi Ultra-Rendah (LiveKit Cloud)
- **Multi-Participant Rooms**: Panggilan grup tanpa batas waktu dengan transmisi audio/video HD.
- **Pendeteksi Pembicara Aktif (*Active Speaker Glow*)**: Indikator visual menyala terang pada ubin peserta yang sedang berbicara.
- **Floating Live Pod (`● Live`)**: Mengecilkan tampilan panggilan tanpa memutus koneksi WebRTC, memungkinkan pengguna tetap mengobrol pesan teks.
- **Non-Disruptive Disconnect**: Meninggalkan panggilan hanya memutuskan sesi pengguna lokal tanpa mematikan ruang panggilan untuk anggota lain.

### ⚡ 4. Pelacakan Presensi Suara Real-Time (Supabase CDC & Presence)
- **Presensi Anggota Sebelum Bergabung**: Pengguna dapat melihat daftar anggota yang berada di dalam Voice Channel secara *real-time* dari sidebar **SEBELUM & SESUDAH** mengklik untuk bergabung.
- **Status Read Centang Ganda (`✔` -> `✔✔`)**: Pesan obrolan memperbarui status pembacaan secara *real-time* saat penerima membuka obrolan.

### 👥 5. Direktori Anggota & Manajemen Server Lengkap
- **Modal Daftar Anggota Server (`Server Members`)**: Menampilkan seluruh anggota terdaftar lengkap dengan foto profil, tag username, dan lencana mahkota emas (`👑 Owner`).
- **Pengaturan Detail Server (`Edit Server Settings`)**: Modal untuk mengubah nama server, mengunggah ikon baru, mengubah status Private/Public, atau menghapus server.
- **Salin Kode Undangan (`Share2`)**: Menyalin ID Server sekali klik untuk membagikan akses ke kawan.

### 🚪 6. Keamanan Private Channel & Sistem Door Knocking
- **Keamanan Saluran Private (`🔒`)**: Channel private terlindungi oleh kata sandi.
- **System Knock-Knock**: Calon pengunjung dapat melakukan "ketuk pintu" yang memicu notifikasi siaran *real-time* ke anggota ruangan untuk persetujuan masuk.

### 🔊 7. Meteran Suara Mikrofon Asli (Web Audio API)
- **Real-Time Input Metering**: Di modal **User Settings**, indikator volume mikrofon mengukur dan menampilkan level spektrum audio asli dari mikrofon fisik pengguna (`AudioContext` & `AnalyserNode`).

### 💬 8. Urutan Obrolan DM Terbaru & Persistensi Halaman
- **Sorting DM Berdasarkan Pesan Terakhir**: Daftar obrolan pribadi otomatis melompat ke atas setiap kali ada pesan baru yang terkirim/diterima.
- **Zustand Persist Middleware**: Menyimpan status server & channel aktif di `localStorage`, sehingga tampilan tidak pernah reset saat menekan F5 / Reload browser.

---

## 🛠️ Stack Teknologi (Tech Architecture)

| Layer | Teknologi & Library | Deskripsi |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 16.2.12** (App Router & Turbopack) | Server-Side Rendering (SSR), API Routes, dan kompilasi instan. |
| **UI Library & Styling** | **React 19**, **TailwindCSS**, **Lucide React** | Antarmuka komponen modular dengan estetika *Glassmorphic Dark*. |
| **State Management** | **Zustand** + `persist` middleware | Manajemen status global ringan yang tersimpan di `localStorage`. |
| **Database & Auth** | **Supabase Postgres Database & Auth** | Otentikasi sesi JWT, aturan keamanan RLS (*Row Level Security*). |
| **Realtime Engine** | **Supabase CDC & Presence Channels** | Pelacakan presensi pengguna, siaran ketuk pintu, dan centang baca pesan. |
| **Storage** | **Supabase Storage Engine** | Penyimpanan berkas media obrolan, avatar PFP, dan ikon server. |
| **WebRTC Infrastructure**| **LiveKit Cloud Engine** | Server Media SFU WebRTC untuk panggilan suara, video, & *screen sharing*. |
| **Visitor Analytics** | **Vercel Analytics (`@vercel/analytics`)** | Pelacakan statistik tayangan halaman & pengunjung situs *real-time*. |

---

## 📐 Arsitektur Sistem (System Architecture)

```
[ Client Browser / Mobile HP ]
              │
              ├───► Next.js 16 App Router (UI Rendering & Zustand State)
              │
              ├───► Supabase Auth & Postgres Database (User Profiles, Servers, Channels, Messages)
              │
              ├───► Supabase Realtime CDC Engine (Presence Sync, Message Read Receipts, Knock Signaling)
              │
              ├───► LiveKit Cloud WebRTC SFU Server (Low-Latency Audio/Video Peer Connections)
              │
              └───► Supabase Storage Engine (User Avatars & Server Icon Images)
```

---

## 🗄️ Skema Database SQL (Database Schemas)

Aplikasi Oit berjalan di atas struktur tabel Supabase Postgres yang efisien:

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

> **Catatan Pembersihan Database**: Untuk mereset ulang seluruh data ke 0, gunakan skrip [supabase/wipe_clean_database.sql](file:///c:/Users/Felix/Documents/proyek/Oit/supabase/wipe_clean_database.sql).

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
