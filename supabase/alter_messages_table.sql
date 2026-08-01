-- ====================================================================
-- MIGRATION: MENDUKUNG EDIT, HAPUS, QUOTE REPLY & MENTIONS PESAN
-- Jalankan skrip ini di SQL Editor Supabase Dashboard Anda.
-- ====================================================================

-- 1. Tambahkan kolom is_edited dan is_deleted
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- 2. Tambahkan Foreign Key reply_to_id (Self-Referencing ke messages.id)
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL;

-- 3. Indeks Kecepatan Query Reply
CREATE INDEX IF NOT EXISTS idx_messages_reply_to_id ON public.messages(reply_to_id);

-- 4. Pastikan Supabase Realtime CDC Menangkap Event UPDATE pada messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
