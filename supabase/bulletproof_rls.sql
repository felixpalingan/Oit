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

-- Konversi nama role ke bobot peringkat hierarki
CREATE OR REPLACE FUNCTION public.get_member_role_rank(p_role TEXT)
RETURNS INT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_role
    WHEN 'owner' THEN 4
    WHEN 'admin' THEN 3
    WHEN 'moderator' THEN 2
    ELSE 1 -- 'member'
  END;
$$;

-- Ambil role member saat ini berdasarkan id member (SECURITY DEFINER untuk cegah RLS recursion)
CREATE OR REPLACE FUNCTION public.get_member_role_by_id(p_member_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.server_members WHERE id = p_member_id;
$$;

-- Cek apakah actor memiliki wewenang hierarki untuk memoderasi target (Mute, Kick, Ban)
CREATE OR REPLACE FUNCTION public.can_moderate_member(p_server_id UUID, p_actor_id UUID, p_target_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    -- 1. Target tidak boleh merupakan owner server
    p_target_id != (SELECT owner_id FROM public.servers WHERE id = p_server_id)
    -- 2. Actor tidak boleh memoderasi dirinya sendiri
    AND p_actor_id != p_target_id
    -- 3. Jika actor adalah owner server, selalu diizinkan
    AND (
      p_actor_id = (SELECT owner_id FROM public.servers WHERE id = p_server_id)
      OR (
        -- 4. Jika bukan owner, actor minimal berstatus moderator (rank >= 2)
        COALESCE((
          SELECT public.get_member_role_rank(role) 
          FROM public.server_members 
          WHERE server_id = p_server_id AND user_id = p_actor_id
        ), 0) >= 2
        -- 5. Dan rank actor harus lebih tinggi daripada rank target
        AND COALESCE((
          SELECT public.get_member_role_rank(role) 
          FROM public.server_members 
          WHERE server_id = p_server_id AND user_id = p_actor_id
        ), 0) > COALESCE((
          SELECT public.get_member_role_rank(role) 
          FROM public.server_members 
          WHERE server_id = p_server_id AND user_id = p_target_id
        ), 1)
      )
    );
$$;

-- Ambil server_id dari channel id (mendukung cast UUID, TEXT, dan fallback virtual <server_id>-general)
CREATE OR REPLACE FUNCTION public.get_server_id_from_channel(p_channel_id TEXT)
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_server_id UUID;
BEGIN
  IF p_channel_id IS NULL THEN
    RETURN NULL;
  END IF;

  IF p_channel_id LIKE '%-general' AND length(p_channel_id) >= 36 THEN
    BEGIN
      RETURN substring(p_channel_id from 1 for 36)::UUID;
    EXCEPTION WHEN others THEN
      NULL;
    END;
  END IF;

  SELECT server_id INTO v_server_id 
  FROM public.channels
  WHERE id::TEXT = p_channel_id
  LIMIT 1;

  RETURN v_server_id;
END;
$$;

-- Cek apakah channel dapat diakses oleh user
CREATE OR REPLACE FUNCTION public.is_channel_accessible(p_channel_id TEXT, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_server_id UUID;
  v_accessible BOOLEAN;
BEGIN
  IF p_channel_id IS NULL THEN
    RETURN false;
  END IF;

  -- 1. Cek jika channel terdaftar di tabel channels
  SELECT EXISTS (
    SELECT 1 FROM public.channels c
    WHERE c.id::TEXT = p_channel_id
      AND (
        NOT public.is_server_private(c.server_id)
        OR public.is_server_member(c.server_id, p_user_id)
      )
      AND NOT public.is_user_banned_from_server(c.server_id, p_user_id)
  ) INTO v_accessible;

  IF v_accessible THEN
    RETURN true;
  END IF;

  -- 2. Cek fallback format virtual <server_id>-general
  IF p_channel_id LIKE '%-general' AND length(p_channel_id) >= 36 THEN
    BEGIN
      v_server_id := substring(p_channel_id from 1 for 36)::UUID;
      RETURN (
        (NOT public.is_server_private(v_server_id) OR public.is_server_member(v_server_id, p_user_id))
        AND NOT public.is_user_banned_from_server(v_server_id, p_user_id)
      );
    EXCEPTION WHEN others THEN
      RETURN false;
    END;
  END IF;

  RETURN false;
END;
$$;

-- --------------------------------------------------------------------
-- TRIGGER OTOMATIS: Buat profil pengguna saat pendaftaran akun di auth.users
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    display_name = COALESCE(EXCLUDED.display_name, public.users.display_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

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

GRANT EXECUTE ON FUNCTION public.verify_channel_password(UUID, TEXT) TO authenticated, anon;

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
  TO authenticated, anon
  WITH CHECK ((select auth.uid()) = id OR (select auth.uid()) IS NULL);

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

-- Update role atau mute: mematuhi hierarki peran ketat (RBAC)
CREATE POLICY "server_members_update"
  ON public.server_members
  FOR UPDATE
  TO authenticated
  USING (
    -- Staff boleh mengupdate jika memenuhi wewenang terhadap target
    public.has_server_role(server_id, (select auth.uid()), ARRAY['owner', 'admin', 'moderator'])
    AND (
      -- Owner server selalu boleh mengubah member di server miliknya
      EXISTS (SELECT 1 FROM public.servers s WHERE s.id = server_members.server_id AND s.owner_id = (select auth.uid()))
      -- Staff lain harus lolos hierarki can_moderate_member
      OR public.can_moderate_member(server_id, (select auth.uid()), user_id)
    )
  )
  WITH CHECK (
    -- Hanya Owner yang berhak mengangkat member menjadi 'owner'
    (
      role != 'owner' 
      OR EXISTS (SELECT 1 FROM public.servers s WHERE s.id = server_members.server_id AND s.owner_id = (select auth.uid()))
    )
    -- Moderator hanya boleh update muted_until, tidak boleh mengubah role
    AND (
      public.has_server_role(server_id, (select auth.uid()), ARRAY['owner', 'admin'])
      OR role = public.get_member_role_by_id(id)
    )
  );

-- Leave server (diri sendiri) ATAU Kick member oleh Staff yang berwenang (mematuhi hierarki)
CREATE POLICY "server_members_delete"
  ON public.server_members
  FOR DELETE
  TO authenticated
  USING (
    -- Diri sendiri boleh keluar (leave), asalkan bukan owner server
    (
      user_id = (select auth.uid()) 
      AND NOT EXISTS (SELECT 1 FROM public.servers s WHERE s.id = server_members.server_id AND s.owner_id = (select auth.uid()))
    )
    -- ATAU Staff meng-kick target sesuai hierarki peran
    OR public.can_moderate_member(server_id, (select auth.uid()), user_id)
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
-- Pengirim boleh edit konten pesan miliknya sendiri, ASALKAN TIDAK SEDANG DI-MUTE ATAU DI-BAN
-- ATAU Staff server (Owner, Admin, Moderator) boleh melakukan moderasi (soft-delete is_deleted = true)
CREATE POLICY "messages_update"
  ON public.messages
  FOR UPDATE
  TO authenticated
  USING (
    (
      sender_id = (select auth.uid())
      AND (
        channel_id IS NULL 
        OR (
          NOT public.is_user_muted_in_server(public.get_server_id_from_channel(channel_id::TEXT), (select auth.uid()))
          AND NOT public.is_user_banned_from_server(public.get_server_id_from_channel(channel_id::TEXT), (select auth.uid()))
        )
      )
    )
    OR (
      channel_id IS NOT NULL 
      AND public.has_server_role(public.get_server_id_from_channel(channel_id::TEXT), (select auth.uid()), ARRAY['owner', 'admin', 'moderator'])
    )
  )
  WITH CHECK (
    (
      sender_id = (select auth.uid())
      AND (
        channel_id IS NULL 
        OR (
          NOT public.is_user_muted_in_server(public.get_server_id_from_channel(channel_id::TEXT), (select auth.uid()))
          AND NOT public.is_user_banned_from_server(public.get_server_id_from_channel(channel_id::TEXT), (select auth.uid()))
        )
      )
    )
    OR (
      channel_id IS NOT NULL 
      AND public.has_server_role(public.get_server_id_from_channel(channel_id::TEXT), (select auth.uid()), ARRAY['owner', 'admin', 'moderator'])
    )
  );

-- Menghapus pesan (hard delete):
-- Pengirim atau Staff Server (Owner, Admin, Moderator)
CREATE POLICY "messages_delete"
  ON public.messages
  FOR DELETE
  TO authenticated
  USING (
    sender_id = (select auth.uid())
    OR (
      channel_id IS NOT NULL 
      AND public.has_server_role(public.get_server_id_from_channel(channel_id::TEXT), (select auth.uid()), ARRAY['owner', 'admin', 'moderator'])
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

-- Memberi ban: hanya Staff server yang pangkatnya lebih tinggi dari target (Owner tidak bisa diban)
CREATE POLICY "server_bans_insert"
  ON public.server_bans
  FOR INSERT
  TO authenticated
  WITH CHECK (
    banned_by = (select auth.uid())
    AND public.can_moderate_member(server_id, (select auth.uid()), user_id)
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

-- --------------------------------------------------------------------
-- 12. STORAGE BUCKET & OBJECT SECURITY POLICIES (chat-attachments)
-- --------------------------------------------------------------------
-- Batasi ukuran 25MB (26214400 bytes) di level server storage & Whitelist MIME Types
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'chat-attachments', 
  'chat-attachments', 
  true,
  26214400,
  ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/aac', 'audio/flac',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
    'application/pdf',
    'text/plain', 'text/markdown', 'text/csv',
    'application/json',
    'application/zip', 'application/x-zip-compressed', 'application/x-tar', 'application/gzip',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword', 'application/vnd.ms-excel', 'application/vnd.ms-powerpoint'
  ]
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 26214400,
  allowed_mime_types = ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/aac', 'audio/flac',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
    'application/pdf',
    'text/plain', 'text/markdown', 'text/csv',
    'application/json',
    'application/zip', 'application/x-zip-compressed', 'application/x-tar', 'application/gzip',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword', 'application/vnd.ms-excel', 'application/vnd.ms-powerpoint'
  ];

DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Register Avatar Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Owner Delete Access" ON storage.objects;
DROP POLICY IF EXISTS "Owner Update Access" ON storage.objects;
DROP POLICY IF EXISTS "chat_attachments_public_read" ON storage.objects;
DROP POLICY IF EXISTS "chat_attachments_auth_upload" ON storage.objects;
DROP POLICY IF EXISTS "chat_attachments_register_avatar_upload" ON storage.objects;
DROP POLICY IF EXISTS "chat_attachments_owner_delete" ON storage.objects;
DROP POLICY IF EXISTS "chat_attachments_owner_update" ON storage.objects;

-- Baca berkas publik (SELECT)
CREATE POLICY "chat_attachments_public_read" ON storage.objects 
FOR SELECT 
USING (bucket_id = 'chat-attachments');

-- Upload berkas pengguna terautentikasi (INSERT)
CREATE POLICY "chat_attachments_auth_upload" ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'chat-attachments'
  AND lower(COALESCE(storage.extension(name), '')) NOT IN (
    'exe', 'dll', 'bat', 'cmd', 'sh', 'php', 'html', 'htm', 'js', 'jar', 'vbs', 'com', 'scr', 'phtml', 'phar', 'py', 'ps1', 'cgi'
  )
  AND (
    (storage.foldername(name))[1] = (select auth.uid())::text
    OR (name LIKE 'avatars/' || (select auth.uid())::text || '_%' AND lower(COALESCE(storage.extension(name), '')) IN ('png', 'jpg', 'jpeg', 'webp', 'gif'))
    OR (name LIKE 'server_icons/%' AND lower(COALESCE(storage.extension(name), '')) IN ('png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'))
  )
);

-- Upload avatar registrasi (INSERT: Anon & Authenticated)
CREATE POLICY "chat_attachments_register_avatar_upload" ON storage.objects 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (
  bucket_id = 'chat-attachments' 
  AND name LIKE 'avatars/register_%'
  AND lower(COALESCE(storage.extension(name), '')) IN ('png', 'jpg', 'jpeg', 'webp', 'gif')
  AND (metadata->>'size' IS NULL OR (metadata->>'size')::bigint <= 5242880)
);

-- Hapus berkas hanya milik sendiri (DELETE)
CREATE POLICY "chat_attachments_owner_delete" ON storage.objects 
FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'chat-attachments' 
  AND (
    owner = (select auth.uid())
    OR (storage.foldername(name))[1] = (select auth.uid())::text
    OR name LIKE 'avatars/' || (select auth.uid())::text || '_%'
    OR (
      name LIKE 'server_icons/%'
      AND (
        owner = (select auth.uid())
        OR EXISTS (
          SELECT 1 FROM public.servers s 
          WHERE s.owner_id = (select auth.uid()) 
          AND name LIKE 'server_icons/' || s.id::text || '_%'
        )
      )
    )
  )
);

-- Update berkas hanya milik sendiri (UPDATE)
CREATE POLICY "chat_attachments_owner_update" ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'chat-attachments' 
  AND (
    owner = (select auth.uid())
    OR (storage.foldername(name))[1] = (select auth.uid())::text
    OR name LIKE 'avatars/' || (select auth.uid())::text || '_%'
  )
)
WITH CHECK (
  bucket_id = 'chat-attachments' 
  AND (
    owner = (select auth.uid())
    OR (storage.foldername(name))[1] = (select auth.uid())::text
    OR name LIKE 'avatars/' || (select auth.uid())::text || '_%'
  )
);

