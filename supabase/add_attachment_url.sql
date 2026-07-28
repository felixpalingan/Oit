-- 1. Tambahkan kolom attachment_url pada tabel messages di Supabase SQL Editor
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- 2. Tambahkan kolom pendukung file_name & file_size (opsional jika belum ada)
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_size TEXT;
