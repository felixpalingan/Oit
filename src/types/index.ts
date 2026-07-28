export interface UserProfile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at?: string;
}

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  profile?: UserProfile;
}

export interface Room {
  id: string;
  type: 'direct' | 'group';
  name?: string | null;
  avatar_url?: string | null;
  created_by?: string | null;
  created_at: string;
  members?: UserProfile[];
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
  room_id: string;
  sender_id: string;
  content: string | null;
  media_url?: string | null;
  media_type?: 'image' | 'video' | 'document' | null;
  reply_to_id?: string | null;
  reply_message?: Message | null;
  is_deleted?: boolean;
  created_at: string;
  sender?: UserProfile;
  statuses?: MessageStatus[];
}
