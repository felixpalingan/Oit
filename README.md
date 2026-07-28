# ⚡ Oit — High-Voltage Communication Platform

> **Oit** is a full-stack, real-time spatial communication and community platform engineered for high-density text messaging, crystal-clear WebRTC voice & video calls, and dynamic community management. Designed with a custom **High-Voltage Dark** aesthetic (`#000000` base with `#FF5C00` Oit Orange primary accents), Oit bridges the gap between high-performance gaming hubs and professional spatial team collaboration tools.

---

## 🌟 Key Highlights & Engineering Features

- 💬 **Channel-Based Text Messaging Architecture (`channel_id`)**: Precise channel matching with scoped WebSockets and automated cleanup (`unsubscribe`) on channel change to guarantee zero message leakage and zero duplicate renders.
- 📹 **LiveKit Cloud WebRTC Voice & Video Calls**: Low-latency, HD video and audio communication powered by `@livekit/components-react` and `livekit-client`. Features automated active speaker detection glowing borders and screen sharing.
- 🎙️ **Persistent Floating Live Pod (`● Live`)**: Continuous WebRTC connection wrapper. Minimizing a voice/video call shrinks the viewport into a interactive floating pod in the bottom-right corner (`bottom-6 right-6`), allowing users to browse text channels while maintaining 100% active voice stream.
- 🚪 **Knock-Knock Door Access System**: Real-time Supabase broadcast signaling allowing users to request entry into locked voice/text channels with interactive **Approve** and **Deny** notification cards.
- 🔒 **Glassmorphism Security Check Modal**: Password-protected private channels with frosted-glass verification popups.
- 📁 **Seamless File & Image Drag-and-Drop**: Built-in drag-and-drop file uploader supporting images, PDFs, and documents with an animated orange progress bar (`66%`) and direct Supabase Storage bucket integration (`chat-attachments`).
- 🏰 **Server & Channel Ecosystem**: Dynamic creation of public and private communities with owner role assignment (`server_members`), invitation codes, and customizable text (`#`) & voice (`🔊`) channels.
- 🎛️ **Hardware Device Management**: Integrated camera preview canvas and dynamic microphone input volume level meter in User Settings.

---

## 🛠️ Full-Stack Technology Stack

### **Frontend & User Interface**
- **Framework**: [Next.js 16 (App Router & Turbopack)](https://nextjs.org/)
- **Language**: TypeScript (Strict mode)
- **Styling**: Vanilla CSS Modules & Tailwind CSS (Custom `#141416` dark theme & `#FF5C00` primary token)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Centralized spatial layout, call states, & navigation)
- **Icons**: [Lucide React](https://lucide.dev/)

### **Backend, Database & Real-time Subscriptions**
- **Database**: [Supabase Postgres](https://supabase.com/)
- **Authentication**: Supabase Auth (Password & Session management)
- **Real-time Engine**: Supabase Realtime Engine (Postgres Changes CDC & WebSocket Broadcast Channels)
- **Cloud Storage**: Supabase Storage (`chat-attachments` bucket for media & avatars)

### **WebRTC Communication Infrastructure**
- **WebRTC Engine**: [LiveKit Cloud](https://livekit.io/)
- **Client Libraries**: `livekit-client`, `@livekit/components-react`, `@livekit/components-styles`
- **Server Token Generator**: `livekit-server-sdk` (Next.js Route Handler API)

---

## 📐 Architecture & Layout Overview

```
+-----------------------------------------------------------------------------------+
|  LeftNavRail (16)  | ChannelSidebar (64-72)  | ChatWindow / WelcomeHomeScreen   |
+--------------------+-------------------------+------------------------------------+
|  [Oit Logo / DM]   | Header: Server Title    | # general / Direct Message Title   |
|                    |                         |                                    |
|  [S1] Server Icon  | TEXT CHANNELS           | Message Stream Bubbles             |
|  [S2] Server Icon  |  # ui-ux-sync           |  [Sender Avatar] Username - 10:42  |
|                    |  # general              |  [Sent Bubble (#FF5C00)] ✔✔        |
|  [+] Create Server |                         |  [Received Bubble (#1C1C21)]       |
|                    | VOICE CHANNELS          |  [PDF / Image Lightbox Preview]    |
|                    |  🔊 Lounge Voice        |                                    |
|                    |  🔒 Secret Room         | Upload Progress Bar [===== 66%]    |
|                    |                         |                                    |
|  [⚙️] Settings      | DIRECT MESSAGES         | Input Bar                          |
|  [Avatar] Profile  |  ● Sarah (26)           |  [+] [ Message... ] [😊] [Send >]  |
+--------------------+-------------------------+------------------------------------+
|                      [Floating Live Pod (bottom-6 right-6)]                      |
+-----------------------------------------------------------------------------------+
```

---

## 🗄️ Database Schema & Architecture

### **1. `public.users`**
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### **2. `public.servers`**
```sql
CREATE TABLE public.servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon_url TEXT,
  is_private BOOLEAN DEFAULT false,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### **3. `public.server_members`**
```sql
CREATE TABLE public.server_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'owner' | 'admin' | 'member'
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(server_id, user_id)
);
```

### **4. `public.channels`**
```sql
CREATE TABLE public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text', -- 'text' | 'voice'
  is_private BOOLEAN DEFAULT false,
  password TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### **5. `public.messages`**
```sql
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
```

---

## ⚡ Getting Started Locally

### **Prerequisites**
- Node.js 20+ or 22+
- npm or pnpm
- Supabase Account & LiveKit Cloud Account

### **1. Clone Repository**
```bash
git clone https://github.com/felixpalingan/Oit.git
cd Oit
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Setup Environment Variables (`.env.local`)**
Create a `.env.local` file in the root directory:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# LiveKit Cloud Configuration
LIVEKIT_URL=wss://your-project.livekit.cloud
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
```

### **4. Execute Database Setup in Supabase SQL Editor**
Run `supabase/create_servers_channels_schema.sql` and `supabase/add_channel_id.sql` in your Supabase SQL Editor.

### **5. Run Development Server**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Production Build & Deployment

To generate an optimized production bundle:
```bash
npm run build
npm run start
```
Deployment ready on **Vercel** with automatic Environment Variables integration.

---

## 📝 License & Portfolio Ownership

Crafted with ❤️ by **Felix Palingan** as a premier full-stack portfolio showcase for modern web applications.
