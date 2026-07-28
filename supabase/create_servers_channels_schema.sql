-- Migration SQL untuk Server Private & Public + Server Members Oit

ALTER TABLE public.servers ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;

-- Drop foreign key constraints if they block server creation
ALTER TABLE public.servers DROP CONSTRAINT IF EXISTS servers_owner_id_fkey;
ALTER TABLE public.server_members DROP CONSTRAINT IF EXISTS server_members_user_id_fkey;

-- 1. Tabel Servers
CREATE TABLE IF NOT EXISTS public.servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon_url TEXT,
  is_private BOOLEAN DEFAULT false,
  owner_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabel Server Members
CREATE TABLE IF NOT EXISTS public.server_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
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
