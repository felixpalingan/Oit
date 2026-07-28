-- ====================================================================
-- SKRIP PEMBERSIHAN TOTAL (WIPE CLEAN TO ZERO) APLIKASI OIT
-- Jalankan skrip ini di SQL Editor Supabase Dashboard Anda.
-- ====================================================================

-- 1. Hapus seluruh data pesan obrolan
TRUNCATE TABLE public.messages CASCADE;

-- 2. Hapus seluruh data channel (text & voice)
TRUNCATE TABLE public.channels CASCADE;

-- 3. Hapus seluruh keanggotaan server
TRUNCATE TABLE public.server_members CASCADE;

-- 4. Hapus seluruh data server
TRUNCATE TABLE public.servers CASCADE;

-- 5. Hapus seluruh profil pengguna publik
TRUNCATE TABLE public.users CASCADE;

-- 6. Hapus seluruh akun pengguna otentikasi Supabase (Auth Users)
DELETE FROM auth.users;

-- ====================================================================
-- RE-ENABLE PERMISSIVE RLS POLICIES FOR FRESH START
-- ====================================================================

ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.server_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select servers" ON public.servers;
CREATE POLICY "Public select servers" ON public.servers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public select server_members" ON public.server_members;
CREATE POLICY "Public select server_members" ON public.server_members FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public select channels" ON public.channels;
CREATE POLICY "Public select channels" ON public.channels FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public select messages" ON public.messages;
CREATE POLICY "Public select messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);
