import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    // 1. Verify Vercel Cron Secret if configured
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid Cron Secret' },
        { status: 401 }
      );
    }

    // 2. Initialize Supabase client
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eczopjzpwgodailopons.supabase.co';
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      'sb_publishable_yCQmYNRr5LosDmWs6M2h0Q_6X0j2SMZ';

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const startTime = Date.now();

    // 3. Perform a lightweight ping query across primary tables to keep PostgreSQL warm & active
    const [serversRes, profilesRes] = await Promise.all([
      supabase.from('servers').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
    ]);

    const latencyMs = Date.now() - startTime;

    if (serversRes.error && profilesRes.error) {
      console.error('Supabase Cron Ping Error:', serversRes.error || profilesRes.error);
      return NextResponse.json(
        {
          success: false,
          error: serversRes.error?.message || profilesRes.error?.message,
          latencyMs,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase instance successfully kept alive',
      latencyMs: `${latencyMs}ms`,
      timestamp: new Date().toISOString(),
      details: {
        serverCount: serversRes.count ?? 0,
        profileCount: profilesRes.count ?? 0,
      },
    });
  } catch (err: any) {
    console.error('Unexpected Keep-Alive Cron Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Internal Server Error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
