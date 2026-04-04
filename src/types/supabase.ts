// This file contains the Supabase Database type helper.
// For production, replace with auto-generated types via:
//   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
        };
      };
      users: {
        Row: {
          id: string;
          role_id: string | null;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          is_active: boolean;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role_id?: string | null;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          is_active?: boolean;
          avatar_url?: string | null;
        };
        Update: {
          role_id?: string | null;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          is_active?: boolean;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      owners: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          email: string | null;
          alternate_contact: string | null;
          billing_notes: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          full_name: string;
          phone?: string | null;
          email?: string | null;
          alternate_contact?: string | null;
          billing_notes?: string | null;
          created_by?: string | null;
        };
        Update: {
          full_name?: string;
          phone?: string | null;
          email?: string | null;
          alternate_contact?: string | null;
          billing_notes?: string | null;
          updated_at?: string;
        };
      };
      boats: {
        Row: {
          id: string;
          name: string;
          registration_number: string;
          type: string | null;
          color: string | null;
          length_meters: number | null;
          notes: string | null;
          status: "available" | "parked" | "maintenance";
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          registration_number: string;
          type?: string | null;
          color?: string | null;
          length_meters?: number | null;
          notes?: string | null;
          status?: "available" | "parked" | "maintenance";
          created_by?: string | null;
        };
        Update: {
          name?: string;
          registration_number?: string;
          type?: string | null;
          color?: string | null;
          length_meters?: number | null;
          notes?: string | null;
          status?: "available" | "parked" | "maintenance";
          updated_at?: string;
        };
      };
      parking_spots: {
        Row: {
          id: string;
          spot_number: string;
          coordinates: Json | null;
          description: string | null;
          max_length_meters: number | null;
          status: "empty" | "occupied" | "maintenance" | "reserved";
          pier_section: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          spot_number: string;
          coordinates?: Json | null;
          description?: string | null;
          max_length_meters?: number | null;
          status?: "empty" | "occupied" | "maintenance" | "reserved";
          pier_section?: string | null;
        };
        Update: {
          spot_number?: string;
          coordinates?: Json | null;
          description?: string | null;
          max_length_meters?: number | null;
          status?: "empty" | "occupied" | "maintenance" | "reserved";
          pier_section?: string | null;
          updated_at?: string;
        };
      };
      parking_sessions: {
        Row: {
          id: string;
          boat_id: string;
          parking_spot_id: string;
          start_date: string;
          expected_end_date: string;
          actual_exit_date: string | null;
          status: "active" | "ending_soon" | "overdue" | "closed";
          pricing_model: "daily" | "weekly" | "monthly" | "custom";
          base_fee: number;
          total_due: number;
          total_paid: number;
          remaining_balance: number;
          last_payment_date: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          closed_by: string | null;
        };
        Insert: {
          id?: string;
          boat_id: string;
          parking_spot_id: string;
          start_date: string;
          expected_end_date: string;
          actual_exit_date?: string | null;
          status?: "active" | "ending_soon" | "overdue" | "closed";
          pricing_model?: "daily" | "weekly" | "monthly" | "custom";
          base_fee?: number;
          total_due?: number;
          notes?: string | null;
          created_by?: string | null;
        };
        Update: {
          expected_end_date?: string;
          actual_exit_date?: string | null;
          status?: "active" | "ending_soon" | "overdue" | "closed";
          pricing_model?: "daily" | "weekly" | "monthly" | "custom";
          base_fee?: number;
          total_due?: number;
          notes?: string | null;
          updated_at?: string;
          closed_by?: string | null;
        };
      };
      payments: {
        Row: {
          id: string;
          session_id: string;
          amount: number;
          payment_date: string;
          payment_method: string | null;
          reference_number: string | null;
          adjustment_reason: string | null;
          is_adjustment: boolean;
          notes: string | null;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          amount: number;
          payment_date?: string;
          payment_method?: string | null;
          reference_number?: string | null;
          adjustment_reason?: string | null;
          is_adjustment?: boolean;
          notes?: string | null;
          created_by?: string | null;
        };
        Update: {
          amount?: number;
          payment_date?: string;
          payment_method?: string | null;
          reference_number?: string | null;
          adjustment_reason?: string | null;
          notes?: string | null;
        };
      };
      reminders: {
        Row: {
          id: string;
          session_id: string;
          rule_id: string | null;
          reminder_type: string;
          recipient_type: "customer" | "staff";
          recipient_email: string | null;
          scheduled_date: string;
          sent_at: string | null;
          status: "pending" | "sent" | "failed" | "skipped" | "cancelled";
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          rule_id?: string | null;
          reminder_type: string;
          recipient_type: "customer" | "staff";
          recipient_email?: string | null;
          scheduled_date: string;
          sent_at?: string | null;
          status?: "pending" | "sent" | "failed" | "skipped" | "cancelled";
          error_message?: string | null;
        };
        Update: {
          status?: "pending" | "sent" | "failed" | "skipped" | "cancelled";
          sent_at?: string | null;
          error_message?: string | null;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          table_name: string | null;
          record_id: string | null;
          old_values: Json | null;
          new_values: Json | null;
          description: string | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          table_name?: string | null;
          record_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          description?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Update: Record<string, never>;
      };
    };
    Views: {
      active_sessions_view: {
        Row: {
          session_id: string;
          start_date: string;
          expected_end_date: string;
          actual_exit_date: string | null;
          status: "active" | "ending_soon" | "overdue" | "closed";
          pricing_model: "daily" | "weekly" | "monthly" | "custom";
          base_fee: number;
          total_due: number;
          total_paid: number;
          remaining_balance: number;
          last_payment_date: string | null;
          session_notes: string | null;
          boat_id: string;
          boat_name: string;
          registration_number: string;
          boat_type: string | null;
          boat_color: string | null;
          length_meters: number | null;
          spot_id: string;
          spot_number: string;
          pier_section: string | null;
          coordinates: Json | null;
          owner_id: string | null;
          owner_name: string | null;
          owner_phone: string | null;
          owner_email: string | null;
          days_overdue: number;
          days_remaining: number;
        };
      };
      dashboard_stats: {
        Row: {
          total_spots: number;
          occupied_spots: number;
          empty_spots: number;
          ending_soon: number;
          overdue_count: number;
          total_unpaid: number;
          reminders_today: number;
          collected_this_month: number;
        };
      };
    };
    Functions: {
      refresh_session_statuses: {
        Args: Record<string, never>;
        Returns: void;
      };
      generate_reminders_for_session: {
        Args: { p_session_id: string };
        Returns: void;
      };
      get_current_user_role: {
        Args: Record<string, never>;
        Returns: string;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_staff_or_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
  };
}
