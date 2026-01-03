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
      audit_logs: {
        Row: {
          action: string
          entity_id: string
          entity_type: string
          id: string
          new_values: Json | null
          notes: string | null
          performed_at: string
          performed_by: string
          previous_values: Json | null
        }
        Insert: {
          action: string
          entity_id: string
          entity_type: string
          id?: string
          new_values?: Json | null
          notes?: string | null
          performed_at?: string
          performed_by: string
          previous_values?: Json | null
        }
        Update: {
          action?: string
          entity_id?: string
          entity_type?: string
          id?: string
          new_values?: Json | null
          notes?: string | null
          performed_at?: string
          performed_by?: string
          previous_values?: Json | null
        }
        Relationships: []
      }
      investments: {
        Row: {
          created_at: string
          created_by: string
          current_value: number
          id: string
          initial_amount: number
          investment_type: string
          name: string
          notes: string | null
          platform: string
          purchase_date: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          current_value: number
          id?: string
          initial_amount: number
          investment_type: string
          name: string
          notes?: string | null
          platform: string
          purchase_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          current_value?: number
          id?: string
          initial_amount?: number
          investment_type?: string
          name?: string
          notes?: string | null
          platform?: string
          purchase_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      pending_role_approvals: {
        Row: {
          approval_token: string
          created_at: string
          expires_at: string
          id: string
          processed_at: string | null
          requested_role: Database["public"]["Enums"]["app_role"]
          requester_email: string
          requester_user_id: string
          status: string
          target_email: string
          target_user_id: string
        }
        Insert: {
          approval_token?: string
          created_at?: string
          expires_at?: string
          id?: string
          processed_at?: string | null
          requested_role?: Database["public"]["Enums"]["app_role"]
          requester_email: string
          requester_user_id: string
          status?: string
          target_email: string
          target_user_id: string
        }
        Update: {
          approval_token?: string
          created_at?: string
          expires_at?: string
          id?: string
          processed_at?: string | null
          requested_role?: Database["public"]["Enums"]["app_role"]
          requester_email?: string
          requester_user_id?: string
          status?: string
          target_email?: string
          target_user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          external_accounts: Json | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          external_accounts?: Json | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          external_accounts?: Json | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      salary_periods: {
        Row: {
          closed_at: string | null
          closed_by: string | null
          created_at: string
          created_by: string
          end_date: string
          id: string
          name: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          created_by: string
          end_date: string
          id?: string
          name: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          created_by?: string
          end_date?: string
          id?: string
          name?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          admin_rejection_reason: string | null
          admin_reviewed_at: string | null
          admin_reviewed_by: string | null
          admin_status: string | null
          base_rate: number
          calculated_earnings: number | null
          created_at: string
          current_rate: number
          description: string | null
          final_status: string
          hours_worked: number
          id: string
          platform: string
          status: string
          team_lead_rejection_reason: string | null
          team_lead_reviewed_at: string | null
          team_lead_reviewed_by: string | null
          team_lead_status: string | null
          title: string
          updated_at: string
          user_id: string
          work_date: string
        }
        Insert: {
          admin_rejection_reason?: string | null
          admin_reviewed_at?: string | null
          admin_reviewed_by?: string | null
          admin_status?: string | null
          base_rate?: number
          calculated_earnings?: number | null
          created_at?: string
          current_rate?: number
          description?: string | null
          final_status?: string
          hours_worked?: number
          id?: string
          platform: string
          status?: string
          team_lead_rejection_reason?: string | null
          team_lead_reviewed_at?: string | null
          team_lead_reviewed_by?: string | null
          team_lead_status?: string | null
          title: string
          updated_at?: string
          user_id: string
          work_date: string
        }
        Update: {
          admin_rejection_reason?: string | null
          admin_reviewed_at?: string | null
          admin_reviewed_by?: string | null
          admin_status?: string | null
          base_rate?: number
          calculated_earnings?: number | null
          created_at?: string
          current_rate?: number
          description?: string | null
          final_status?: string
          hours_worked?: number
          id?: string
          platform?: string
          status?: string
          team_lead_rejection_reason?: string | null
          team_lead_reviewed_at?: string | null
          team_lead_reviewed_by?: string | null
          team_lead_status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          work_date?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
      work_reports: {
        Row: {
          admin_override_reason: string | null
          admin_status: string | null
          base_rate: number | null
          created_at: string
          current_rate: number | null
          description: string | null
          earnings: number
          final_status: string | null
          hours_worked: number
          id: string
          platform: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          team_lead_rejection_reason: string | null
          team_lead_reviewed_at: string | null
          team_lead_reviewed_by: string | null
          team_lead_status: string | null
          updated_at: string
          user_id: string
          work_date: string
        }
        Insert: {
          admin_override_reason?: string | null
          admin_status?: string | null
          base_rate?: number | null
          created_at?: string
          current_rate?: number | null
          description?: string | null
          earnings?: number
          final_status?: string | null
          hours_worked?: number
          id?: string
          platform: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          team_lead_rejection_reason?: string | null
          team_lead_reviewed_at?: string | null
          team_lead_reviewed_by?: string | null
          team_lead_status?: string | null
          updated_at?: string
          user_id: string
          work_date: string
        }
        Update: {
          admin_override_reason?: string | null
          admin_status?: string | null
          base_rate?: number | null
          created_at?: string
          current_rate?: number | null
          description?: string | null
          earnings?: number
          final_status?: string | null
          hours_worked?: number
          id?: string
          platform?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          team_lead_rejection_reason?: string | null
          team_lead_reviewed_at?: string | null
          team_lead_reviewed_by?: string | null
          team_lead_status?: string | null
          updated_at?: string
          user_id?: string
          work_date?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_override_role: {
        Args: {
          _target_role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      get_general_overseer_email: { Args: never; Returns: string }
      get_role_level: {
        Args: { role_name: Database["public"]["Enums"]["app_role"] }
        Returns: number
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          p_action: string
          p_entity_id: string
          p_entity_type: string
          p_new_values?: Json
          p_notes?: string
          p_performed_by: string
          p_previous_values?: Json
        }
        Returns: string
      }
    }
    Enums: {
      app_role:
        | "employee"
        | "team_lead"
        | "report_admin"
        | "finance_hr_admin"
        | "investment_admin"
        | "user_admin"
        | "general_overseer"
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
      app_role: [
        "employee",
        "team_lead",
        "report_admin",
        "finance_hr_admin",
        "investment_admin",
        "user_admin",
        "general_overseer",
      ],
    },
  },
} as const
