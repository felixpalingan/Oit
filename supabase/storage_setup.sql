-- Jalankan skrip ini di SQL Editor Supabase untuk membuat bucket 'chat-attachments' secara publik
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Berikan izin akses unggah & unduh publik ke bucket chat-attachments
CREATE POLICY "Public Read Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'chat-attachments');

CREATE POLICY "Public Upload Access" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'chat-attachments');
