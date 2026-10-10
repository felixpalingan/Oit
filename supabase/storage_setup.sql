-- ====================================================================
-- OIT PRODUCTION STORAGE SETUP: SECURE & BULLETPROOF STORAGE POLICIES
-- ====================================================================
-- Panduan Eksekusi:
-- 1. Buka Supabase Dashboard -> SQL Editor (https://supabase.com/dashboard)
-- 2. Salin dan jalankan seluruh isi skrip ini.
-- 3. Skrip ini aman dijalankan ulang (idempotent: DROP IF EXISTS).
-- ====================================================================

-- 1. Buat / Perbarui Bucket 'chat-attachments' dengan Batasan Server 25MB & MIME Whitelist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'chat-attachments', 
  'chat-attachments', 
  true,
  26214400, -- 25 MB (25 * 1024 * 1024) batas tegas di level storage server
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

-- 2. Bersihkan Kebijakan Lama
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

-- 3. Kebijakan BACA Publik (SELECT)
-- Lampiran pesan, avatar profil, dan icon server dapat dibaca secara publik untuk rendering UI
CREATE POLICY "chat_attachments_public_read" ON storage.objects 
FOR SELECT 
USING (bucket_id = 'chat-attachments');

-- 4. Kebijakan UPLOAD untuk Pengguna Terautentikasi (INSERT)
-- - Folder pribadi pengguna: <user_id>/...
-- - Avatar pengguna: avatars/<user_id>_... (ekstensi gambar)
-- - Server icon: server_icons/... (ekstensi gambar)
-- - DILARANG file executable/skrip berbahaya (.exe, .sh, .bat, .php, dll.)
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

-- 5. Kebijakan UPLOAD Avatar Registrasi (Anon & Authenticated)
-- Hanya diizinkan pada path avatars/register_..., hanya ekstensi gambar, dan maks 5MB
CREATE POLICY "chat_attachments_register_avatar_upload" ON storage.objects 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (
  bucket_id = 'chat-attachments' 
  AND name LIKE 'avatars/register_%'
  AND lower(COALESCE(storage.extension(name), '')) IN ('png', 'jpg', 'jpeg', 'webp', 'gif')
  AND (metadata->>'size' IS NULL OR (metadata->>'size')::bigint <= 5242880)
);

-- 6. Kebijakan HAPUS Berkas (DELETE)
-- HANYA pemilik file yang boleh menghapus file miliknya sendiri!
-- (Memperbaiki celah keamanan fatal di mana sebelumnya auth.role() = 'authenticated' membiarkan sembarang user menghapus file orang lain)
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

-- 7. Kebijakan UPDATE Berkas (UPDATE)
-- Hanya pemilik yang berhak memperbarui file miliknya sendiri
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
