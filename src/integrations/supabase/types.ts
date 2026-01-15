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
      attention_signals: {
        Row: {
          created_at: string
          id: string
          is_private: boolean
          level: Database["public"]["Enums"]["attention_level"]
          related_entity_id: string | null
          related_entity_type: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          signal_type: string
          trigger_count: number
          trigger_threshold: number
          triggered_by: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_private?: boolean
          level?: Database["public"]["Enums"]["attention_level"]
          related_entity_id?: string | null
          related_entity_type?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          signal_type: string
          trigger_count?: number
          trigger_threshold?: number
          triggered_by?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_private?: boolean
          level?: Database["public"]["Enums"]["attention_level"]
          related_entity_id?: string | null
          related_entity_type?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          signal_type?: string
          trigger_count?: number
          trigger_threshold?: number
          triggered_by?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      complaints: {
        Row: {
          assigned_to: string | null
          attachment_url: string | null
          category: string
          created_at: string
          description: string
          escalated: boolean | null
          escalated_at: string | null
          id: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          attachment_url?: string | null
          category: string
          created_at?: string
          description: string
          escalated?: boolean | null
          escalated_at?: string | null
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          attachment_url?: string | null
          category?: string
          created_at?: string
          description?: string
          escalated?: boolean | null
          escalated_at?: string | null
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          head_id: string | null
          id: string
          is_active: boolean
          name: string
          parent_department_id: string | null
          region: string | null
          skill_focus: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          head_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_department_id?: string | null
          region?: string | null
          skill_focus?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          head_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_department_id?: string | null
          region?: string | null
          skill_focus?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_parent_department_id_fkey"
            columns: ["parent_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      external_accounts: {
        Row: {
          created_at: string
          external_username: string
          id: string
          platform_name: string
          profile_link: string | null
          status: string
          updated_at: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          external_username: string
          id?: string
          platform_name: string
          profile_link?: string | null
          status?: string
          updated_at?: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          external_username?: string
          id?: string
          platform_name?: string
          profile_link?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      financial_narratives: {
        Row: {
          adjustment_notes: string | null
          created_at: string
          created_by: string
          financial_period_id: string | null
          id: string
          negative_drivers: string[] | null
          next_period_outlook: string | null
          period_summary: string
          primary_drivers: string[]
          updated_at: string
          workforce_impact: string | null
        }
        Insert: {
          adjustment_notes?: string | null
          created_at?: string
          created_by: string
          financial_period_id?: string | null
          id?: string
          negative_drivers?: string[] | null
          next_period_outlook?: string | null
          period_summary: string
          primary_drivers?: string[]
          updated_at?: string
          workforce_impact?: string | null
        }
        Update: {
          adjustment_notes?: string | null
          created_at?: string
          created_by?: string
          financial_period_id?: string | null
          id?: string
          negative_drivers?: string[] | null
          next_period_outlook?: string | null
          period_summary?: string
          primary_drivers?: string[]
          updated_at?: string
          workforce_impact?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_narratives_financial_period_id_fkey"
            columns: ["financial_period_id"]
            isOneToOne: false
            referencedRelation: "mpcn_financials"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_returns: {
        Row: {
          created_at: string
          financial_period_id: string | null
          id: string
          investment_id: string
          notes: string | null
          profit_date: string
          return_amount: number
          user_id: string
        }
        Insert: {
          created_at?: string
          financial_period_id?: string | null
          id?: string
          investment_id: string
          notes?: string | null
          profit_date: string
          return_amount?: number
          user_id: string
        }
        Update: {
          created_at?: string
          financial_period_id?: string | null
          id?: string
          investment_id?: string
          notes?: string | null
          profit_date?: string
          return_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_returns_financial_period_id_fkey"
            columns: ["financial_period_id"]
            isOneToOne: false
            referencedRelation: "mpcn_financials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_returns_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
        ]
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
          percentage_of_pool: number | null
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
          percentage_of_pool?: number | null
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
          percentage_of_pool?: number | null
          platform?: string
          purchase_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      leadership_signals: {
        Row: {
          calculated_at: string
          created_at: string
          id: string
          notes: string | null
          period_end: string
          period_start: string
          role: string
          signal_type: string
          signal_value: number
          user_id: string
        }
        Insert: {
          calculated_at?: string
          created_at?: string
          id?: string
          notes?: string | null
          period_end: string
          period_start: string
          role: string
          signal_type: string
          signal_value?: number
          user_id: string
        }
        Update: {
          calculated_at?: string
          created_at?: string
          id?: string
          notes?: string | null
          period_end?: string
          period_start?: string
          role?: string
          signal_type?: string
          signal_value?: number
          user_id?: string
        }
        Relationships: []
      }
      learning_insights: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          generated_by: string
          id: string
          resolution_status: string
          skill_signal: string | null
          suggestions: string[] | null
          user_id: string
          what_to_improve: string | null
          what_went_well: string | null
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          generated_by: string
          id?: string
          resolution_status: string
          skill_signal?: string | null
          suggestions?: string[] | null
          user_id: string
          what_to_improve?: string | null
          what_went_well?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          generated_by?: string
          id?: string
          resolution_status?: string
          skill_signal?: string | null
          suggestions?: string[] | null
          user_id?: string
          what_to_improve?: string | null
          what_went_well?: string | null
        }
        Relationships: []
      }
      mpcn_financials: {
        Row: {
          corrected_at: string | null
          corrected_by: string | null
          correction_reason: string | null
          created_at: string
          created_by: string
          disclosure_notes: string | null
          finalized_at: string | null
          finalized_by: string | null
          id: string
          notes: string | null
          original_total_pool: number | null
          original_total_profit: number | null
          profit_date: string
          status: Database["public"]["Enums"]["financial_period_status"]
          total_pool: number
          total_profit: number
          updated_at: string
        }
        Insert: {
          corrected_at?: string | null
          corrected_by?: string | null
          correction_reason?: string | null
          created_at?: string
          created_by: string
          disclosure_notes?: string | null
          finalized_at?: string | null
          finalized_by?: string | null
          id?: string
          notes?: string | null
          original_total_pool?: number | null
          original_total_profit?: number | null
          profit_date: string
          status?: Database["public"]["Enums"]["financial_period_status"]
          total_pool?: number
          total_profit?: number
          updated_at?: string
        }
        Update: {
          corrected_at?: string | null
          corrected_by?: string | null
          correction_reason?: string | null
          created_at?: string
          created_by?: string
          disclosure_notes?: string | null
          finalized_at?: string | null
          finalized_by?: string | null
          id?: string
          notes?: string | null
          original_total_pool?: number | null
          original_total_profit?: number | null
          profit_date?: string
          status?: Database["public"]["Enums"]["financial_period_status"]
          total_pool?: number
          total_profit?: number
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
      platform_settings: {
        Row: {
          base_rate: number
          color: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          base_rate?: number
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          base_rate?: number
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string
          currency_preference: string | null
          dispute_sla_tier: string | null
          external_accounts: Json | null
          full_name: string | null
          id: string
          initial_investment: number | null
          is_investor: boolean | null
          jurisdiction: string | null
          language_preference: string | null
          phone_number: string | null
          referral_code: string | null
          referred_by: string | null
          skills: string[] | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          currency_preference?: string | null
          dispute_sla_tier?: string | null
          external_accounts?: Json | null
          full_name?: string | null
          id: string
          initial_investment?: number | null
          is_investor?: boolean | null
          jurisdiction?: string | null
          language_preference?: string | null
          phone_number?: string | null
          referral_code?: string | null
          referred_by?: string | null
          skills?: string[] | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          currency_preference?: string | null
          dispute_sla_tier?: string | null
          external_accounts?: Json | null
          full_name?: string | null
          id?: string
          initial_investment?: number | null
          is_investor?: boolean | null
          jurisdiction?: string | null
          language_preference?: string | null
          phone_number?: string | null
          referral_code?: string | null
          referred_by?: string | null
          skills?: string[] | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          referred_id: string
          referrer_id: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referred_id: string
          referrer_id: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referred_id?: string
          referrer_id?: string
          status?: string
        }
        Relationships: []
      }
      report_history: {
        Row: {
          action: string
          comment: string | null
          created_at: string
          id: string
          new_status: string | null
          performed_by: string
          previous_status: string | null
          report_id: string
        }
        Insert: {
          action: string
          comment?: string | null
          created_at?: string
          id?: string
          new_status?: string | null
          performed_by: string
          previous_status?: string | null
          report_id: string
        }
        Update: {
          action?: string
          comment?: string | null
          created_at?: string
          id?: string
          new_status?: string | null
          performed_by?: string
          previous_status?: string | null
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_history_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "work_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      resolution_requests: {
        Row: {
          against_user_id: string | null
          assigned_at: string | null
          assigned_to: string | null
          category: string
          created_at: string
          description: string
          escalated_at: string | null
          escalated_to: string | null
          escalation_reason: string | null
          evidence_url: string | null
          id: string
          is_confidential: boolean
          mediation_notes: string | null
          mediation_started_at: string | null
          mediator_id: string | null
          priority: string
          raised_by: string
          related_entity_id: string | null
          related_entity_type: string | null
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          sla_breached: boolean | null
          sla_due_at: string | null
          status: Database["public"]["Enums"]["resolution_status"]
          title: string
          updated_at: string
        }
        Insert: {
          against_user_id?: string | null
          assigned_at?: string | null
          assigned_to?: string | null
          category: string
          created_at?: string
          description: string
          escalated_at?: string | null
          escalated_to?: string | null
          escalation_reason?: string | null
          evidence_url?: string | null
          id?: string
          is_confidential?: boolean
          mediation_notes?: string | null
          mediation_started_at?: string | null
          mediator_id?: string | null
          priority?: string
          raised_by: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          sla_breached?: boolean | null
          sla_due_at?: string | null
          status?: Database["public"]["Enums"]["resolution_status"]
          title: string
          updated_at?: string
        }
        Update: {
          against_user_id?: string | null
          assigned_at?: string | null
          assigned_to?: string | null
          category?: string
          created_at?: string
          description?: string
          escalated_at?: string | null
          escalated_to?: string | null
          escalation_reason?: string | null
          evidence_url?: string | null
          id?: string
          is_confidential?: boolean
          mediation_notes?: string | null
          mediation_started_at?: string | null
          mediator_id?: string | null
          priority?: string
          raised_by?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          sla_breached?: boolean | null
          sla_due_at?: string | null
          status?: Database["public"]["Enums"]["resolution_status"]
          title?: string
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
      system_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      task_contributions: {
        Row: {
          contribution_notes: string | null
          contribution_weight: number
          created_at: string
          id: string
          task_id: string | null
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          contribution_notes?: string | null
          contribution_weight?: number
          created_at?: string
          id?: string
          task_id?: string | null
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          contribution_notes?: string | null
          contribution_weight?: number
          created_at?: string
          id?: string
          task_id?: string | null
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_contributions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          admin_rejection_reason: string | null
          admin_reviewed_at: string | null
          admin_reviewed_by: string | null
          admin_status: string | null
          assigned_by: string | null
          base_rate: number
          bonuses: number | null
          calculated_earnings: number | null
          collaborators: string[] | null
          created_at: string
          current_rate: number
          description: string | null
          due_date: string | null
          effort_band: string | null
          estimated_hours: number | null
          evidence_required: boolean | null
          evidence_url: string | null
          external_task_id: string | null
          failure_handling_policy: string | null
          feedback_notes: string | null
          final_status: string
          hours_worked: number
          id: string
          investment_contribution: number | null
          is_shared: boolean | null
          outcome_evaluation: string | null
          payment_logic_type: string | null
          platform: string
          progress_percent: number | null
          rating: number | null
          review_type: string | null
          revisions_count: number | null
          status: string
          success_criteria: string | null
          task_purpose: string | null
          task_type: Database["public"]["Enums"]["task_type"] | null
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
          assigned_by?: string | null
          base_rate?: number
          bonuses?: number | null
          calculated_earnings?: number | null
          collaborators?: string[] | null
          created_at?: string
          current_rate?: number
          description?: string | null
          due_date?: string | null
          effort_band?: string | null
          estimated_hours?: number | null
          evidence_required?: boolean | null
          evidence_url?: string | null
          external_task_id?: string | null
          failure_handling_policy?: string | null
          feedback_notes?: string | null
          final_status?: string
          hours_worked?: number
          id?: string
          investment_contribution?: number | null
          is_shared?: boolean | null
          outcome_evaluation?: string | null
          payment_logic_type?: string | null
          platform: string
          progress_percent?: number | null
          rating?: number | null
          review_type?: string | null
          revisions_count?: number | null
          status?: string
          success_criteria?: string | null
          task_purpose?: string | null
          task_type?: Database["public"]["Enums"]["task_type"] | null
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
          assigned_by?: string | null
          base_rate?: number
          bonuses?: number | null
          calculated_earnings?: number | null
          collaborators?: string[] | null
          created_at?: string
          current_rate?: number
          description?: string | null
          due_date?: string | null
          effort_band?: string | null
          estimated_hours?: number | null
          evidence_required?: boolean | null
          evidence_url?: string | null
          external_task_id?: string | null
          failure_handling_policy?: string | null
          feedback_notes?: string | null
          final_status?: string
          hours_worked?: number
          id?: string
          investment_contribution?: number | null
          is_shared?: boolean | null
          outcome_evaluation?: string | null
          payment_logic_type?: string | null
          platform?: string
          progress_percent?: number | null
          rating?: number | null
          review_type?: string | null
          revisions_count?: number | null
          status?: string
          success_criteria?: string | null
          task_purpose?: string | null
          task_type?: Database["public"]["Enums"]["task_type"] | null
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
      team_members: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          is_active: boolean | null
          role: string
          team_id: string
          transfer_reason: string | null
          transferred_at: string | null
          transferred_from_team: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          is_active?: boolean | null
          role?: string
          team_id: string
          transfer_reason?: string | null
          transferred_at?: string | null
          transferred_from_team?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          is_active?: boolean | null
          role?: string
          team_id?: string
          transfer_reason?: string | null
          transferred_at?: string | null
          transferred_from_team?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_transferred_from_team_fkey"
            columns: ["transferred_from_team"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          created_by: string
          department_id: string | null
          description: string | null
          id: string
          name: string
          region: string | null
          skill_focus: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          department_id?: string | null
          description?: string | null
          id?: string
          name: string
          region?: string | null
          skill_focus?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          department_id?: string | null
          description?: string | null
          id?: string
          name?: string
          region?: string | null
          skill_focus?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
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
          assigned_by: string | null
          base_rate: number | null
          bonuses: number | null
          collaborators: string[] | null
          created_at: string
          current_rate: number | null
          description: string | null
          due_date: string | null
          earnings: number
          estimated_hours: number | null
          evidence_required: boolean | null
          evidence_url: string | null
          external_task_id: string | null
          feedback_notes: string | null
          final_status: string | null
          hours_worked: number
          id: string
          investment_contribution: number | null
          platform: string
          progress_percent: number | null
          rating: number | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          revisions_count: number | null
          status: string
          task_type: Database["public"]["Enums"]["task_type"] | null
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
          assigned_by?: string | null
          base_rate?: number | null
          bonuses?: number | null
          collaborators?: string[] | null
          created_at?: string
          current_rate?: number | null
          description?: string | null
          due_date?: string | null
          earnings?: number
          estimated_hours?: number | null
          evidence_required?: boolean | null
          evidence_url?: string | null
          external_task_id?: string | null
          feedback_notes?: string | null
          final_status?: string | null
          hours_worked?: number
          id?: string
          investment_contribution?: number | null
          platform: string
          progress_percent?: number | null
          rating?: number | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          revisions_count?: number | null
          status?: string
          task_type?: Database["public"]["Enums"]["task_type"] | null
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
          assigned_by?: string | null
          base_rate?: number | null
          bonuses?: number | null
          collaborators?: string[] | null
          created_at?: string
          current_rate?: number | null
          description?: string | null
          due_date?: string | null
          earnings?: number
          estimated_hours?: number | null
          evidence_required?: boolean | null
          evidence_url?: string | null
          external_task_id?: string | null
          feedback_notes?: string | null
          final_status?: string | null
          hours_worked?: number
          id?: string
          investment_contribution?: number | null
          platform?: string
          progress_percent?: number | null
          rating?: number | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          revisions_count?: number | null
          status?: string
          task_type?: Database["public"]["Enums"]["task_type"] | null
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
      can_delete_user: {
        Args: { actor_id: string; target_id: string }
        Returns: boolean
      }
      can_modify_role: {
        Args: {
          actor_id: string
          new_role: Database["public"]["Enums"]["app_role"]
          target_current_role: Database["public"]["Enums"]["app_role"]
          target_id: string
        }
        Returns: boolean
      }
      can_override_role: {
        Args: {
          _target_role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      change_user_role_with_audit: {
        Args: {
          p_actor_id: string
          p_new_role: Database["public"]["Enums"]["app_role"]
          p_reason: string
          p_target_user_id: string
        }
        Returns: boolean
      }
      get_general_overseer_email: { Args: never; Returns: string }
      get_role_level: {
        Args: { role_name: Database["public"]["Enums"]["app_role"] }
        Returns: number
      }
      get_role_tier: {
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
      transfer_team_membership: {
        Args: {
          p_new_team_id: string
          p_transfer_reason: string
          p_transferred_by: string
          p_user_id: string
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
      attention_level: "informational" | "support_needed" | "review_required"
      financial_period_status: "draft" | "finalized" | "corrected"
      resolution_status:
        | "open"
        | "under_review"
        | "mediation"
        | "resolved"
        | "escalated"
      task_type:
        | "research"
        | "coding"
        | "design"
        | "support"
        | "writing"
        | "data_entry"
        | "quality_assurance"
        | "project_management"
        | "other"
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
      attention_level: ["informational", "support_needed", "review_required"],
      financial_period_status: ["draft", "finalized", "corrected"],
      resolution_status: [
        "open",
        "under_review",
        "mediation",
        "resolved",
        "escalated",
      ],
      task_type: [
        "research",
        "coding",
        "design",
        "support",
        "writing",
        "data_entry",
        "quality_assurance",
        "project_management",
        "other",
      ],
    },
  },
} as const
