-- Jalankan skrip ini di SQL Editor Supabase Dashboard Anda untuk menghapus seluruh data ujicoba (Fresh Start back to 0)

-- 1. Hapus Seluruh Pesan & Lampiran
DELETE FROM public.messages;

-- 2. Hapus Seluruh Channels
DELETE FROM public.channels;

-- 3. Hapus Seluruh Anggota Server
DELETE FROM public.server_members;

-- 4. Hapus Seluruh Server
DELETE FROM public.servers;

-- (Opsional) Hapus data profil pengguna lama jika ingin mengosongkan pengguna (auth users tetap dapat registrasi ulang)
-- DELETE FROM public.users;
