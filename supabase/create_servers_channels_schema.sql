-- Migration SQL untuk Ekosistem Server & Channels Oit (Dengan RLS Permissive)

-- 1. Tabel Servers
CREATE TABLE IF NOT EXISTS public.servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon_url TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabel Server Members
CREATE TABLE IF NOT EXISTS public.server_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(server_id, user_id)
);

-- 3. Tabel Channels
CREATE TABLE IF NOT EXISTS public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text',
  is_private BOOLEAN DEFAULT false,
  password TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexing
CREATE INDEX IF NOT EXISTS idx_server_members_user_id ON public.server_members(user_id);
CREATE INDEX IF NOT EXISTS idx_channels_server_id ON public.channels(server_id);

-- Enable RLS & Allow All Authenticated Operations
ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.server_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select servers" ON public.servers;
CREATE POLICY "Public select servers" ON public.servers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public select server_members" ON public.server_members;
CREATE POLICY "Public select server_members" ON public.server_members FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public select channels" ON public.channels;
CREATE POLICY "Public select channels" ON public.channels FOR ALL USING (true) WITH CHECK (true);
