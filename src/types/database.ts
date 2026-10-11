export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action_type: string
          actor_id: string
          created_at: string | null
          details: string | null
          id: string
          server_id: string
          target_id: string | null
        }
        Insert: {
          action_type: string
          actor_id: string
          created_at?: string | null
          details?: string | null
          id?: string
          server_id: string
          target_id?: string | null
        }
        Update: {
          action_type?: string
          actor_id?: string
          created_at?: string | null
          details?: string | null
          id?: string
          server_id?: string
          target_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
        ]
      }
      channels: {
        Row: {
          created_at: string | null
          id: string
          is_private: boolean | null
          name: string
          password: string | null
          server_id: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          name: string
          password?: string | null
          server_id: string
          type?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          name?: string
          password?: string | null
          server_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "channels_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_url: string | null
          channel_id: string | null
          content: string
          created_at: string | null
          file_name: string | null
          file_size: string | null
          group_id: string | null
          id: string
          is_deleted: boolean | null
          is_edited: boolean | null
          is_read: boolean | null
          receiver_id: string | null
          reply_to_id: string | null
          sender_id: string
        }
        Insert: {
          attachment_url?: string | null
          channel_id?: string | null
          content: string
          created_at?: string | null
          file_name?: string | null
          file_size?: string | null
          group_id?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          is_read?: boolean | null
          receiver_id?: string | null
          reply_to_id?: string | null
          sender_id: string
        }
        Update: {
          attachment_url?: string | null
          channel_id?: string | null
          content?: string
          created_at?: string | null
          file_name?: string | null
          file_size?: string | null
          group_id?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          is_read?: boolean | null
          receiver_id?: string | null
          reply_to_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      server_bans: {
        Row: {
          banned_by: string
          created_at: string | null
          id: string
          reason: string | null
          server_id: string
          user_id: string
        }
        Insert: {
          banned_by: string
          created_at?: string | null
          id?: string
          reason?: string | null
          server_id: string
          user_id: string
        }
        Update: {
          banned_by?: string
          created_at?: string | null
          id?: string
          reason?: string | null
          server_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "server_bans_banned_by_fkey"
            columns: ["banned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_bans_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_bans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      server_members: {
        Row: {
          id: string
          joined_at: string | null
          muted_until: string | null
          role: string
          server_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          muted_until?: string | null
          role?: string
          server_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          muted_until?: string | null
          role?: string
          server_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "server_members_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
        ]
      }
      servers: {
        Row: {
          created_at: string | null
          icon_url: string | null
          id: string
          is_private: boolean | null
          name: string
          owner_id: string
        }
        Insert: {
          created_at?: string | null
          icon_url?: string | null
          id?: string
          is_private?: boolean | null
          name: string
          owner_id: string
        }
        Update: {
          created_at?: string | null
          icon_url?: string | null
          id?: string
          is_private?: boolean | null
          name?: string
          owner_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_moderate_member: {
        Args: { p_actor_id: string; p_server_id: string; p_target_id: string }
        Returns: boolean
      }
      get_member_role_by_id: { Args: { p_member_id: string }; Returns: string }
      get_member_role_rank: { Args: { p_role: string }; Returns: number }
      get_server_id_from_channel: {
        Args: { p_channel_id: string }
        Returns: string
      }
      has_server_role: {
        Args: { p_roles: string[]; p_server_id: string; p_user_id: string }
        Returns: boolean
      }
      is_channel_accessible: {
        Args: { p_channel_id: string; p_user_id: string }
        Returns: boolean
      }
      is_server_member: {
        Args: { p_server_id: string; p_user_id: string }
        Returns: boolean
      }
      is_server_private: { Args: { p_server_id: string }; Returns: boolean }
      is_user_banned_from_server: {
        Args: { p_server_id: string; p_user_id: string }
        Returns: boolean
      }
      is_user_muted_in_server: {
        Args: { p_server_id: string; p_user_id: string }
        Returns: boolean
      }
      verify_channel_password: {
        Args: { p_channel_id: string; p_password: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
