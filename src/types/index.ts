export interface User {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio?: string | null;
  created_at?: string;
}

export type UserProfile = User;

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  profile?: User;
}

export interface Room {
  id: string;
  type: 'direct' | 'group';
  name?: string | null;
  avatar_url?: string | null;
  created_by?: string | null;
  created_at: string;
  members?: User[];
  last_message?: Message;
  unread_count?: number;
}

export interface MessageStatus {
  message_id: string;
  user_id: string;
  status: 'sent' | 'delivered' | 'read';
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id?: string | null;
  channel_id?: string | null;
  group_id?: string | null;
  room_id?: string;
  content: string | null;
  attachment_url?: string | null;
  media_url?: string | null;
  media_type?: 'image' | 'video' | 'document' | null;
  file_url?: string | null;
  file_name?: string | null;
  file_size?: string | null;
  reply_to_id?: string | null;
  is_deleted?: boolean;
  is_read?: boolean;
  created_at: string;
  sender?: User;
  statuses?: MessageStatus[];
}

export interface ChatContact {
  user: User;
  lastMessage?: Message;
  unreadCount?: number;
}
