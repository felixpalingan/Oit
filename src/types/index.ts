export interface User {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id?: string | null;
  group_id?: string | null;
  content: string;
  file_url?: string | null;
  file_name?: string | null;
  file_size?: string | null;
  created_at: string;
  sender?: User;
}

export interface ChatContact {
  user: User;
  lastMessage?: Message;
  unreadCount?: number;
}
