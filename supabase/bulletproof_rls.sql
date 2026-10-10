-- ====================================================================
-- OIT PRODUCTION DATABASE: SECURE & BULLETPROOF ROW LEVEL SECURITY (RLS)
-- ====================================================================
-- Panduan Eksekusi:
-- 1. Buka Supabase Dashboard -> SQL Editor (https://supabase.com/dashboard)
-- 2. Salin dan jalankan seluruh isi skrip ini.
-- 3. Skrip ini aman dijalankan ulang (idempotent: DROP IF EXISTS).
-- ====================================================================

-- --------------------------------------------------------------------
-- 0. INDEXES UNTUK PERFORMA RLS TINGGI (Zero-Latency Indexed Lookups)
-- --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_server_members_composite 
  ON public.server_members(server_id, user_id);

CREATE INDEX IF NOT EXISTS idx_server_members_role 
  ON public.server_members(server_id, user_id, role);

CREATE INDEX IF NOT EXISTS idx_servers_owner 
  ON public.servers(owner_id);

CREATE INDEX IF NOT EXISTS idx_channels_server 
  ON public.channels(server_id);

CREATE INDEX IF NOT EXISTS idx_messages_channel_sender 
  ON public.messages(channel_id, sender_id);

CREATE INDEX IF NOT EXISTS idx_messages_direct 
  ON public.messages(sender_id, receiver_id);

CREATE INDEX IF NOT EXISTS idx_server_bans_lookup 
  ON public.server_bans(server_id, user_id);

-- --------------------------------------------------------------------
-- 1. HELPER FUNCTIONS (SECURITY DEFINER untuk Mencegah Infinite Recursion)
-- --------------------------------------------------------------------

-- Cek apakah user adalah anggota atau owner server
CREATE OR REPLACE FUNCTION public.is_server_member(p_server_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.server_members
    WHERE server_id = p_server_id AND user_id = p_user_id
  ) OR EXISTS (
    SELECT 1 FROM public.servers
    WHERE id = p_server_id AND owner_id = p_user_id
  );
$$;

-- Cek apakah server bersifat privat
CREATE OR REPLACE FUNCTION public.is_server_private(p_server_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    (SELECT is_private FROM public.servers WHERE id = p_server_id),
    false
  );
$$;

-- Cek apakah user memiliki salah satu role yang diizinkan (owner selalu memiliki hak tertinggi)
CREATE OR REPLACE FUNCTION public.has_server_role(p_server_id UUID, p_user_id UUID, p_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.servers
    WHERE id = p_server_id AND owner_id = p_user_id
  ) OR EXISTS (
    SELECT 1 FROM public.server_members
    WHERE server_id = p_server_id AND user_id = p_user_id AND role = ANY(p_roles)
  );
$$;

-- Cek apakah user sedang di-ban dari server
CREATE OR REPLACE FUNCTION public.is_user_banned_from_server(p_server_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.server_bans
    WHERE server_id = p_server_id AND user_id = p_user_id
  );
$$;

-- Cek apakah user sedang di-mute di server
CREATE OR REPLACE FUNCTION public.is_user_muted_in_server(p_server_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.server_members
    WHERE server_id = p_server_id 
      AND user_id = p_user_id 
      AND muted_until IS NOT NULL 
      AND muted_until > now()
  );
$$;

-- Ambil server_id dari channel id (mendukung cast UUID & TEXT)
CREATE OR REPLACE FUNCTION public.get_server_id_from_channel(p_channel_id TEXT)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT server_id FROM public.channels
  WHERE id::TEXT = p_channel_id
  LIMIT 1;
$$;

-- Cek apakah channel dapat diakses oleh user
CREATE OR REPLACE FUNCTION public.is_channel_accessible(p_channel_id TEXT, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.channels c
    WHERE c.id::TEXT = p_channel_id
      AND (
        NOT public.is_server_private(c.server_id)
        OR public.is_server_member(c.server_id, p_user_id)
      )
      AND NOT public.is_user_banned_from_server(c.server_id, p_user_id)
  );
$$;

-- RPC Aman untuk verifikasi password channel tanpa mengekspos plaintext ke client
CREATE OR REPLACE FUNCTION public.verify_channel_password(p_channel_id UUID, p_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_expected TEXT;
BEGIN
  SELECT password INTO v_expected FROM public.channels WHERE id = p_channel_id;
  IF v_expected IS NULL OR v_expected = '' THEN
    RETURN true;
  END IF;
  RETURN (v_expected = p_password);
END;
$$;

-- --------------------------------------------------------------------
-- 2. AKTIFKAN RLS PADA SELURUH TABEL INTI
-- --------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.server_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.server_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- 3. DROP SEMUA POLICY LAMA (Bersihkan aturan permisif / bocor)
-- --------------------------------------------------------------------
DO $$ 
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname, tablename 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename IN ('users', 'servers', 'server_members', 'channels', 'messages', 'server_bans', 'audit_logs')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- --------------------------------------------------------------------
-- 4. KEBIJAKAN TABEL: public.users
-- --------------------------------------------------------------------
-- User terdaftar bisa melihat user lain (untuk DM, list member, search username)
CREATE POLICY "users_select_authenticated"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

-- User hanya bisa membuat profil untuk dirinya sendiri
CREATE POLICY "users_insert_self"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- User hanya bisa mengubah profil miliknya sendiri
CREATE POLICY "users_update_self"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- User hanya bisa menghapus profil miliknya sendiri
CREATE POLICY "users_delete_self"
  ON public.users
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = id);

-- --------------------------------------------------------------------
-- 5. KEBIJAKAN TABEL: public.servers
-- --------------------------------------------------------------------
-- User bisa melihat: server publik, server milik sendiri, atau server tempat ia bergabung
CREATE POLICY "servers_select"
  ON public.servers
  FOR SELECT
  TO authenticated
  USING (
    NOT is_private 
    OR owner_id = (select auth.uid()) 
    OR public.is_server_member(id, (select auth.uid()))
  );

-- User terdaftar bisa membuat server baru dan wajib menjadi owner
CREATE POLICY "servers_insert"
  ON public.servers
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = (select auth.uid()));

-- Hanya owner atau admin yang boleh update pengaturan server
CREATE POLICY "servers_update"
  ON public.servers
  FOR UPDATE
  TO authenticated
  USING (
    owner_id = (select auth.uid()) 
    OR public.has_server_role(id, (select auth.uid()), ARRAY['owner', 'admin'])
  )
  WITH CHECK (
    owner_id = (select auth.uid()) 
    OR public.has_server_role(id, (select auth.uid()), ARRAY['owner', 'admin'])
  );

-- Hanya owner yang boleh menghapus server
CREATE POLICY "servers_delete"
  ON public.servers
  FOR DELETE
  TO authenticated
  USING (owner_id = (select auth.uid()));

-- --------------------------------------------------------------------
-- 6. KEBIJAKAN TABEL: public.server_members
-- --------------------------------------------------------------------
-- Anggota, owner, atau pengunjung server publik dapat melihat daftar anggota
CREATE POLICY "server_members_select"
  ON public.server_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR public.is_server_member(server_id, (select auth.uid()))
    OR NOT public.is_server_private(server_id)
  );

-- Join server: User hanya bisa memasukkan dirinya sendiri, role awal 'member', dan tidak diban
-- Atau owner memasukkan dirinya sendiri saat create server sebagai 'owner'
CREATE POLICY "server_members_insert"
  ON public.server_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT public.is_user_banned_from_server(server_id, (select auth.uid()))
    AND (
      (user_id = (select auth.uid()) AND role = 'member')
      OR (
        user_id = (select auth.uid()) 
        AND role = 'owner' 
        AND EXISTS (SELECT 1 FROM public.servers s WHERE s.id = server_members.server_id AND s.owner_id = (select auth.uid()))
      )
      OR public.has_server_role(server_id, (select auth.uid()), ARRAY['owner', 'admin'])
    )
  );

-- Update role atau mute: hanya owner atau admin server
CREATE POLICY "server_members_update"
  ON public.server_members
  FOR UPDATE
  TO authenticated
  USING (
    public.has_server_role(server_id, (select auth.uid()), ARRAY['owner', 'admin'])
  )
  WITH CHECK (
    public.has_server_role(server_id, (select auth.uid()), ARRAY['owner', 'admin'])
  );

-- Leave server (diri sendiri) ATAU Kick member oleh Owner/Admin/Moderator (target bukan owner)
CREATE POLICY "server_members_delete"
  ON public.server_members
  FOR DELETE
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR (
      public.has_server_role(server_id, (select auth.uid()), ARRAY['owner', 'admin', 'moderator'])
      AND role != 'owner'
    )
  );

-- --------------------------------------------------------------------
-- 7. KEBIJAKAN TABEL: public.channels
-- --------------------------------------------------------------------
-- Anggota server atau pengunjung server publik dapat melihat channel
CREATE POLICY "channels_select"
  ON public.channels
  FOR SELECT
  TO authenticated
  USING (
    public.is_server_member(server_id, (select auth.uid()))
    OR NOT public.is_server_private(server_id)
  );

-- Hanya owner atau admin yang boleh membuat channel baru
CREATE POLICY "channels_insert"
  ON public.channels
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_server_role(server_id, (select auth.uid()), ARRAY['owner', 'admin'])
  );

-- Hanya owner atau admin yang boleh mengubah nama/tipe channel
CREATE POLICY "channels_update"
  ON public.channels
  FOR UPDATE
  TO authenticated
  USING (
    public.has_server_role(server_id, (select auth.uid()), ARRAY['owner', 'admin'])
  )
  WITH CHECK (
    public.has_server_role(server_id, (select auth.uid()), ARRAY['owner', 'admin'])
  );

-- Hanya owner atau admin yang boleh menghapus channel
CREATE POLICY "channels_delete"
  ON public.channels
  FOR DELETE
  TO authenticated
  USING (
    public.has_server_role(server_id, (select auth.uid()), ARRAY['owner', 'admin'])
  );

-- --------------------------------------------------------------------
-- 8. KEBIJAKAN TABEL: public.messages
-- --------------------------------------------------------------------
-- Membaca pesan:
-- Direct Message: Pengirim atau Penerima
-- Channel Message: Anggota server channel tersebut dan tidak di-ban
CREATE POLICY "messages_select"
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (
    (channel_id IS NULL AND (sender_id = (select auth.uid()) OR receiver_id = (select auth.uid())))
    OR (channel_id IS NOT NULL AND public.is_channel_accessible(channel_id::TEXT, (select auth.uid())))
  );

-- Mengirim pesan:
-- Pengirim WAJIB diri sendiri
-- Untuk channel: wajib memiliki akses ke channel, TIDAK di-ban, dan TIDAK sedang di-mute!
CREATE POLICY "messages_insert"
  ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = (select auth.uid())
    AND (
      channel_id IS NULL 
      OR (
        public.is_channel_accessible(channel_id::TEXT, (select auth.uid()))
        AND NOT public.is_user_muted_in_server(public.get_server_id_from_channel(channel_id::TEXT), (select auth.uid()))
        AND NOT public.is_user_banned_from_server(public.get_server_id_from_channel(channel_id::TEXT), (select auth.uid()))
      )
    )
  );

-- Mengedit pesan:
-- Pengirim boleh edit konten pesan miliknya sendiri
-- ATAU Owner/Admin/Moderator server boleh melakukan soft-delete (is_deleted = true)
CREATE POLICY "messages_update"
  ON public.messages
  FOR UPDATE
  TO authenticated
  USING (
    sender_id = (select auth.uid())
    OR (
      channel_id IS NOT NULL 
      AND public.has_server_role(public.get_server_id_from_channel(channel_id::TEXT), (select auth.uid()), ARRAY['owner', 'admin', 'moderator'])
    )
  )
  WITH CHECK (
    sender_id = (select auth.uid())
    OR (
      channel_id IS NOT NULL 
      AND public.has_server_role(public.get_server_id_from_channel(channel_id::TEXT), (select auth.uid()), ARRAY['owner', 'admin', 'moderator'])
    )
  );

-- Menghapus pesan (hard delete):
-- Pengirim atau Owner/Admin server
CREATE POLICY "messages_delete"
  ON public.messages
  FOR DELETE
  TO authenticated
  USING (
    sender_id = (select auth.uid())
    OR (
      channel_id IS NOT NULL 
      AND public.has_server_role(public.get_server_id_from_channel(channel_id::TEXT), (select auth.uid()), ARRAY['owner', 'admin'])
    )
  );

-- --------------------------------------------------------------------
-- 9. KEBIJAKAN TABEL: public.server_bans
-- --------------------------------------------------------------------
-- Melihat ban: diri sendiri yang diban (untuk notice) ATAU staff server
CREATE POLICY "server_bans_select"
  ON public.server_bans
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR public.has_server_role(server_id, (select auth.uid()), ARRAY['owner', 'admin', 'moderator'])
  );

-- Memberi ban: hanya Owner, Admin, atau Moderator
CREATE POLICY "server_bans_insert"
  ON public.server_bans
  FOR INSERT
  TO authenticated
  WITH CHECK (
    banned_by = (select auth.uid())
    AND public.has_server_role(server_id, (select auth.uid()), ARRAY['owner', 'admin', 'moderator'])
  );

-- Unban: hanya Owner atau Admin
CREATE POLICY "server_bans_delete"
  ON public.server_bans
  FOR DELETE
  TO authenticated
  USING (
    public.has_server_role(server_id, (select auth.uid()), ARRAY['owner', 'admin'])
  );

-- --------------------------------------------------------------------
-- 10. KEBIJAKAN TABEL: public.audit_logs
-- --------------------------------------------------------------------
-- Hanya staff server (Owner, Admin, Moderator) yang dapat membaca riwayat audit logs
CREATE POLICY "audit_logs_select"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    public.has_server_role(server_id, (select auth.uid()), ARRAY['owner', 'admin', 'moderator'])
  );

-- Staff mencatat aktivitas moderasi miliknya
CREATE POLICY "audit_logs_insert"
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    actor_id = (select auth.uid())
    AND public.has_server_role(server_id, (select auth.uid()), ARRAY['owner', 'admin', 'moderator'])
  );

-- Tidak ada UPDATE / DELETE untuk audit_logs (Log bersifat Immutable)

-- --------------------------------------------------------------------
-- 11. SUPABASE REALTIME REPLICATION & PERMISSIONS
-- --------------------------------------------------------------------
-- Pastikan CDC Realtime menangkap payload lengkap
ALTER TABLE public.server_members REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.server_bans REPLICA IDENTITY FULL;
ALTER TABLE public.audit_logs REPLICA IDENTITY FULL;

DO $$ 
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.users; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.servers; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.server_members; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.channels; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.messages; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.server_bans; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
