# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Dev teams, open-source maintainers, and tech communities who need high-speed real-time text chat, low-latency audio/video collaboration, and organized server-channel workspaces for daily syncs, pair programming, and community hangouts.

## Product Purpose
Oit is a high-performance real-time communication platform providing sub-100ms instant messaging, WebRTC SFU-powered voice/video calls, granular RBAC community moderation, and fault-tolerant file sharing with an iconic High-Voltage aesthetic.

## Positioning
Combines the speed and simplicity of modern community servers with low-latency WebRTC group calls (LiveKit SFU), persistent floating background calls (`● Live`), real-time PostgreSQL CDC zero-polling updates, and an uncompromised dark glassmorphic UI that feels responsive and alive.

## Operating Context
Daily communication across desktop and mobile browsers, asynchronous and synchronous dev chats, code snippet sharing, voice syncs, private password-protected channels with real-time door-knocking access requests.

## Capabilities and Constraints
- Sub-100ms instant messaging via Supabase Realtime CDC over WebSockets
- Inline message edits, threaded quote replies, soft deletions, interactive clickable mentions (`@username`)
- WebRTC voice/video calling powered by LiveKit Cloud SFU with active speaker DSP detection and floating background pod
- 4-Tier RBAC governance (Owner, Admin, Moderator, Member) with 10-minute mutes, kicks, bans, and real-time audit logs
- Pre-upload 25MB file validation with connection interruption recovery and smart 404 route interception
- Next.js 16 (App Router / Turbopack), React 19, TailwindCSS, Zustand state persistence with localStorage

## Brand Commitments
- Name: Oit
- Aesthetic: Oit High-Voltage Dark (`#000000` base, `#161619` surfaces, `#FF5C00` Vibrant Orange accent)
- Typography: Inter / Modern Sans with crisp hierarchy and glassmorphic surface treatments
- Voice: Fast, precise, technical, welcoming, modern

## Product Principles
- **Speed Over Everything**: Sub-100ms real-time data pipelines and zero-polling presence states.
- **Continuity by Default**: Active voice/video calls never disconnect when navigating between channels or text streams.
- **Strict Role Integrity**: Clear hierarchical governance where administrative boundaries are enforced instantly at the database and UI levels.
- **Graceful Degradation**: Zero blank screens ("White Screen of Death"); errors are intercepted with actionable recovery states and high-signal feedback.
