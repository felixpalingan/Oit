# Oit — High-Voltage Real-Time Communication App

<p center>
  <strong>Oit</strong> adalah aplikasi obrolan serba cepat dan modern berbasis <strong>Next.js 16</strong>, <strong>Supabase</strong>, dan <strong>LiveKit Cloud</strong>. Mendukung obrolan pesan teks real-time, pengiriman lampiran file & drag-and-drop, status baca (centang oranye ✔✔), serta panggilan Suara (Voice) & Video WebRTC berlatensi rendah.
</p>

---

## ⚡ Fitur Utama

- 🔐 **Autentikasi & Manajemen Pengguna (Supabase Auth)**
  - Register & Login berbasis Username & Password.
  - Profil Pengguna kustom & avatar terintegrasi.

- 💬 **Pesan Teks Real-Time & Status Baca**
  - Pembaruan pesan otomatis tanpa refresh menggunakan **Supabase Realtime**.
  - **Pratinjau Pesan & Jumlah Belum Dibaca**: Menampilkan pesan terakhir & jumlah unread badge di sidebar kiri.
  - **Status Baca (Checkmarks)**: Centang tunggal/ganda putih untuk pesan terkirim, dan **Centang Ganda Oranye (`✔✔`)** secara real-time saat pesan dibaca oleh lawan bicara.

- 📁 **Pengunggah Lampiran File & Drag & Drop**
  - **Drag and Drop Overlay**: Seret file ke layar obrolan untuk mengunggah otomatis dengan tampilan *glassmorphic glowing overlay*.
  - **Supabase Storage**: Terintegrasi ke bucket `chat-attachments` lengkap dengan *Base64 fallback*.
  - **Preview & Lightbox**: Tampilan pratinjau gambar fullscreen dan kartu dokumen yang dapat diklik langsung untuk mengunduh file.

- 📞 **Panggilan Suara (Voice) & Video Call (LiveKit Cloud)**
  - **Sinyal Panggilan Masuk Real-Time**: Pop-up ringtone *Incoming Call Modal* di layar penerima dengan pilihan *Terima (Accept)* atau *Tolak (Decline)*.
  - **Dual Mode**: Dukungan panggilan khusus **Suara (Voice)** (kamera mati + animasi audio) atau **Video Call** (kamera aktif + PIP *YOU*).
  - **Synchronized Call Disconnect**: Mengakhiri panggilan secara serentak untuk kedua belah pihak saat tombol *END CALL* diklik atau panggilan ditolak.

---

## 🛠️ Teknologi yang Digunakan

- **Frontend / Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, Lucide React Icons
- **Database & Auth**: Supabase Postgres & Supabase Auth
- **Realtime & Storage**: Supabase Realtime & Supabase Storage Buckets
- **WebRTC Voice & Video**: LiveKit Cloud Client & `livekit-server-sdk`
- **Deployment**: Vercel

---

## 🚀 Panduan Memulai (Getting Started)

### 1. Prasyarat (Prerequisites)
- Node.js versi 18.x atau lebih baru
- Akun Supabase (Database, Auth, Storage)
- Akun LiveKit Cloud (WebRTC Voice & Video)

### 2. Instalasi Dependensi
```bash
git clone https://github.com/felixpalingan/Oit.git
cd Oit
npm install
```

### 3. Konfigurasi Environment Variables (`.env.local`)
Buat file `.env.local` di direktori utama proyek:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# LiveKit Cloud Configuration
LIVEKIT_URL=wss://<project-id>.livekit.cloud
NEXT_PUBLIC_LIVEKIT_URL=wss://<project-id>.livekit.cloud
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
```

### 4. Setup Database & Storage di Supabase
Jalankan skrip SQL berikut di **Supabase SQL Editor**:

```sql
-- 1. Tambahkan kolom pendukung di tabel messages
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_size TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- 2. Buat & konfigurasi Storage Bucket 'chat-attachments'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public Read Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'chat-attachments');

CREATE POLICY "Public Upload Access" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'chat-attachments');
```

---

## 💻 Jalankan di Lingkungan Lokal

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di peramban Anda.

---

## 🌐 Deploy ke Vercel

1. Push repositori ke GitHub:
   ```bash
   git add .
   git commit -m "feat: complete Oit real-time app features"
   git push origin main
   ```
2. Hubungkan repositori ke **Vercel Dashboard**.
3. Masukkan variabel lingkungan pada bagian **Settings -> Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `LIVEKIT_URL`
   - `NEXT_PUBLIC_LIVEKIT_URL`
   - `LIVEKIT_API_KEY`
   - `LIVEKIT_API_SECRET`
4. Klik **Deploy**.

---

## 📜 Lisensi
Lisensi MIT. Bebas dikembangkan dan dimodifikasi untuk kebutuhan proyek Anda.
