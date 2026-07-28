-- Jalankan di Supabase SQL Editor untuk mendukung status baca (Read status & Orange double checkmarks)
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
