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
      inventory_transfers: {
        Row: {
          branch_id: string
          category: string
          created_at: string
          from_location: string
          id: string
          inventory_item_name: string
          livestock_id: string | null
          purpose: string | null
          quantity: number
          status: string
          to_location: string
          transfer_date: string
          transferred_by: string | null
          unit: string
        }
        Insert: {
          branch_id: string
          category: string
          created_at?: string
          from_location: string
          id?: string
          inventory_item_name: string
          livestock_id?: string | null
          purpose?: string | null
          quantity: number
          status?: string
          to_location: string
          transfer_date?: string
          transferred_by?: string | null
          unit: string
        }
        Update: {
          branch_id?: string
          category?: string
          created_at?: string
          from_location?: string
          id?: string
          inventory_item_name?: string
          livestock_id?: string | null
          purpose?: string | null
          quantity?: number
          status?: string
          to_location?: string
          transfer_date?: string
          transferred_by?: string | null
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transfers_livestock_id_fkey"
            columns: ["livestock_id"]
            isOneToOne: false
            referencedRelation: "livestock"
            referencedColumns: ["id"]
          },
        ]
      }
      licenses: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          license_key: string | null
          plan_type: string
          purchased_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          is_active?: boolean
          license_key?: string | null
          plan_type?: string
          purchased_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          license_key?: string | null
          plan_type?: string
          purchased_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      livestock: {
        Row: {
          acquired_date: string | null
          acquired_from: string | null
          age_on_capture: string | null
          branch_id: string
          breed: string
          category_id: string
          color: string | null
          created_at: string
          date_of_birth: string | null
          gender: string
          health_status: string
          id: string
          name: string | null
          notes: string | null
          purchase_price: number | null
          shelter_id: string | null
          status: string
          tag_number: string
          updated_at: string
          weight: number | null
        }
        Insert: {
          acquired_date?: string | null
          acquired_from?: string | null
          age_on_capture?: string | null
          branch_id: string
          breed: string
          category_id: string
          color?: string | null
          created_at?: string
          date_of_birth?: string | null
          gender: string
          health_status?: string
          id?: string
          name?: string | null
          notes?: string | null
          purchase_price?: number | null
          shelter_id?: string | null
          status?: string
          tag_number: string
          updated_at?: string
          weight?: number | null
        }
        Update: {
          acquired_date?: string | null
          acquired_from?: string | null
          age_on_capture?: string | null
          branch_id?: string
          breed?: string
          category_id?: string
          color?: string | null
          created_at?: string
          date_of_birth?: string | null
          gender?: string
          health_status?: string
          id?: string
          name?: string | null
          notes?: string | null
          purchase_price?: number | null
          shelter_id?: string | null
          status?: string
          tag_number?: string
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "livestock_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "livestock_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "livestock_shelter_id_fkey"
            columns: ["shelter_id"]
            isOneToOne: false
            referencedRelation: "livestock_shelters"
            referencedColumns: ["id"]
          },
        ]
      }
      livestock_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      livestock_health_records: {
        Row: {
          branch_id: string
          cost: number | null
          created_at: string
          description: string
          diagnosis: string | null
          id: string
          livestock_id: string
          medication: string | null
          next_due_date: string | null
          record_date: string
          record_type: string
          treatment: string | null
          vet_name: string | null
        }
        Insert: {
          branch_id: string
          cost?: number | null
          created_at?: string
          description: string
          diagnosis?: string | null
          id?: string
          livestock_id: string
          medication?: string | null
          next_due_date?: string | null
          record_date?: string
          record_type: string
          treatment?: string | null
          vet_name?: string | null
        }
        Update: {
          branch_id?: string
          cost?: number | null
          created_at?: string
          description?: string
          diagnosis?: string | null
          id?: string
          livestock_id?: string
          medication?: string | null
          next_due_date?: string | null
          record_date?: string
          record_type?: string
          treatment?: string | null
          vet_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "livestock_health_records_livestock_id_fkey"
            columns: ["livestock_id"]
            isOneToOne: false
            referencedRelation: "livestock"
            referencedColumns: ["id"]
          },
        ]
      }
      livestock_shelters: {
        Row: {
          branch_id: string
          capacity: number
          created_at: string
          id: string
          location_description: string | null
          name: string
          shelter_type: string
          status: string
        }
        Insert: {
          branch_id: string
          capacity?: number
          created_at?: string
          id?: string
          location_description?: string | null
          name: string
          shelter_type: string
          status?: string
        }
        Update: {
          branch_id?: string
          capacity?: number
          created_at?: string
          id?: string
          location_description?: string | null
          name?: string
          shelter_type?: string
          status?: string
        }
        Relationships: []
      }
      livestock_transfers: {
        Row: {
          created_at: string
          customer_id: string | null
          from_branch_id: string | null
          id: string
          livestock_id: string | null
          notes: string | null
          quantity: number
          reason: string | null
          reference_number: string
          status: string
          to_branch_id: string | null
          total_value: number | null
          transfer_date: string
          transfer_type: string
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          from_branch_id?: string | null
          id?: string
          livestock_id?: string | null
          notes?: string | null
          quantity?: number
          reason?: string | null
          reference_number: string
          status?: string
          to_branch_id?: string | null
          total_value?: number | null
          transfer_date?: string
          transfer_type: string
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          from_branch_id?: string | null
          id?: string
          livestock_id?: string | null
          notes?: string | null
          quantity?: number
          reason?: string | null
          reference_number?: string
          status?: string
          to_branch_id?: string | null
          total_value?: number | null
          transfer_date?: string
          transfer_type?: string
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "livestock_transfers_livestock_id_fkey"
            columns: ["livestock_id"]
            isOneToOne: false
            referencedRelation: "livestock"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          id_number: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          id_number?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          id_number?: string | null
          phone?: string | null
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
      has_valid_license: { Args: { _user_id: string }; Returns: boolean }
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
