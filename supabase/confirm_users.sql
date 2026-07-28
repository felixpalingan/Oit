-- Jalankan query ini di SQL Editor Supabase untuk secara langsung mengonfirmasi email semua akun yang terdaftar
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;
