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
      admin_audit_log: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          id: string
          metadata_json: Json | null
          reason: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          id?: string
          metadata_json?: Json | null
          reason?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          id?: string
          metadata_json?: Json | null
          reason?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      app_events: {
        Row: {
          actor_user_id: string | null
          country_code: string | null
          country_name: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          event_type: string
          id: string
          metadata_json: Json | null
        }
        Insert: {
          actor_user_id?: string | null
          country_code?: string | null
          country_name?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event_type: string
          id?: string
          metadata_json?: Json | null
        }
        Update: {
          actor_user_id?: string | null
          country_code?: string | null
          country_name?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string
          id?: string
          metadata_json?: Json | null
        }
        Relationships: []
      }
      automation_rules: {
        Row: {
          conditions: Json
          created_at: string
          created_by: string | null
          description: string | null
          enabled: boolean
          id: string
          name: string
          priority: number
          rule_type: string
          updated_at: string
        }
        Insert: {
          conditions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          enabled?: boolean
          id?: string
          name: string
          priority?: number
          rule_type: string
          updated_at?: string
        }
        Update: {
          conditions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          enabled?: boolean
          id?: string
          name?: string
          priority?: number
          rule_type?: string
          updated_at?: string
        }
        Relationships: []
      }
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
          {
            foreignKeyName: "church_memberships_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches_public"
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
          hidden_at: string | null
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
          hidden_at?: string | null
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
          hidden_at?: string | null
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
          {
            foreignKeyName: "church_prayer_requests_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches_public"
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
          description: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          privacy: string
          slug: string | null
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
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          privacy?: string
          slug?: string | null
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
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          privacy?: string
          slug?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          verified?: boolean
          website?: string | null
        }
        Relationships: []
      }
      community_join_requests: {
        Row: {
          community_id: string
          created_at: string
          id: string
          message: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewed_note: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          community_id: string
          created_at?: string
          id?: string
          message?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewed_note?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          community_id?: string
          created_at?: string
          id?: string
          message?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewed_note?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_join_requests_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_join_requests_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "churches_public"
            referencedColumns: ["id"]
          },
        ]
      }
      documentation_flow_steps: {
        Row: {
          created_at: string | null
          expected_result: string | null
          flow_id: string
          id: string
          step_description: string | null
          step_number: number
          step_title: string
          system_action: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expected_result?: string | null
          flow_id: string
          id?: string
          step_description?: string | null
          step_number?: number
          step_title: string
          system_action?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expected_result?: string | null
          flow_id?: string
          id?: string
          step_description?: string | null
          step_number?: number
          step_title?: string
          system_action?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documentation_flow_steps_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "documentation_user_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      documentation_modules: {
        Row: {
          access_roles: string[] | null
          content_json: Json | null
          created_at: string | null
          description: string | null
          id: string
          last_updated_at: string | null
          module_key: string
          module_name: string
          parent_module: string | null
          slug: string | null
          status: string | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          access_roles?: string[] | null
          content_json?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          last_updated_at?: string | null
          module_key: string
          module_name: string
          parent_module?: string | null
          slug?: string | null
          status?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          access_roles?: string[] | null
          content_json?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          last_updated_at?: string | null
          module_key?: string
          module_name?: string
          parent_module?: string | null
          slug?: string | null
          status?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      documentation_notes: {
        Row: {
          created_at: string | null
          documentation_module_id: string
          id: string
          note_body: string | null
          note_title: string
          note_type: string | null
          updated_by: string | null
          version_tag: string | null
        }
        Insert: {
          created_at?: string | null
          documentation_module_id: string
          id?: string
          note_body?: string | null
          note_title: string
          note_type?: string | null
          updated_by?: string | null
          version_tag?: string | null
        }
        Update: {
          created_at?: string | null
          documentation_module_id?: string
          id?: string
          note_body?: string | null
          note_title?: string
          note_type?: string | null
          updated_by?: string | null
          version_tag?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documentation_notes_documentation_module_id_fkey"
            columns: ["documentation_module_id"]
            isOneToOne: false
            referencedRelation: "documentation_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      documentation_screenshots: {
        Row: {
          caption: string | null
          created_at: string | null
          documentation_module_id: string
          id: string
          image_url: string
          sort_order: number | null
          title: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          documentation_module_id: string
          id?: string
          image_url: string
          sort_order?: number | null
          title: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          documentation_module_id?: string
          id?: string
          image_url?: string
          sort_order?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentation_screenshots_documentation_module_id_fkey"
            columns: ["documentation_module_id"]
            isOneToOne: false
            referencedRelation: "documentation_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      documentation_update_modules: {
        Row: {
          created_at: string
          documentation_update_id: string
          id: string
          module_id: string
        }
        Insert: {
          created_at?: string
          documentation_update_id: string
          id?: string
          module_id: string
        }
        Update: {
          created_at?: string
          documentation_update_id?: string
          id?: string
          module_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentation_update_modules_documentation_update_id_fkey"
            columns: ["documentation_update_id"]
            isOneToOne: false
            referencedRelation: "documentation_updates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentation_update_modules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "documentation_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      documentation_update_notes: {
        Row: {
          author: string | null
          created_at: string
          documentation_update_id: string
          id: string
          note_body: string | null
          note_title: string
        }
        Insert: {
          author?: string | null
          created_at?: string
          documentation_update_id: string
          id?: string
          note_body?: string | null
          note_title: string
        }
        Update: {
          author?: string | null
          created_at?: string
          documentation_update_id?: string
          id?: string
          note_body?: string | null
          note_title?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentation_update_notes_documentation_update_id_fkey"
            columns: ["documentation_update_id"]
            isOneToOne: false
            referencedRelation: "documentation_updates"
            referencedColumns: ["id"]
          },
        ]
      }
      documentation_updates: {
        Row: {
          affected_roles: string[] | null
          change_type: string
          created_at: string
          created_by: string | null
          detailed_description: string | null
          flow_types: string[] | null
          id: string
          module_keys: string[] | null
          source_reference: string | null
          status: string
          submodule_keys: string[] | null
          summary: string | null
          title: string
          update_id: string
          updated_at: string
          version_tag: string | null
        }
        Insert: {
          affected_roles?: string[] | null
          change_type?: string
          created_at?: string
          created_by?: string | null
          detailed_description?: string | null
          flow_types?: string[] | null
          id?: string
          module_keys?: string[] | null
          source_reference?: string | null
          status?: string
          submodule_keys?: string[] | null
          summary?: string | null
          title: string
          update_id?: string
          updated_at?: string
          version_tag?: string | null
        }
        Update: {
          affected_roles?: string[] | null
          change_type?: string
          created_at?: string
          created_by?: string | null
          detailed_description?: string | null
          flow_types?: string[] | null
          id?: string
          module_keys?: string[] | null
          source_reference?: string | null
          status?: string
          submodule_keys?: string[] | null
          summary?: string | null
          title?: string
          update_id?: string
          updated_at?: string
          version_tag?: string | null
        }
        Relationships: []
      }
      documentation_user_flows: {
        Row: {
          created_at: string | null
          flow_name: string
          flow_type: string
          id: string
          module_id: string
          role_type: string
          steps_json: Json | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          created_at?: string | null
          flow_name: string
          flow_type?: string
          id?: string
          module_id: string
          role_type?: string
          steps_json?: Json | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          created_at?: string | null
          flow_name?: string
          flow_type?: string
          id?: string
          module_id?: string
          role_type?: string
          steps_json?: Json | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documentation_user_flows_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "documentation_modules"
            referencedColumns: ["id"]
          },
        ]
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
          hidden_at: string | null
          id: string
          note_text: string
        }
        Insert: {
          created_at?: string
          created_by: string
          family_group_id: string
          hidden_at?: string | null
          id?: string
          note_text: string
        }
        Update: {
          created_at?: string
          created_by?: string
          family_group_id?: string
          hidden_at?: string | null
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
          hidden_at: string | null
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
          hidden_at?: string | null
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
          hidden_at?: string | null
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
          hidden_at: string | null
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
          hidden_at?: string | null
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
          hidden_at?: string | null
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
      global_prayer_requests: {
        Row: {
          allow_public_ripple_view: boolean
          anonymous: boolean
          answered_at: string | null
          category: string
          country: string | null
          created_at: string
          created_by: string
          description: string
          hidden_at: string | null
          id: string
          origin_country_code: string | null
          origin_country_name: string | null
          prayer_count: number
          short_code: string | null
          show_country: boolean
          slug: string | null
          status: string
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          allow_public_ripple_view?: boolean
          anonymous?: boolean
          answered_at?: string | null
          category?: string
          country?: string | null
          created_at?: string
          created_by: string
          description: string
          hidden_at?: string | null
          id?: string
          origin_country_code?: string | null
          origin_country_name?: string | null
          prayer_count?: number
          short_code?: string | null
          show_country?: boolean
          slug?: string | null
          status?: string
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          allow_public_ripple_view?: boolean
          anonymous?: boolean
          answered_at?: string | null
          category?: string
          country?: string | null
          created_at?: string
          created_by?: string
          description?: string
          hidden_at?: string | null
          id?: string
          origin_country_code?: string | null
          origin_country_name?: string | null
          prayer_count?: number
          short_code?: string | null
          show_country?: boolean
          slug?: string | null
          status?: string
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: []
      }
      go_live_plan_notes: {
        Row: {
          author: string | null
          created_at: string
          created_by: string | null
          id: string
          note_body: string | null
          note_title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          note_body?: string | null
          note_title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          note_body?: string | null
          note_title?: string
          updated_at?: string
        }
        Relationships: []
      }
      moderation_queue: {
        Row: {
          admin_notes: string | null
          confidence_score: number | null
          content_id: string
          content_preview: string | null
          content_type: string
          created_at: string
          id: string
          metadata_json: Json | null
          moderation_source: string
          reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          source_id: string | null
          source_type: string
          status: string
          submitted_by: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          confidence_score?: number | null
          content_id: string
          content_preview?: string | null
          content_type: string
          created_at?: string
          id?: string
          metadata_json?: Json | null
          moderation_source?: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_id?: string | null
          source_type?: string
          status?: string
          submitted_by?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          confidence_score?: number | null
          content_id?: string
          content_preview?: string | null
          content_type?: string
          created_at?: string
          id?: string
          metadata_json?: Json | null
          moderation_source?: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_id?: string | null
          source_type?: string
          status?: string
          submitted_by?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      module_change_history: {
        Row: {
          change_summary: string | null
          created_at: string
          documentation_update_id: string
          id: string
          module_id: string
        }
        Insert: {
          change_summary?: string | null
          created_at?: string
          documentation_update_id: string
          id?: string
          module_id: string
        }
        Update: {
          change_summary?: string | null
          created_at?: string
          documentation_update_id?: string
          id?: string
          module_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_change_history_documentation_update_id_fkey"
            columns: ["documentation_update_id"]
            isOneToOne: false
            referencedRelation: "documentation_updates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_change_history_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "documentation_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_actions: {
        Row: {
          action_type: string
          created_at: string
          id: string
          metadata_json: Json | null
          prayer_country_code: string | null
          prayer_country_name: string | null
          prayer_id: string
          source_type: string
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          metadata_json?: Json | null
          prayer_country_code?: string | null
          prayer_country_name?: string | null
          prayer_id: string
          source_type?: string
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          metadata_json?: Json | null
          prayer_country_code?: string | null
          prayer_country_name?: string | null
          prayer_id?: string
          source_type?: string
          user_id?: string
        }
        Relationships: []
      }
      prayer_assignments: {
        Row: {
          assigned_at: string
          assigned_user_id: string
          completed_at: string | null
          id: string
          prayer_id: string
          source_type: string
          status: string
        }
        Insert: {
          assigned_at?: string
          assigned_user_id: string
          completed_at?: string | null
          id?: string
          prayer_id: string
          source_type?: string
          status?: string
        }
        Update: {
          assigned_at?: string
          assigned_user_id?: string
          completed_at?: string | null
          id?: string
          prayer_id?: string
          source_type?: string
          status?: string
        }
        Relationships: []
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
      prayer_coverage: {
        Row: {
          current_prayers: number
          id: string
          last_prayed_at: string | null
          passed_forward_count: number
          prayer_id: string
          source_type: string
          target_prayers: number
          unique_people_prayed: number
          updated_at: string
        }
        Insert: {
          current_prayers?: number
          id?: string
          last_prayed_at?: string | null
          passed_forward_count?: number
          prayer_id: string
          source_type?: string
          target_prayers?: number
          unique_people_prayed?: number
          updated_at?: string
        }
        Update: {
          current_prayers?: number
          id?: string
          last_prayed_at?: string | null
          passed_forward_count?: number
          prayer_id?: string
          source_type?: string
          target_prayers?: number
          unique_people_prayed?: number
          updated_at?: string
        }
        Relationships: []
      }
      prayer_invites: {
        Row: {
          click_count: number
          created_at: string
          id: string
          invite_code: string
          inviter_user_id: string
          message: string | null
          prayer_id: string
          signup_count: number
        }
        Insert: {
          click_count?: number
          created_at?: string
          id?: string
          invite_code: string
          inviter_user_id: string
          message?: string | null
          prayer_id: string
          signup_count?: number
        }
        Update: {
          click_count?: number
          created_at?: string
          id?: string
          invite_code?: string
          inviter_user_id?: string
          message?: string | null
          prayer_id?: string
          signup_count?: number
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
      prayer_ripple_locations: {
        Row: {
          approximate_lat: number
          approximate_lng: number
          city: string | null
          country: string | null
          created_at: string
          id: string
          prayer_request_id: string
          region: string | null
          source: string
          source_type: string
          user_id: string | null
        }
        Insert: {
          approximate_lat: number
          approximate_lng: number
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          prayer_request_id: string
          region?: string | null
          source?: string
          source_type?: string
          user_id?: string | null
        }
        Update: {
          approximate_lat?: number
          approximate_lng?: number
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          prayer_request_id?: string
          region?: string | null
          source?: string
          source_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      prayer_translations: {
        Row: {
          created_at: string
          id: string
          prayer_request_id: string
          provider: string | null
          source_language_code: string | null
          source_type: string
          target_language_code: string
          translated_body: string | null
          translated_title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          prayer_request_id: string
          provider?: string | null
          source_language_code?: string | null
          source_type?: string
          target_language_code: string
          translated_body?: string | null
          translated_title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          prayer_request_id?: string
          provider?: string | null
          source_language_code?: string | null
          source_type?: string
          target_language_code?: string
          translated_body?: string | null
          translated_title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      prayer_updates: {
        Row: {
          author_user_id: string
          created_at: string
          id: string
          message: string
          prayer_request_id: string
          source_type: string
        }
        Insert: {
          author_user_id: string
          created_at?: string
          id?: string
          message: string
          prayer_request_id: string
          source_type?: string
        }
        Update: {
          author_user_id?: string
          created_at?: string
          id?: string
          message?: string
          prayer_request_id?: string
          source_type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          commitment_level: string
          country_code: string | null
          country_name: string | null
          created_at: string
          display_name: string | null
          exclude_from_analytics: boolean
          id: string
          internal_only: boolean
          is_test_account: boolean
          last_login_at: string | null
          last_login_country_code: string | null
          last_login_country_name: string | null
          preferred_language_code: string | null
          preferred_language_name: string | null
          state: string | null
          test_role_label: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          commitment_level?: string
          country_code?: string | null
          country_name?: string | null
          created_at?: string
          display_name?: string | null
          exclude_from_analytics?: boolean
          id: string
          internal_only?: boolean
          is_test_account?: boolean
          last_login_at?: string | null
          last_login_country_code?: string | null
          last_login_country_name?: string | null
          preferred_language_code?: string | null
          preferred_language_name?: string | null
          state?: string | null
          test_role_label?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          commitment_level?: string
          country_code?: string | null
          country_name?: string | null
          created_at?: string
          display_name?: string | null
          exclude_from_analytics?: boolean
          id?: string
          internal_only?: boolean
          is_test_account?: boolean
          last_login_at?: string | null
          last_login_country_code?: string | null
          last_login_country_name?: string | null
          preferred_language_code?: string | null
          preferred_language_name?: string | null
          state?: string | null
          test_role_label?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      test_case_update_links: {
        Row: {
          created_at: string
          documentation_update_id: string
          id: string
          link_type: string
          test_case_id: string
        }
        Insert: {
          created_at?: string
          documentation_update_id: string
          id?: string
          link_type?: string
          test_case_id: string
        }
        Update: {
          created_at?: string
          documentation_update_id?: string
          id?: string
          link_type?: string
          test_case_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_case_update_links_documentation_update_id_fkey"
            columns: ["documentation_update_id"]
            isOneToOne: false
            referencedRelation: "documentation_updates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_case_update_links_test_case_id_fkey"
            columns: ["test_case_id"]
            isOneToOne: false
            referencedRelation: "test_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      test_cases: {
        Row: {
          actual_result: string | null
          archived: boolean
          created_at: string | null
          description: string | null
          expected_result: string | null
          feature_name: string
          id: string
          module_id: string
          preconditions: string | null
          priority: string | null
          role_tested: string | null
          severity: string | null
          status: string | null
          steps_json: Json | null
          test_data: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_result?: string | null
          archived?: boolean
          created_at?: string | null
          description?: string | null
          expected_result?: string | null
          feature_name: string
          id?: string
          module_id: string
          preconditions?: string | null
          priority?: string | null
          role_tested?: string | null
          severity?: string | null
          status?: string | null
          steps_json?: Json | null
          test_data?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_result?: string | null
          archived?: boolean
          created_at?: string | null
          description?: string | null
          expected_result?: string | null
          feature_name?: string
          id?: string
          module_id?: string
          preconditions?: string | null
          priority?: string | null
          role_tested?: string | null
          severity?: string | null
          status?: string | null
          steps_json?: Json | null
          test_data?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_cases_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "test_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      test_modules: {
        Row: {
          created_at: string | null
          id: string
          module_key: string
          module_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          module_key: string
          module_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          module_key?: string
          module_name?: string
          updated_at?: string | null
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      churches_public: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          denomination: string | null
          id: string | null
          logo_url: string | null
          name: string | null
          privacy: string | null
          slug: string | null
          state: string | null
          status: string | null
          verified: boolean | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          denomination?: string | null
          id?: string | null
          logo_url?: string | null
          name?: string | null
          privacy?: string | null
          slug?: string | null
          state?: string | null
          status?: string | null
          verified?: boolean | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          denomination?: string | null
          id?: string | null
          logo_url?: string | null
          name?: string | null
          privacy?: string | null
          slug?: string | null
          state?: string | null
          status?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      global_prayers_public: {
        Row: {
          anonymous: boolean | null
          category: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string | null
          prayer_count: number | null
          show_country: boolean | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      unified_prayer_feed: {
        Row: {
          anonymous: boolean | null
          category: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          last_prayed_at: string | null
          prayer_count: number | null
          prayer_id: string | null
          show_country: boolean | null
          source_id: string | null
          source_type: string | null
          status: string | null
          target_prayers: number | null
          title: string | null
          unique_people_prayed: number | null
          updated_at: string | null
          visibility: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      apply_moderation_decision: {
        Args: { _new_status: string; _notes?: string; _queue_id: string }
        Returns: undefined
      }
      auto_archive_stale_prayers: { Args: never; Returns: number }
      generate_prayer_short_code: { Args: never; Returns: string }
      generate_prayer_slug: { Args: { _title: string }; Returns: string }
      get_church_role: {
        Args: { _church_id: string; _user_id: string }
        Returns: string
      }
      get_global_reach_analytics: { Args: { _days?: number }; Returns: Json }
      get_invite_by_code: { Args: { _invite_code: string }; Returns: Json }
      get_prayer_by_slug: { Args: { _slug: string }; Returns: Json }
      get_prayer_geography: {
        Args: { _prayer_id: string; _source_type?: string }
        Returns: Json
      }
      get_public_ripple_by_slug: { Args: { _slug: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_invite_click: {
        Args: { _invite_id: string }
        Returns: undefined
      }
      is_church_member: {
        Args: { _church_id: string; _user_id: string }
        Returns: boolean
      }
      is_community_admin: {
        Args: { _community_id: string; _user_id: string }
        Returns: boolean
      }
      is_community_wall_public: {
        Args: { _church_id: string }
        Returns: boolean
      }
      is_family_member: {
        Args: { _family_group_id: string; _user_id: string }
        Returns: boolean
      }
      join_family_by_invite: { Args: { _invite_code: string }; Returns: string }
      log_public_event: {
        Args: {
          _entity_id?: string
          _entity_type?: string
          _event_type: string
          _metadata?: Json
        }
        Returns: undefined
      }
      record_prayer_action: {
        Args: {
          _action_type: string
          _metadata?: Json
          _prayer_id: string
          _source_type: string
          _user_id: string
        }
        Returns: undefined
      }
      request_to_join_community: {
        Args: { _community_id: string; _message?: string }
        Returns: string
      }
      review_community_join_request: {
        Args: { _decision: string; _note?: string; _request_id: string }
        Returns: undefined
      }
      slugify_text: { Args: { _input: string }; Returns: string }
      submit_content_report: {
        Args: {
          _details?: string
          _entity_id: string
          _entity_type: string
          _reason: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
