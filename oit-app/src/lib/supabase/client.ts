import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eczopjzpwgodailopons.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_yCQmYNRr5LosDmWs6M2h0Q_6X0j2SMZ';
  
  return createBrowserClient(supabaseUrl, supabaseKey);
}
