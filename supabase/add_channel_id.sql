-- Jalankan di Supabase SQL Editor untuk mendukung isolasi obrolan berbasis Channel ID (Channel-Based Architecture)
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS channel_id TEXT;

-- Tambahkan indeks untuk mempercepat pencarian pesan per channel
CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON public.messages(channel_id);
