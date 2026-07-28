-- Skrip Pembersihan Data Sampah Lama (Fresh Start)
-- Jalankan di SQL Editor Supabase Dashboard jika ingin mengosongkan seluruh data obrolan & server lama

-- 1. Kosongkan tabel pesan
DELETE FROM public.messages;

-- 2. Kosongkan tabel channel & server
DELETE FROM public.channels;
DELETE FROM public.server_members;
DELETE FROM public.servers;

-- 3. Reset urutan atau verifikasi struktur tabel
TRUNCATE TABLE public.messages RESTART IDENTITY CASCADE;
