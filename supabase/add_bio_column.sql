-- ====================================================================
-- SKRIP PENAMBAHAN KOLOM BIO UNTUK DESKRIPSI ABOUT ME PENGGUNA
-- Jalankan skrip ini di SQL Editor Supabase Dashboard Anda.
-- ====================================================================

-- 1. Tambah kolom bio di tabel public.users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT 'Navigating the digital ether.';

-- 2. Pastikan RLS mengizinkan update kolom bio
DROP POLICY IF EXISTS "Public update users" ON public.users;
CREATE POLICY "Public update users" ON public.users FOR ALL USING (true) WITH CHECK (true);
