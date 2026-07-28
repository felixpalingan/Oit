-- Jalankan di Supabase SQL Editor untuk mendukung obrolan Server & Channel (Channel-Based Architecture)

ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS channel_id TEXT;

-- Tambahkan indeks untuk mempercepat pencarian pesan per channel
CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON public.messages(channel_id);

-- Enable RLS & Allow All Authenticated Operations for Messages (Server Channels & DMs)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select messages" ON public.messages;
CREATE POLICY "Public select messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);
