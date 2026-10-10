import { AccessToken } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get('room');

  if (!room) {
    return NextResponse.json({ error: 'Parameter room wajib diisi' }, { status: 400 });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json({ error: 'LiveKit server credentials are not properly configured' }, { status: 500 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Supabase credentials are not configured' }, { status: 500 });
  }

  try {
    // 1. Authenticate Supabase session
    const cookieStore = await cookies();
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;

    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
            } catch {
              // Ignore in route handlers
            }
          },
        },
        global: {
          headers: bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {},
        },
      }
    );

    let user = null;
    const { data: cookieAuth } = await supabase.auth.getUser();
    if (cookieAuth?.user) {
      user = cookieAuth.user;
    } else if (bearerToken) {
      const { data: tokenAuth } = await supabase.auth.getUser(bearerToken);
      if (tokenAuth?.user) {
        user = tokenAuth.user;
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication session is invalid or expired. Please log in again.' },
        { status: 401 }
      );
    }

    // 2. Fetch authenticated user profile
    const { data: userProfile } = await supabase
      .from('users')
      .select('id, username, display_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle();

    const username = userProfile?.username || user.email?.split('@')[0] || user.id;
    const displayName = userProfile?.display_name || userProfile?.username || username;

    // 3. Room Access Control & Authorization
    if (room.startsWith('call_')) {
      // 1-on-1 Direct Call: call_<userA>_<userB>
      const participants = room.slice('call_'.length).split('_');
      if (participants.length === 2) {
        const [userA, userB] = participants;
        if (user.id !== userA && user.id !== userB) {
          return NextResponse.json(
            { error: 'Forbidden: You are not a participant in this call' },
            { status: 403 }
          );
        }
      }
    } else if (room.startsWith('vc_')) {
      // Server Voice Channel: vc_<channelId>
      const channelId = room.slice('vc_'.length);

      const { data: channel, error: chanErr } = await supabase
        .from('channels')
        .select('id, server_id, name, type, is_private')
        .eq('id', channelId)
        .maybeSingle();

      if (chanErr || !channel) {
        return NextResponse.json(
          { error: 'Voice channel room not found' },
          { status: 404 }
        );
      }

      // Check if user is banned from the server
      const { data: ban } = await supabase
        .from('server_bans')
        .select('id')
        .eq('server_id', channel.server_id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (ban) {
        return NextResponse.json(
          { error: 'Access denied: You are banned from this server' },
          { status: 403 }
        );
      }

      // Check server membership & privacy
      const { data: server } = await supabase
        .from('servers')
        .select('id, owner_id, is_private')
        .eq('id', channel.server_id)
        .maybeSingle();

      if (server) {
        const isOwner = server.owner_id === user.id;
        const { data: member } = await supabase
          .from('server_members')
          .select('role')
          .eq('server_id', channel.server_id)
          .eq('user_id', user.id)
          .maybeSingle();

        const isMember = Boolean(member);

        // If server is private, caller MUST be owner or member
        if (server.is_private && !isOwner && !isMember) {
          return NextResponse.json(
            { error: 'Access denied: You are not a member of this private server' },
            { status: 403 }
          );
        }
      }
    }

    // 4. Generate LiveKit Access Token
    const at = new AccessToken(apiKey, apiSecret, {
      identity: user.id, // Strictly bound to authenticated Supabase user ID
      name: displayName,
      metadata: JSON.stringify({
        username,
        avatar_url: userProfile?.avatar_url || null,
      }),
      ttl: '1h',
    });

    at.addGrant({
      roomJoin: true,
      room,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();
    return NextResponse.json({ token, wsUrl });
  } catch (error: any) {
    console.error('Error generating LiveKit token:', error);
    return NextResponse.json(
      { error: 'Failed to generate LiveKit token: ' + (error?.message || 'Server error') },
      { status: 500 }
    );
  }
}
