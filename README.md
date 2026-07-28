# ⚡ Oit — High-Voltage Spatial Communication Platform

> **Oit** is a full-stack, real-time spatial communication and community platform engineered for high-density text messaging, low-latency LiveKit WebRTC voice & video calls, and dynamic community management. Designed with a custom **High-Voltage Dark** aesthetic (`#000000` base with `#FF5C00` Oit Orange primary accents), Oit bridges the gap between high-performance gaming hubs and professional spatial team collaboration tools.

---

## 🌟 Comprehensive Core Features & Architecture

### 💬 1. Channel-Based Text Messaging (`channel_id` Architecture)
- **Strict Channel Scope Matching**: Messages are explicitly linked to unique `channel_id`s or direct message pairs (`sender_id` / `receiver_id`).
- **Real-Time Read Status Checkmarks (`is_read`)**: Single checkmark (`✔`) indicates message delivery, while double checkmarks (`✔✔`) update in real-time as soon as the recipient opens the chat.
- **File & Image Drag-and-Drop Uploader**: Built-in drag-and-drop overlay supporting images, PDFs, and raw documents with an animated orange progress bar (`0% - 100%`) and Supabase Storage integration (`chat-attachments`).

### 🎙️ 2. Multi-Participant WebRTC Voice & Video Infrastructure
- **LiveKit Cloud Integration**: Powered by `@livekit/components-react` and `livekit-client` for HD video streaming, active speaker glowing borders, and screen sharing.
- **Non-Disruptive Room Persistence**: When a participant leaves a voice channel, only their connection is closed—the voice room remains active for all remaining participants until the last person exits.
- **Supabase Realtime Presence Tracking**: Uses `presence` channels (`presence_vc_<channel_id>`) to track and render all active participants inside each voice channel in real-time, displaying avatars, display names, and live audio pulses.
- **Persistent Floating Live Pod (`● Live`)**: Minimizing a voice/video call shrinks the viewport into an interactive floating pod in the bottom-right corner (`bottom-6 right-6`), allowing users to browse text channels while maintaining 100% active WebRTC audio/video streams.

### 🏰 3. Community Server & Channel Ecosystem
- **Instant Server & Channel Creation**: Create public or private servers with initial text/voice channels that hydrate state and render in the UI instantly.
- **Server Discovery & Invite Sharing**: Generate and copy unique Server Invite Codes (`Share2` button) to allow friends to paste and join private or public servers seamlessly.
- **Channel Settings & Management (`EditChannelModal`)**: Inline channel renaming and deletion with confirmation dialogs.
- **Isolasi Server Private**: Private servers are hidden from public explore lists and can only be accessed using exact Server Invite Codes.

### 🚪 4. Spatial Security & Access Control
- **Knock-Knock Door Access System**: Real-time Supabase broadcast signaling allowing users to request entry into locked voice/text channels with interactive **Approve** and **Deny** notification cards.
- **Glassmorphism Security Check Modal**: Password-protected private channels with frosted-glass verification popups.
- **Welcome Landing Home Screen**: Modern onboarding interface greeting new users with quick action cards for finding friends, joining servers, or creating communities.

### 🎛️ 5. User Settings & Hardware Device Management
- **Hardware Device Enumeration**: Integrated camera preview canvas and dynamic microphone input volume level meter in User Settings.
- **Custom Profile Customization**: Modify display names, avatars, and bio text stored in Supabase Postgres.
- **Zustand State Persistence**: Uses `zustand/middleware/persist` with `localStorage` to keep users on their active server and channel even across browser reloads (`F5`).

---

## 🛠️ Full-Stack Technology Stack

### **Frontend & User Interface**
- **Framework**: [Next.js 16 (App Router & Turbopack)](https://nextjs.org/)
- **Language**: TypeScript (Strict type safety)
- **Styling**: Vanilla CSS Modules & Tailwind CSS (Custom `#141416` dark theme & `#FF5C00` primary token)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) with `persist` middleware
- **Icons**: [Lucide React](https://lucide.dev/)

### **Backend, Database & Real-time Subscriptions**
- **Database**: [Supabase Postgres](https://supabase.com/)
- **Authentication**: Supabase Auth (Password & Session management)
- **Real-time Engine**: Supabase Realtime Engine (Postgres Changes CDC, WebSockets & Presence Tracking)
- **Cloud Storage**: Supabase Storage (`chat-attachments` bucket for media & avatars)

### **WebRTC Communication Infrastructure**
- **WebRTC Engine**: [LiveKit Cloud](https://livekit.io/)
- **Client Libraries**: `livekit-client`, `@livekit/components-react`, `@livekit/components-styles`
- **Server Token Generator**: `livekit-server-sdk` (Next.js Route Handler API)

---

## 📐 Application Layout & Spatial Flow

```
+-----------------------------------------------------------------------------------+
|  LeftNavRail (16)  | ChannelSidebar (64-72)  | ChatWindow / WelcomeHomeScreen   |
+--------------------+-------------------------+------------------------------------+
|  [Oit Logo / DM]   | Header: Server Title    | # general / Direct Message Title   |
|                    |  [📋 Share Invite Code] |                                    |
|  [S1] Server Icon  |                         | Message Stream Bubbles             |
|  [S2] Server Icon  | TEXT CHANNELS           |  [Sender Avatar] Username - 10:42  |
|                    |  # ui-ux-sync           |  [Sent Bubble (#FF5C00)] ✔✔        |
|  [+] Create Server |  # general [⚙️]          |  [Received Bubble (#1C1C21)]       |
|                    |                         |  [PDF / Image Lightbox Preview]    |
|                    | VOICE CHANNELS          |                                    |
|                    |  🔊 Lounge Voice        | Drag & Drop Upload Progress [66%]  |
|                    |    ● Alex (Online)      |                                    |
|                    |    ● Sarah (Online)     | Input Bar                          |
|  [⚙️] Settings      |  🔒 Secret Room         |  [+] [ Message... ] [😊] [Send >]  |
|  [Avatar] Profile  |                         |                                    |
+--------------------+-------------------------+------------------------------------+
|                      [Floating Live Pod (bottom-6 right-6)]                      |
+-----------------------------------------------------------------------------------+
```

---

## 🗄️ Database Schema & RLS Policies

```sql
-- 1. Tabel Users
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabel Servers
CREATE TABLE public.servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon_url TEXT,
  is_private BOOLEAN DEFAULT false,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabel Server Members
CREATE TABLE public.server_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(server_id, user_id)
);

-- 4. Tabel Channels
CREATE TABLE public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text',
  is_private BOOLEAN DEFAULT false,
  password TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabel Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id TEXT,
  content TEXT,
  attachment_url TEXT,
  file_name TEXT,
  file_size TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_channel_id ON public.messages(channel_id);

-- Enable RLS Policies
ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.server_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public select servers" ON public.servers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public select server_members" ON public.server_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public select channels" ON public.channels FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public select messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);
```

---

## ⚡ Local Setup & Installation Guide

### **Prerequisites**
- Node.js 20+ or 22+
- npm or pnpm
- Supabase Project & LiveKit Cloud Credentials

### **1. Clone Repository**
```bash
git clone https://github.com/felixpalingan/Oit.git
cd Oit
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Environment Variables Setup (`.env.local`)**
Create a `.env.local` file in the root folder:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

LIVEKIT_URL=wss://your-project.livekit.cloud
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
```

### **4. Run Development Server**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Production Build & Deployment

To compile an optimized production build:
```bash
npm run build
npm run start
```
Seamlessly deployable to **Vercel** with zero extra configuration required.

---

## 📝 Developer Portfolio Ownership

Developed with ❤️ by **Felix Palingan** as a premier full-stack developer portfolio project.
