import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    // 1. Verify Vercel Cron Secret strictly
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction || cronSecret) {
      if (!cronSecret) {
        console.error('CRON_SECRET is not configured on this server.');
        return NextResponse.json(
          { success: false, error: 'Unauthorized: CRON_SECRET is not configured on the server' },
          { status: 500 }
        );
      }

      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: Invalid or missing Cron Secret' },
          { status: 401 }
        );
      }
    }

    // 2. Initialize Supabase client strictly from environment variables (no hardcoded credentials)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables in keep-alive cron.');
      return NextResponse.json(
        { success: false, error: 'Server configuration error: Missing Supabase credentials' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const startTime = Date.now();

    // 3. Lightweight ping query across primary tables (servers & users) to keep PostgreSQL instance warm
    const [serversRes, usersRes] = await Promise.all([
      supabase.from('servers').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }),
    ]);

    const latencyMs = Date.now() - startTime;

    if (serversRes.error && usersRes.error) {
      console.error('Supabase Cron Ping Error:', serversRes.error || usersRes.error);
      return NextResponse.json(
        {
          success: false,
          error: serversRes.error?.message || usersRes.error?.message,
          latencyMs,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // 4. Return sanitized success response without leaking exact internal row counts
    return NextResponse.json({
      success: true,
      message: 'Supabase instance successfully kept alive',
      latencyMs: `${latencyMs}ms`,
      timestamp: new Date().toISOString(),
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
