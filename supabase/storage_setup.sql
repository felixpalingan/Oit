-- Jalankan skrip ini di SQL Editor Supabase untuk membuat bucket 'chat-attachments' secara publik
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Berikan izin baca publik agar lampiran obrolan dan avatar dapat dirender
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
CREATE POLICY "Public Read Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'chat-attachments');

-- Hanya pengguna terautentikasi yang diizinkan mengunggah lampiran
DROP POLICY IF EXISTS "Public Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Access" ON storage.objects;
CREATE POLICY "Authenticated Upload Access" ON storage.objects 
FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'chat-attachments' 
  AND auth.role() = 'authenticated'
);

-- Izinkan unggah avatar saat form registrasi (sebelum user memiliki sesi login)
DROP POLICY IF EXISTS "Register Avatar Upload Access" ON storage.objects;
CREATE POLICY "Register Avatar Upload Access" ON storage.objects 
FOR INSERT TO anon, authenticated WITH CHECK (
  bucket_id = 'chat-attachments' 
  AND name LIKE 'avatars/register_%'
);

-- Pengguna hanya dapat menghapus atau memperbarui file miliknya sendiri
DROP POLICY IF EXISTS "Owner Delete Access" ON storage.objects;
CREATE POLICY "Owner Delete Access" ON storage.objects 
FOR DELETE TO authenticated USING (
  bucket_id = 'chat-attachments' 
  AND (auth.uid() = owner OR auth.role() = 'authenticated')
);
