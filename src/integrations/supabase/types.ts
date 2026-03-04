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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      church_memberships: {
        Row: {
          church_id: string
          id: string
          joined_at: string
          role: string
          status: string
          user_id: string
        }
        Insert: {
          church_id: string
          id?: string
          joined_at?: string
          role?: string
          status?: string
          user_id: string
        }
        Update: {
          church_id?: string
          id?: string
          joined_at?: string
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "church_memberships_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      church_prayer_requests: {
        Row: {
          anonymous: boolean
          approved_at: string | null
          approved_by: string | null
          category: string
          church_id: string
          created_at: string
          description: string
          id: string
          rejected_reason: string | null
          show_country: boolean
          status: string
          submitted_by: string
          title: string
          updated_at: string
        }
        Insert: {
          anonymous?: boolean
          approved_at?: string | null
          approved_by?: string | null
          category?: string
          church_id: string
          created_at?: string
          description: string
          id?: string
          rejected_reason?: string | null
          show_country?: boolean
          status?: string
          submitted_by: string
          title: string
          updated_at?: string
        }
        Update: {
          anonymous?: boolean
          approved_at?: string | null
          approved_by?: string | null
          category?: string
          church_id?: string
          created_at?: string
          description?: string
          id?: string
          rejected_reason?: string | null
          show_country?: boolean
          status?: string
          submitted_by?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "church_prayer_requests_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      churches: {
        Row: {
          address: string | null
          city: string | null
          contact_email: string
          country: string
          created_at: string
          created_by: string
          denomination: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          privacy: string
          state: string | null
          status: string
          updated_at: string
          verified: boolean
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_email: string
          country?: string
          created_at?: string
          created_by: string
          denomination?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          privacy?: string
          state?: string | null
          status?: string
          updated_at?: string
          verified?: boolean
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_email?: string
          country?: string
          created_at?: string
          created_by?: string
          denomination?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          privacy?: string
          state?: string | null
          status?: string
          updated_at?: string
          verified?: boolean
          website?: string | null
        }
        Relationships: []
      }
      family_groups: {
        Row: {
          created_at: string
          created_by: string
          id: string
          invite_code: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          invite_code: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          invite_code?: string
          name?: string
        }
        Relationships: []
      }
      family_members: {
        Row: {
          display_name: string | null
          family_group_id: string
          id: string
          joined_at: string
          role: string
          status: string
          user_id: string
        }
        Insert: {
          display_name?: string | null
          family_group_id: string
          id?: string
          joined_at?: string
          role?: string
          status?: string
          user_id: string
        }
        Update: {
          display_name?: string | null
          family_group_id?: string
          id?: string
          joined_at?: string
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      family_notes: {
        Row: {
          created_at: string
          created_by: string
          family_group_id: string
          id: string
          note_text: string
        }
        Insert: {
          created_at?: string
          created_by: string
          family_group_id: string
          id?: string
          note_text: string
        }
        Update: {
          created_at?: string
          created_by?: string
          family_group_id?: string
          id?: string
          note_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_notes_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      family_prayer_logs: {
        Row: {
          id: string
          prayed_at: string
          request_id: string
          user_id: string
        }
        Insert: {
          id?: string
          prayed_at?: string
          request_id: string
          user_id: string
        }
        Update: {
          id?: string
          prayed_at?: string
          request_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_prayer_logs_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "family_prayer_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      family_prayer_requests: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          family_group_id: string
          id: string
          reminder_enabled: boolean
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          family_group_id: string
          id?: string
          reminder_enabled?: boolean
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          family_group_id?: string
          id?: string
          reminder_enabled?: boolean
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_prayer_requests_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      family_scriptures: {
        Row: {
          created_at: string
          family_group_id: string
          id: string
          note: string | null
          shared_by: string
          translation: string
          verse_reference: string
          verse_text: string
        }
        Insert: {
          created_at?: string
          family_group_id: string
          id?: string
          note?: string | null
          shared_by: string
          translation?: string
          verse_reference: string
          verse_text: string
        }
        Update: {
          created_at?: string
          family_group_id?: string
          id?: string
          note?: string | null
          shared_by?: string
          translation?: string
          verse_reference?: string
          verse_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_scriptures_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_chain_nodes: {
        Row: {
          created_at: string
          depth_level: number
          id: string
          parent_user_id: string | null
          prayed_at: string
          prayer_id: string
          shared_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          depth_level?: number
          id?: string
          parent_user_id?: string | null
          prayed_at?: string
          prayer_id: string
          shared_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          depth_level?: number
          id?: string
          parent_user_id?: string | null
          prayed_at?: string
          prayer_id?: string
          shared_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      prayer_reminder_daily_logs: {
        Row: {
          completed_at: string | null
          date_local: string
          id: string
          prayed_completed: boolean
          prayer_reminder_id: string
          source: string
        }
        Insert: {
          completed_at?: string | null
          date_local: string
          id?: string
          prayed_completed?: boolean
          prayer_reminder_id: string
          source?: string
        }
        Update: {
          completed_at?: string | null
          date_local?: string
          id?: string
          prayed_completed?: boolean
          prayer_reminder_id?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "prayer_reminder_daily_logs_prayer_reminder_id_fkey"
            columns: ["prayer_reminder_id"]
            isOneToOne: false
            referencedRelation: "prayer_reminders"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_reminders: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          prayer_id: string
          prayer_title: string
          reminder_time_local: string
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          prayer_id: string
          prayer_title: string
          reminder_time_local?: string
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          prayer_id?: string
          prayer_title?: string
          reminder_time_local?: string
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_prayer_stats: {
        Row: {
          id: string
          total_chains_started: number
          total_prayers_offered: number
          total_prayers_received: number
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          total_chains_started?: number
          total_prayers_offered?: number
          total_prayers_received?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          total_chains_started?: number
          total_prayers_offered?: number
          total_prayers_received?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_church_role: {
        Args: { _church_id: string; _user_id: string }
        Returns: string
      }
      is_church_member: {
        Args: { _church_id: string; _user_id: string }
        Returns: boolean
      }
      is_family_member: {
        Args: { _family_group_id: string; _user_id: string }
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
