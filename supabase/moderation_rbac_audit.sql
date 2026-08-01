-- ====================================================================
-- MIGRATION: RBAC MODERATION (KICK, BAN, MUTE) & AUDIT LOG DASHBOARD
-- Jalankan skrip ini di SQL Editor Supabase Dashboard Anda.
-- ====================================================================

-- 1. Pastikan CDC Realtime menangkap payload DELETE lengkap untuk server_members
ALTER TABLE public.server_members REPLICA IDENTITY FULL;

-- 2. Tambahkan kolom muted_until di tabel server_members
ALTER TABLE public.server_members 
ADD COLUMN IF NOT EXISTS muted_until TIMESTAMPTZ;

-- 3. Buat tabel server_bans (Daftar Pengguna yang Dilarang Masuk Server)
CREATE TABLE IF NOT EXISTS public.server_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  banned_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason TEXT DEFAULT 'Pelanggaran aturan server',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(server_id, user_id)
);

-- 4. Buat tabel audit_logs (Riwayat Aktivitas Moderasi & Server)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- e.g. 'KICK_MEMBER', 'BAN_MEMBER', 'MUTE_MEMBER', 'UPDATE_ROLE', 'UPDATE_SERVER', 'DELETE_CHANNEL'
  target_id UUID,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Indeks Kecepatan Query
CREATE INDEX IF NOT EXISTS idx_server_bans_server ON public.server_bans(server_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_server ON public.audit_logs(server_id);

-- 6. Kebijakan Keamanan RLS
ALTER TABLE public.server_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select server_bans" ON public.server_bans;
CREATE POLICY "Public select server_bans" ON public.server_bans FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public select audit_logs" ON public.audit_logs;
CREATE POLICY "Public select audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

-- 7. Daftarkan tabel ke Supabase Realtime CDC (Aman jika tabel sudah terdaftar sebelumnya)
DO $$ 
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.server_bans;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;
