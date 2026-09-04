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
      accommodation_allocations: {
        Row: {
          application_id: string | null
          branch_id: string | null
          created_at: string
          employee_id: string
          end_date: string | null
          id: string
          monthly_charge: number
          room_id: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          application_id?: string | null
          branch_id?: string | null
          created_at?: string
          employee_id: string
          end_date?: string | null
          id?: string
          monthly_charge?: number
          room_id: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Update: {
          application_id?: string | null
          branch_id?: string | null
          created_at?: string
          employee_id?: string
          end_date?: string | null
          id?: string
          monthly_charge?: number
          room_id?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accommodation_allocations_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "accommodation_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accommodation_allocations_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "accommodation_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      accommodation_applications: {
        Row: {
          application_date: string
          branch_id: string | null
          created_at: string
          desired_start_date: string | null
          employee_id: string
          id: string
          reason: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          room_id: string
          status: string
          updated_at: string
        }
        Insert: {
          application_date?: string
          branch_id?: string | null
          created_at?: string
          desired_start_date?: string | null
          employee_id: string
          id?: string
          reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          room_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          application_date?: string
          branch_id?: string | null
          created_at?: string
          desired_start_date?: string | null
          employee_id?: string
          id?: string
          reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          room_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accommodation_applications_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "accommodation_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      accommodation_checkins: {
        Row: {
          allocation_id: string
          branch_id: string | null
          condition_status: string | null
          created_at: string
          damage_charge: number
          damages_noted: string | null
          employee_id: string
          event_date: string
          event_type: string
          id: string
          inspected_by: string | null
          notes: string | null
          room_id: string
        }
        Insert: {
          allocation_id: string
          branch_id?: string | null
          condition_status?: string | null
          created_at?: string
          damage_charge?: number
          damages_noted?: string | null
          employee_id: string
          event_date?: string
          event_type: string
          id?: string
          inspected_by?: string | null
          notes?: string | null
          room_id: string
        }
        Update: {
          allocation_id?: string
          branch_id?: string | null
          condition_status?: string | null
          created_at?: string
          damage_charge?: number
          damages_noted?: string | null
          employee_id?: string
          event_date?: string
          event_type?: string
          id?: string
          inspected_by?: string | null
          notes?: string | null
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accommodation_checkins_allocation_id_fkey"
            columns: ["allocation_id"]
            isOneToOne: false
            referencedRelation: "accommodation_allocations"
            referencedColumns: ["id"]
          },
        ]
      }
      accommodation_houses: {
        Row: {
          branch_id: string
          created_at: string
          house_code: string
          house_type: string
          id: string
          location: string | null
          name: string
          notes: string | null
          status: string
          total_rooms: number
          updated_at: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          house_code: string
          house_type?: string
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          status?: string
          total_rooms?: number
          updated_at?: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          house_code?: string
          house_type?: string
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          status?: string
          total_rooms?: number
          updated_at?: string
        }
        Relationships: []
      }
      accommodation_requests: {
        Row: {
          admin_response: string | null
          allocation_id: string | null
          branch_id: string | null
          created_at: string
          description: string
          employee_id: string
          id: string
          priority: string
          request_type: string
          resolved_at: string | null
          resolved_by: string | null
          room_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          admin_response?: string | null
          allocation_id?: string | null
          branch_id?: string | null
          created_at?: string
          description: string
          employee_id: string
          id?: string
          priority?: string
          request_type?: string
          resolved_at?: string | null
          resolved_by?: string | null
          room_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          admin_response?: string | null
          allocation_id?: string | null
          branch_id?: string | null
          created_at?: string
          description?: string
          employee_id?: string
          id?: string
          priority?: string
          request_type?: string
          resolved_at?: string | null
          resolved_by?: string | null
          room_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      accommodation_room_assets: {
        Row: {
          asset_name: string
          asset_type: string
          condition: string
          created_at: string
          id: string
          inventory_item_ref: string | null
          notes: string | null
          quantity: number
          room_id: string
          updated_at: string
        }
        Insert: {
          asset_name: string
          asset_type?: string
          condition?: string
          created_at?: string
          id?: string
          inventory_item_ref?: string | null
          notes?: string | null
          quantity?: number
          room_id: string
          updated_at?: string
        }
        Update: {
          asset_name?: string
          asset_type?: string
          condition?: string
          created_at?: string
          id?: string
          inventory_item_ref?: string | null
          notes?: string | null
          quantity?: number
          room_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accommodation_room_assets_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "accommodation_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      accommodation_rooms: {
        Row: {
          branch_id: string
          capacity: number
          condition_status: string
          created_at: string
          house_id: string
          id: string
          monthly_charge: number
          notes: string | null
          room_number: string
          room_type: string
          status: string
          updated_at: string
        }
        Insert: {
          branch_id: string
          capacity?: number
          condition_status?: string
          created_at?: string
          house_id: string
          id?: string
          monthly_charge?: number
          notes?: string | null
          room_number: string
          room_type?: string
          status?: string
          updated_at?: string
        }
        Update: {
          branch_id?: string
          capacity?: number
          condition_status?: string
          created_at?: string
          house_id?: string
          id?: string
          monthly_charge?: number
          notes?: string | null
          room_number?: string
          room_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accommodation_rooms_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "accommodation_houses"
            referencedColumns: ["id"]
          },
        ]
      }
      agri_articles: {
        Row: {
          branch_id: string | null
          category: string
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_ai_generated: boolean | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          category?: string
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_ai_generated?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_ai_generated?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      asset_assignments: {
        Row: {
          asset_id: string
          assigned_date: string
          assignee_employee_id: string | null
          assignee_name: string
          branch_id: string | null
          condition_in: string | null
          condition_out: string | null
          created_at: string
          department: string | null
          id: string
          notes: string | null
          project_id: string | null
          returned_date: string | null
          status: string
        }
        Insert: {
          asset_id: string
          assigned_date?: string
          assignee_employee_id?: string | null
          assignee_name: string
          branch_id?: string | null
          condition_in?: string | null
          condition_out?: string | null
          created_at?: string
          department?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          returned_date?: string | null
          status?: string
        }
        Update: {
          asset_id?: string
          assigned_date?: string
          assignee_employee_id?: string | null
          assignee_name?: string
          branch_id?: string | null
          condition_in?: string | null
          condition_out?: string | null
          created_at?: string
          department?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          returned_date?: string | null
          status?: string
        }
        Relationships: []
      }
      asset_audit_logs: {
        Row: {
          action: string
          actor_name: string | null
          actor_role: string | null
          branch_id: string | null
          created_at: string
          diff: Json | null
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_name?: string | null
          actor_role?: string | null
          branch_id?: string | null
          created_at?: string
          diff?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_name?: string | null
          actor_role?: string | null
          branch_id?: string | null
          created_at?: string
          diff?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      asset_categories: {
        Row: {
          code: string | null
          created_at: string
          default_salvage_rate: number
          default_useful_life_years: number
          depreciation_method: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          default_salvage_rate?: number
          default_useful_life_years?: number
          depreciation_method?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          default_salvage_rate?: number
          default_useful_life_years?: number
          depreciation_method?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      asset_depreciation_entries: {
        Row: {
          asset_id: string
          branch_id: string | null
          closing_value: number
          created_at: string
          depreciation_amount: number
          gl_entry_ref: string | null
          id: string
          notes: string | null
          opening_value: number
          period_end: string
          period_start: string
          posted_to_finance: boolean
        }
        Insert: {
          asset_id: string
          branch_id?: string | null
          closing_value?: number
          created_at?: string
          depreciation_amount?: number
          gl_entry_ref?: string | null
          id?: string
          notes?: string | null
          opening_value?: number
          period_end: string
          period_start: string
          posted_to_finance?: boolean
        }
        Update: {
          asset_id?: string
          branch_id?: string | null
          closing_value?: number
          created_at?: string
          depreciation_amount?: number
          gl_entry_ref?: string | null
          id?: string
          notes?: string | null
          opening_value?: number
          period_end?: string
          period_start?: string
          posted_to_finance?: boolean
        }
        Relationships: []
      }
      asset_disposals: {
        Row: {
          approval_status: string
          approved_by: string | null
          asset_id: string
          book_value: number
          branch_id: string | null
          buyer: string | null
          created_at: string
          disposal_date: string
          gain_loss: number
          id: string
          method: string
          posted_to_finance: boolean
          reason: string | null
          sale_price: number
        }
        Insert: {
          approval_status?: string
          approved_by?: string | null
          asset_id: string
          book_value?: number
          branch_id?: string | null
          buyer?: string | null
          created_at?: string
          disposal_date?: string
          gain_loss?: number
          id?: string
          method?: string
          posted_to_finance?: boolean
          reason?: string | null
          sale_price?: number
        }
        Update: {
          approval_status?: string
          approved_by?: string | null
          asset_id?: string
          book_value?: number
          branch_id?: string | null
          buyer?: string | null
          created_at?: string
          disposal_date?: string
          gain_loss?: number
          id?: string
          method?: string
          posted_to_finance?: boolean
          reason?: string | null
          sale_price?: number
        }
        Relationships: []
      }
      asset_maintenance: {
        Row: {
          asset_id: string
          branch_id: string | null
          cost: number
          created_at: string
          description: string | null
          downtime_hours: number | null
          id: string
          maintenance_type: string
          next_due_date: string | null
          notes: string | null
          performed_by: string | null
          performed_date: string | null
          scheduled_date: string | null
          status: string
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          asset_id: string
          branch_id?: string | null
          cost?: number
          created_at?: string
          description?: string | null
          downtime_hours?: number | null
          id?: string
          maintenance_type?: string
          next_due_date?: string | null
          notes?: string | null
          performed_by?: string | null
          performed_date?: string | null
          scheduled_date?: string | null
          status?: string
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          asset_id?: string
          branch_id?: string | null
          cost?: number
          created_at?: string
          description?: string | null
          downtime_hours?: number | null
          id?: string
          maintenance_type?: string
          next_due_date?: string | null
          notes?: string | null
          performed_by?: string | null
          performed_date?: string | null
          scheduled_date?: string | null
          status?: string
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: []
      }
      asset_notifications: {
        Row: {
          body: string | null
          branch_id: string | null
          created_at: string
          id: string
          is_read: boolean
          kind: string
          link: string | null
          ref_id: string | null
          title: string
          user_name: string | null
          user_role: string | null
        }
        Insert: {
          body?: string | null
          branch_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          kind: string
          link?: string | null
          ref_id?: string | null
          title: string
          user_name?: string | null
          user_role?: string | null
        }
        Update: {
          body?: string | null
          branch_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          kind?: string
          link?: string | null
          ref_id?: string | null
          title?: string
          user_name?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      asset_vendors: {
        Row: {
          address: string | null
          branch_id: string | null
          category: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
          rating: number | null
          services_offered: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          branch_id?: string | null
          category?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          rating?: number | null
          services_offered?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          branch_id?: string | null
          category?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          rating?: number | null
          services_offered?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      assets: {
        Row: {
          accumulated_depreciation: number
          asset_code: string
          asset_type: string
          branch_id: string | null
          category_id: string | null
          condition: string
          created_at: string
          current_value: number
          depreciation_method: string
          description: string | null
          gl_account_id: string | null
          id: string
          image_url: string | null
          last_depreciated_at: string | null
          livestock_id: string | null
          location: string | null
          manufacturer: string | null
          model: string | null
          name: string
          notes: string | null
          purchase_cost: number
          purchase_date: string | null
          salvage_value: number
          serial_number: string | null
          status: string
          supplier_id: string | null
          updated_at: string
          useful_life_years: number
          vendor_id: string | null
          warranty_expires_on: string | null
        }
        Insert: {
          accumulated_depreciation?: number
          asset_code: string
          asset_type?: string
          branch_id?: string | null
          category_id?: string | null
          condition?: string
          created_at?: string
          current_value?: number
          depreciation_method?: string
          description?: string | null
          gl_account_id?: string | null
          id?: string
          image_url?: string | null
          last_depreciated_at?: string | null
          livestock_id?: string | null
          location?: string | null
          manufacturer?: string | null
          model?: string | null
          name: string
          notes?: string | null
          purchase_cost?: number
          purchase_date?: string | null
          salvage_value?: number
          serial_number?: string | null
          status?: string
          supplier_id?: string | null
          updated_at?: string
          useful_life_years?: number
          vendor_id?: string | null
          warranty_expires_on?: string | null
        }
        Update: {
          accumulated_depreciation?: number
          asset_code?: string
          asset_type?: string
          branch_id?: string | null
          category_id?: string | null
          condition?: string
          created_at?: string
          current_value?: number
          depreciation_method?: string
          description?: string | null
          gl_account_id?: string | null
          id?: string
          image_url?: string | null
          last_depreciated_at?: string | null
          livestock_id?: string | null
          location?: string | null
          manufacturer?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          purchase_cost?: number
          purchase_date?: string | null
          salvage_value?: number
          serial_number?: string | null
          status?: string
          supplier_id?: string | null
          updated_at?: string
          useful_life_years?: number
          vendor_id?: string | null
          warranty_expires_on?: string | null
        }
        Relationships: []
      }
      canteen_audit_logs: {
        Row: {
          action: string
          branch_id: string | null
          created_at: string
          details: Json | null
          entity: string
          entity_id: string | null
          id: string
          performed_by: string | null
          performed_by_name: string | null
        }
        Insert: {
          action: string
          branch_id?: string | null
          created_at?: string
          details?: Json | null
          entity: string
          entity_id?: string | null
          id?: string
          performed_by?: string | null
          performed_by_name?: string | null
        }
        Update: {
          action?: string
          branch_id?: string | null
          created_at?: string
          details?: Json | null
          entity?: string
          entity_id?: string | null
          id?: string
          performed_by?: string | null
          performed_by_name?: string | null
        }
        Relationships: []
      }
      canteen_inventory_requests: {
        Row: {
          branch_id: string | null
          created_at: string
          fulfilled_at: string | null
          fulfilled_by: string | null
          id: string
          item_name: string
          notes: string | null
          quantity: number
          request_number: string | null
          requested_by: string | null
          status: string
          unit: string | null
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          fulfilled_at?: string | null
          fulfilled_by?: string | null
          id?: string
          item_name: string
          notes?: string | null
          quantity?: number
          request_number?: string | null
          requested_by?: string | null
          status?: string
          unit?: string | null
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          fulfilled_at?: string | null
          fulfilled_by?: string | null
          id?: string
          item_name?: string
          notes?: string | null
          quantity?: number
          request_number?: string | null
          requested_by?: string | null
          status?: string
          unit?: string | null
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: []
      }
      canteen_meals: {
        Row: {
          branch_id: string | null
          calories: number | null
          category: string | null
          created_at: string
          created_by: string | null
          day_of_week: string | null
          description: string | null
          id: string
          image_url: string | null
          ingredients: string | null
          is_active: boolean | null
          meal_time: string | null
          name: string
          price: number | null
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          calories?: number | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          day_of_week?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string | null
          is_active?: boolean | null
          meal_time?: string | null
          name: string
          price?: number | null
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          calories?: number | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          day_of_week?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string | null
          is_active?: boolean | null
          meal_time?: string | null
          name?: string
          price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      canteen_reviews: {
        Row: {
          branch_id: string | null
          comment: string | null
          created_at: string
          id: string
          meal_id: string | null
          meal_name: string | null
          rating: number
          reviewer_id: string | null
          reviewer_name: string | null
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          meal_id?: string | null
          meal_name?: string | null
          rating: number
          reviewer_id?: string | null
          reviewer_name?: string | null
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          meal_id?: string | null
          meal_name?: string | null
          rating?: number
          reviewer_id?: string | null
          reviewer_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      canteen_staff: {
        Row: {
          branch_id: string | null
          created_at: string
          employee_id: string
          id: string
          is_active: boolean | null
          notes: string | null
          role: string
          shift: string | null
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          employee_id: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          role?: string
          shift?: string | null
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          role?: string
          shift?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      credit_notes: {
        Row: {
          branch_id: string
          created_at: string
          id: string
          issued_by: string | null
          items: Json
          note_number: string
          notes: string | null
          reason: string
          return_date: string
          status: string
          total_quantity: number
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string
          id?: string
          issued_by?: string | null
          items?: Json
          note_number: string
          notes?: string | null
          reason: string
          return_date?: string
          status?: string
          total_quantity?: number
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string
          id?: string
          issued_by?: string | null
          items?: Json
          note_number?: string
          notes?: string | null
          reason?: string
          return_date?: string
          status?: string
          total_quantity?: number
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_notes_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_notes: {
        Row: {
          branch_id: string
          created_at: string
          delivery_date: string
          id: string
          items: Json
          note_number: string
          notes: string | null
          received_by: string | null
          status: string
          supplier: string
          total_quantity: number
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string
          delivery_date?: string
          id?: string
          items?: Json
          note_number: string
          notes?: string | null
          received_by?: string | null
          status?: string
          supplier: string
          total_quantity?: number
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string
          delivery_date?: string
          id?: string
          items?: Json
          note_number?: string
          notes?: string | null
          received_by?: string | null
          status?: string
          supplier?: string
          total_quantity?: number
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_notes_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_bonuses: {
        Row: {
          amount: number
          applied_to_payroll_id: string | null
          bonus_date: string
          bonus_type: string
          branch_id: string | null
          created_at: string
          description: string | null
          employee_id: string
          id: string
        }
        Insert: {
          amount?: number
          applied_to_payroll_id?: string | null
          bonus_date?: string
          bonus_type?: string
          branch_id?: string | null
          created_at?: string
          description?: string | null
          employee_id: string
          id?: string
        }
        Update: {
          amount?: number
          applied_to_payroll_id?: string | null
          bonus_date?: string
          bonus_type?: string
          branch_id?: string | null
          created_at?: string
          description?: string | null
          employee_id?: string
          id?: string
        }
        Relationships: []
      }
      employee_loans: {
        Row: {
          balance: number
          branch_id: string | null
          created_at: string
          employee_id: string
          id: string
          loan_date: string
          monthly_installment: number
          principal_amount: number
          reason: string | null
          status: string
          updated_at: string
        }
        Insert: {
          balance?: number
          branch_id?: string | null
          created_at?: string
          employee_id: string
          id?: string
          loan_date?: string
          monthly_installment?: number
          principal_amount?: number
          reason?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          balance?: number
          branch_id?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          loan_date?: string
          monthly_installment?: number
          principal_amount?: number
          reason?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          bank_account: string | null
          bank_name: string | null
          basic_salary: number
          branch_id: string | null
          created_at: string
          daily_rate: number
          department: string | null
          email: string | null
          employment_date: string | null
          first_name: string
          hourly_rate: number
          housing_allowance: number
          id: string
          id_number: string | null
          last_name: string
          medical_aid_deduction: number
          overtime_multiplier: number
          pay_type: string
          pension_deduction_rate: number
          phone: string | null
          piece_rate: number
          piece_unit: string | null
          position: string | null
          status: string
          tax_deduction_rate: number
          tax_number: string | null
          transport_allowance: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bank_account?: string | null
          bank_name?: string | null
          basic_salary?: number
          branch_id?: string | null
          created_at?: string
          daily_rate?: number
          department?: string | null
          email?: string | null
          employment_date?: string | null
          first_name: string
          hourly_rate?: number
          housing_allowance?: number
          id?: string
          id_number?: string | null
          last_name: string
          medical_aid_deduction?: number
          overtime_multiplier?: number
          pay_type?: string
          pension_deduction_rate?: number
          phone?: string | null
          piece_rate?: number
          piece_unit?: string | null
          position?: string | null
          status?: string
          tax_deduction_rate?: number
          tax_number?: string | null
          transport_allowance?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bank_account?: string | null
          bank_name?: string | null
          basic_salary?: number
          branch_id?: string | null
          created_at?: string
          daily_rate?: number
          department?: string | null
          email?: string | null
          employment_date?: string | null
          first_name?: string
          hourly_rate?: number
          housing_allowance?: number
          id?: string
          id_number?: string | null
          last_name?: string
          medical_aid_deduction?: number
          overtime_multiplier?: number
          pay_type?: string
          pension_deduction_rate?: number
          phone?: string | null
          piece_rate?: number
          piece_unit?: string | null
          position?: string | null
          status?: string
          tax_deduction_rate?: number
          tax_number?: string | null
          transport_allowance?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      farm_projects: {
        Row: {
          archived: boolean
          branch_id: string
          budget: number | null
          created_at: string
          description: string | null
          end_date: string | null
          gps_lat: number | null
          gps_lng: number | null
          id: string
          location_name: string | null
          manager_name: string | null
          name: string
          objectives: string | null
          priority: string
          project_type: string | null
          revenue: number | null
          spent: number | null
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          archived?: boolean
          branch_id: string
          budget?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          location_name?: string | null
          manager_name?: string | null
          name: string
          objectives?: string | null
          priority?: string
          project_type?: string | null
          revenue?: number | null
          spent?: number | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          archived?: boolean
          branch_id?: string
          budget?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          location_name?: string | null
          manager_name?: string | null
          name?: string
          objectives?: string | null
          priority?: string
          project_type?: string | null
          revenue?: number | null
          spent?: number | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      farm_tasks: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          branch_id: string
          checklist: Json | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          parent_task_id: string | null
          phase_id: string | null
          predecessor_task_id: string | null
          priority: string
          project_id: string
          start_date: string | null
          status: string
          subtask_of: string | null
          title: string
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          branch_id: string
          checklist?: Json | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          parent_task_id?: string | null
          phase_id?: string | null
          predecessor_task_id?: string | null
          priority?: string
          project_id: string
          start_date?: string | null
          status?: string
          subtask_of?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          branch_id?: string
          checklist?: Json | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          parent_task_id?: string | null
          phase_id?: string | null
          predecessor_task_id?: string | null
          priority?: string
          project_id?: string
          start_date?: string | null
          status?: string
          subtask_of?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "farm_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "farm_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      gl_accounts: {
        Row: {
          account_code: string
          account_name: string
          account_type: Database["public"]["Enums"]["gl_account_type"]
          branch_id: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          account_code: string
          account_name: string
          account_type: Database["public"]["Enums"]["gl_account_type"]
          branch_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          account_code?: string
          account_name?: string
          account_type?: Database["public"]["Enums"]["gl_account_type"]
          branch_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      gl_entries: {
        Row: {
          branch_id: string | null
          created_at: string
          credit: number
          debit: number
          description: string
          entry_date: string
          gl_account_id: string
          gl_sub_account_id: string | null
          id: string
          reference_id: string | null
          reference_number: string | null
          reference_type: string | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          credit?: number
          debit?: number
          description: string
          entry_date?: string
          gl_account_id: string
          gl_sub_account_id?: string | null
          id?: string
          reference_id?: string | null
          reference_number?: string | null
          reference_type?: string | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          credit?: number
          debit?: number
          description?: string
          entry_date?: string
          gl_account_id?: string
          gl_sub_account_id?: string | null
          id?: string
          reference_id?: string | null
          reference_number?: string | null
          reference_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gl_entries_gl_account_id_fkey"
            columns: ["gl_account_id"]
            isOneToOne: false
            referencedRelation: "gl_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gl_entries_gl_sub_account_id_fkey"
            columns: ["gl_sub_account_id"]
            isOneToOne: false
            referencedRelation: "gl_sub_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      gl_sub_accounts: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          parent_account_id: string
          sub_account_code: string
          sub_account_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          parent_account_id: string
          sub_account_code: string
          sub_account_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          parent_account_id?: string
          sub_account_code?: string
          sub_account_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gl_sub_accounts_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "gl_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      goods_received_notes: {
        Row: {
          branch_id: string | null
          created_at: string
          grn_number: string
          id: string
          notes: string | null
          po_id: string
          received_by: string | null
          received_date: string
          status: string
          warehouse_id: string | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          grn_number: string
          id?: string
          notes?: string | null
          po_id: string
          received_by?: string | null
          received_date?: string
          status?: string
          warehouse_id?: string | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          grn_number?: string
          id?: string
          notes?: string | null
          po_id?: string
          received_by?: string | null
          received_date?: string
          status?: string
          warehouse_id?: string | null
        }
        Relationships: []
      }
      grn_items: {
        Row: {
          condition: string | null
          created_at: string
          grn_id: string
          id: string
          item_name: string
          notes: string | null
          po_item_id: string
          qty_received: number
        }
        Insert: {
          condition?: string | null
          created_at?: string
          grn_id: string
          id?: string
          item_name: string
          notes?: string | null
          po_item_id: string
          qty_received?: number
        }
        Update: {
          condition?: string | null
          created_at?: string
          grn_id?: string
          id?: string
          item_name?: string
          notes?: string | null
          po_item_id?: string
          qty_received?: number
        }
        Relationships: []
      }
      inventory_issues: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          branch_id: string
          category: string
          created_at: string
          from_warehouse_id: string | null
          id: string
          issue_date: string
          issuer_name: string
          item_name: string
          notes: string | null
          project_id: string | null
          purpose: string | null
          quantity: number
          recipient_name: string
          reference_number: string | null
          status: string
          to_warehouse_id: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id: string
          category?: string
          created_at?: string
          from_warehouse_id?: string | null
          id?: string
          issue_date?: string
          issuer_name: string
          item_name: string
          notes?: string | null
          project_id?: string | null
          purpose?: string | null
          quantity: number
          recipient_name: string
          reference_number?: string | null
          status?: string
          to_warehouse_id?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string
          category?: string
          created_at?: string
          from_warehouse_id?: string | null
          id?: string
          issue_date?: string
          issuer_name?: string
          item_name?: string
          notes?: string | null
          project_id?: string | null
          purpose?: string | null
          quantity?: number
          recipient_name?: string
          reference_number?: string | null
          status?: string
          to_warehouse_id?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_issues_from_warehouse_id_fkey"
            columns: ["from_warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_issues_to_warehouse_id_fkey"
            columns: ["to_warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_receipts: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          branch_id: string
          category: string
          created_at: string
          id: string
          item_name: string
          notes: string | null
          quantity: number
          receipt_date: string
          received_by: string
          reference_number: string | null
          status: string
          supplier_source: string | null
          unit: string
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id: string
          category?: string
          created_at?: string
          id?: string
          item_name: string
          notes?: string | null
          quantity: number
          receipt_date?: string
          received_by: string
          reference_number?: string | null
          status?: string
          supplier_source?: string | null
          unit?: string
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string
          category?: string
          created_at?: string
          id?: string
          item_name?: string
          notes?: string | null
          quantity?: number
          receipt_date?: string
          received_by?: string
          reference_number?: string | null
          status?: string
          supplier_source?: string | null
          unit?: string
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_receipts_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
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
      leave_balances: {
        Row: {
          annual_leave_total: number
          annual_leave_used: number
          created_at: string
          employee_id: string
          family_leave_total: number
          family_leave_used: number
          id: string
          sick_leave_total: number
          sick_leave_used: number
          updated_at: string
          year: number
        }
        Insert: {
          annual_leave_total?: number
          annual_leave_used?: number
          created_at?: string
          employee_id: string
          family_leave_total?: number
          family_leave_used?: number
          id?: string
          sick_leave_total?: number
          sick_leave_used?: number
          updated_at?: string
          year: number
        }
        Update: {
          annual_leave_total?: number
          annual_leave_used?: number
          created_at?: string
          employee_id?: string
          family_leave_total?: number
          family_leave_used?: number
          id?: string
          sick_leave_total?: number
          sick_leave_used?: number
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "leave_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          days_count: number
          employee_id: string
          end_date: string
          id: string
          is_paid: boolean
          leave_type: string
          reason: string | null
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          days_count?: number
          employee_id: string
          end_date: string
          id?: string
          is_paid?: boolean
          leave_type?: string
          reason?: string | null
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          days_count?: number
          employee_id?: string
          end_date?: string
          id?: string
          is_paid?: boolean
          leave_type?: string
          reason?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_types: {
        Row: {
          created_at: string
          default_days: number
          description: string | null
          id: string
          is_active: boolean
          is_paid: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_days?: number
          description?: string | null
          id?: string
          is_active?: boolean
          is_paid?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_days?: number
          description?: string | null
          id?: string
          is_active?: boolean
          is_paid?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
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
          project_id: string | null
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
          project_id?: string | null
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
          project_id?: string | null
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
      payroll_items: {
        Row: {
          absence_penalty: number
          accommodation_deduction: number
          basic_salary: number
          created_at: string
          days_worked: number
          employee_id: string
          food_allowance: number
          gross_pay: number
          harvest_bonus: number
          hours_worked: number
          housing_allowance: number
          id: string
          loan_deduction: number
          medical_aid_deduction: number
          net_pay: number
          other_deductions: number
          other_earnings: number
          overtime_hours: number
          overtime_pay: number
          paid_at: string | null
          pay_type: string
          payment_method: string | null
          payment_reference: string | null
          payroll_run_id: string
          payslip_sent_at: string | null
          pension_deduction: number
          quantity_produced: number
          tax_deduction: number
          total_deductions: number
          transport_allowance: number
        }
        Insert: {
          absence_penalty?: number
          accommodation_deduction?: number
          basic_salary?: number
          created_at?: string
          days_worked?: number
          employee_id: string
          food_allowance?: number
          gross_pay?: number
          harvest_bonus?: number
          hours_worked?: number
          housing_allowance?: number
          id?: string
          loan_deduction?: number
          medical_aid_deduction?: number
          net_pay?: number
          other_deductions?: number
          other_earnings?: number
          overtime_hours?: number
          overtime_pay?: number
          paid_at?: string | null
          pay_type?: string
          payment_method?: string | null
          payment_reference?: string | null
          payroll_run_id: string
          payslip_sent_at?: string | null
          pension_deduction?: number
          quantity_produced?: number
          tax_deduction?: number
          total_deductions?: number
          transport_allowance?: number
        }
        Update: {
          absence_penalty?: number
          accommodation_deduction?: number
          basic_salary?: number
          created_at?: string
          days_worked?: number
          employee_id?: string
          food_allowance?: number
          gross_pay?: number
          harvest_bonus?: number
          hours_worked?: number
          housing_allowance?: number
          id?: string
          loan_deduction?: number
          medical_aid_deduction?: number
          net_pay?: number
          other_deductions?: number
          other_earnings?: number
          overtime_hours?: number
          overtime_pay?: number
          paid_at?: string | null
          pay_type?: string
          payment_method?: string | null
          payment_reference?: string | null
          payroll_run_id?: string
          payslip_sent_at?: string | null
          pension_deduction?: number
          quantity_produced?: number
          tax_deduction?: number
          total_deductions?: number
          transport_allowance?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_items_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_items_payroll_run_id_fkey"
            columns: ["payroll_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_runs: {
        Row: {
          branch_id: string | null
          created_at: string
          default_payment_method: string | null
          gl_account_id: string | null
          gl_sub_account_id: string | null
          id: string
          notes: string | null
          period_end: string
          period_start: string
          processed_by: string | null
          run_date: string
          status: string
          total_deductions: number
          total_gross: number
          total_net: number
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          default_payment_method?: string | null
          gl_account_id?: string | null
          gl_sub_account_id?: string | null
          id?: string
          notes?: string | null
          period_end: string
          period_start: string
          processed_by?: string | null
          run_date?: string
          status?: string
          total_deductions?: number
          total_gross?: number
          total_net?: number
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          default_payment_method?: string | null
          gl_account_id?: string | null
          gl_sub_account_id?: string | null
          id?: string
          notes?: string | null
          period_end?: string
          period_start?: string
          processed_by?: string | null
          run_date?: string
          status?: string
          total_deductions?: number
          total_gross?: number
          total_net?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_runs_gl_account_id_fkey"
            columns: ["gl_account_id"]
            isOneToOne: false
            referencedRelation: "gl_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_runs_gl_sub_account_id_fkey"
            columns: ["gl_sub_account_id"]
            isOneToOne: false
            referencedRelation: "gl_sub_accounts"
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
      project_activity_log: {
        Row: {
          action: string
          actor: string | null
          branch_id: string | null
          created_at: string
          id: string
          meta: Json | null
          project_id: string
        }
        Insert: {
          action: string
          actor?: string | null
          branch_id?: string | null
          created_at?: string
          id?: string
          meta?: Json | null
          project_id: string
        }
        Update: {
          action?: string
          actor?: string | null
          branch_id?: string | null
          created_at?: string
          id?: string
          meta?: Json | null
          project_id?: string
        }
        Relationships: []
      }
      project_closures: {
        Row: {
          branch_id: string | null
          closed_at: string
          closed_by: string | null
          financial_summary: Json | null
          id: string
          lessons_learned: string | null
          performance_rating: number
          project_id: string
          yield_summary: string | null
        }
        Insert: {
          branch_id?: string | null
          closed_at?: string
          closed_by?: string | null
          financial_summary?: Json | null
          id?: string
          lessons_learned?: string | null
          performance_rating?: number
          project_id: string
          yield_summary?: string | null
        }
        Update: {
          branch_id?: string | null
          closed_at?: string
          closed_by?: string | null
          financial_summary?: Json | null
          id?: string
          lessons_learned?: string | null
          performance_rating?: number
          project_id?: string
          yield_summary?: string | null
        }
        Relationships: []
      }
      project_comments: {
        Row: {
          author_name: string
          body: string
          branch_id: string | null
          created_at: string
          id: string
          parent_id: string | null
          project_id: string
        }
        Insert: {
          author_name: string
          body: string
          branch_id?: string | null
          created_at?: string
          id?: string
          parent_id?: string | null
          project_id: string
        }
        Update: {
          author_name?: string
          body?: string
          branch_id?: string | null
          created_at?: string
          id?: string
          parent_id?: string | null
          project_id?: string
        }
        Relationships: []
      }
      project_documents: {
        Row: {
          branch_id: string | null
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          project_id: string
          uploaded_by: string | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          project_id: string
          uploaded_by?: string | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          project_id?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      project_expenses: {
        Row: {
          amount: number
          branch_id: string | null
          category: string
          created_at: string
          created_by: string | null
          description: string
          expense_date: string
          gl_entry_ref: string | null
          id: string
          posted_to_finance: boolean
          project_id: string
        }
        Insert: {
          amount?: number
          branch_id?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          description: string
          expense_date?: string
          gl_entry_ref?: string | null
          id?: string
          posted_to_finance?: boolean
          project_id: string
        }
        Update: {
          amount?: number
          branch_id?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          expense_date?: string
          gl_entry_ref?: string | null
          id?: string
          posted_to_finance?: boolean
          project_id?: string
        }
        Relationships: []
      }
      project_milestones: {
        Row: {
          branch_id: string | null
          completed_at: string | null
          created_at: string
          deliverables: string | null
          due_date: string | null
          id: string
          phase_id: string | null
          project_id: string
          status: string
          title: string
        }
        Insert: {
          branch_id?: string | null
          completed_at?: string | null
          created_at?: string
          deliverables?: string | null
          due_date?: string | null
          id?: string
          phase_id?: string | null
          project_id: string
          status?: string
          title: string
        }
        Update: {
          branch_id?: string | null
          completed_at?: string | null
          created_at?: string
          deliverables?: string | null
          due_date?: string | null
          id?: string
          phase_id?: string | null
          project_id?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      project_notifications: {
        Row: {
          body: string | null
          branch_id: string | null
          created_at: string
          id: string
          is_read: boolean
          kind: string
          project_id: string
          title: string
        }
        Insert: {
          body?: string | null
          branch_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          kind: string
          project_id: string
          title: string
        }
        Update: {
          body?: string | null
          branch_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          kind?: string
          project_id?: string
          title?: string
        }
        Relationships: []
      }
      project_observations: {
        Row: {
          branch_id: string | null
          created_at: string
          gps_lat: number | null
          gps_lng: number | null
          id: string
          note: string
          observed_at: string
          observer_name: string | null
          photo_url: string | null
          project_id: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          note: string
          observed_at?: string
          observer_name?: string | null
          photo_url?: string | null
          project_id: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          note?: string
          observed_at?: string
          observer_name?: string | null
          photo_url?: string | null
          project_id?: string
        }
        Relationships: []
      }
      project_phases: {
        Row: {
          branch_id: string | null
          created_at: string
          end_date: string | null
          id: string
          name: string
          progress_pct: number
          project_id: string
          sequence: number
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          progress_pct?: number
          project_id: string
          sequence?: number
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          progress_pct?: number
          project_id?: string
          sequence?: number
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_resources: {
        Row: {
          branch_id: string | null
          created_at: string
          id: string
          project_id: string
          qty_planned: number
          qty_used: number
          resource_id: string | null
          resource_name: string
          resource_type: string
          scheduled_from: string | null
          scheduled_to: string | null
          status: string
          unit_cost: number
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          id?: string
          project_id: string
          qty_planned?: number
          qty_used?: number
          resource_id?: string | null
          resource_name: string
          resource_type: string
          scheduled_from?: string | null
          scheduled_to?: string | null
          status?: string
          unit_cost?: number
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          id?: string
          project_id?: string
          qty_planned?: number
          qty_used?: number
          resource_id?: string | null
          resource_name?: string
          resource_type?: string
          scheduled_from?: string | null
          scheduled_to?: string | null
          status?: string
          unit_cost?: number
        }
        Relationships: []
      }
      project_risks: {
        Row: {
          branch_id: string | null
          created_at: string
          description: string | null
          id: string
          impact: string
          likelihood: string
          mitigation: string | null
          owner: string | null
          project_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          impact?: string
          likelihood?: string
          mitigation?: string | null
          owner?: string | null
          project_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          impact?: string
          likelihood?: string
          mitigation?: string | null
          owner?: string | null
          project_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_team_members: {
        Row: {
          allocation_pct: number
          branch_id: string | null
          created_at: string
          employee_id: string | null
          id: string
          member_name: string
          project_id: string
          role: string | null
        }
        Insert: {
          allocation_pct?: number
          branch_id?: string | null
          created_at?: string
          employee_id?: string | null
          id?: string
          member_name: string
          project_id: string
          role?: string | null
        }
        Update: {
          allocation_pct?: number
          branch_id?: string | null
          created_at?: string
          employee_id?: string | null
          id?: string
          member_name?: string
          project_id?: string
          role?: string | null
        }
        Relationships: []
      }
      project_weather_events: {
        Row: {
          branch_id: string | null
          condition: string
          created_at: string
          event_date: string
          id: string
          impact_description: string | null
          project_id: string
          severity: string
        }
        Insert: {
          branch_id?: string | null
          condition: string
          created_at?: string
          event_date?: string
          id?: string
          impact_description?: string | null
          project_id: string
          severity?: string
        }
        Update: {
          branch_id?: string | null
          condition?: string
          created_at?: string
          event_date?: string
          id?: string
          impact_description?: string | null
          project_id?: string
          severity?: string
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          created_at: string
          id: string
          item_name: string
          po_id: string
          qty: number
          qty_received: number
          total: number
          unit: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_name: string
          po_id: string
          qty?: number
          qty_received?: number
          total?: number
          unit?: string
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          item_name?: string
          po_id?: string
          qty?: number
          qty_received?: number
          total?: number
          unit?: string
          unit_price?: number
        }
        Relationships: []
      }
      purchase_orders: {
        Row: {
          branch_id: string | null
          created_at: string
          delivery_terms: string | null
          expected_delivery: string | null
          id: string
          issued_at: string | null
          issued_by: string | null
          notes: string | null
          payment_terms: string | null
          po_number: string
          requisition_id: string | null
          status: string
          subtotal: number
          supplier_contact: string | null
          supplier_name: string
          tax: number
          total: number
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          delivery_terms?: string | null
          expected_delivery?: string | null
          id?: string
          issued_at?: string | null
          issued_by?: string | null
          notes?: string | null
          payment_terms?: string | null
          po_number: string
          requisition_id?: string | null
          status?: string
          subtotal?: number
          supplier_contact?: string | null
          supplier_name: string
          tax?: number
          total?: number
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          delivery_terms?: string | null
          expected_delivery?: string | null
          id?: string
          issued_at?: string | null
          issued_by?: string | null
          notes?: string | null
          payment_terms?: string | null
          po_number?: string
          requisition_id?: string | null
          status?: string
          subtotal?: number
          supplier_contact?: string | null
          supplier_name?: string
          tax?: number
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      req_approval_logs: {
        Row: {
          acted_at: string
          action: string
          approver_name: string | null
          approver_role: string | null
          comment: string | null
          delegated_to: string | null
          id: string
          requisition_id: string
          step_name: string | null
          step_order: number
        }
        Insert: {
          acted_at?: string
          action: string
          approver_name?: string | null
          approver_role?: string | null
          comment?: string | null
          delegated_to?: string | null
          id?: string
          requisition_id: string
          step_name?: string | null
          step_order: number
        }
        Update: {
          acted_at?: string
          action?: string
          approver_name?: string | null
          approver_role?: string | null
          comment?: string | null
          delegated_to?: string | null
          id?: string
          requisition_id?: string
          step_name?: string | null
          step_order?: number
        }
        Relationships: []
      }
      req_approval_workflows: {
        Row: {
          branch_id: string | null
          created_at: string
          department: string | null
          id: string
          is_active: boolean
          is_default: boolean
          max_amount: number | null
          min_amount: number | null
          name: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          department?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          max_amount?: number | null
          min_amount?: number | null
          name: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          department?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          max_amount?: number | null
          min_amount?: number | null
          name?: string
        }
        Relationships: []
      }
      req_attachments: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          file_name: string
          file_path: string
          id: string
          mime_type: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          file_name: string
          file_path: string
          id?: string
          mime_type?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          file_name?: string
          file_path?: string
          id?: string
          mime_type?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      req_audit_logs: {
        Row: {
          action: string
          actor_name: string | null
          actor_role: string | null
          branch_id: string | null
          created_at: string
          diff: Json | null
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_name?: string | null
          actor_role?: string | null
          branch_id?: string | null
          created_at?: string
          diff?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_name?: string | null
          actor_role?: string | null
          branch_id?: string | null
          created_at?: string
          diff?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      req_budgets: {
        Row: {
          allocated: number
          branch_id: string | null
          committed: number
          created_at: string
          department: string | null
          fiscal_year: number
          gl_account_id: string | null
          id: string
          notes: string | null
          spent: number
          updated_at: string
        }
        Insert: {
          allocated?: number
          branch_id?: string | null
          committed?: number
          created_at?: string
          department?: string | null
          fiscal_year: number
          gl_account_id?: string | null
          id?: string
          notes?: string | null
          spent?: number
          updated_at?: string
        }
        Update: {
          allocated?: number
          branch_id?: string | null
          committed?: number
          created_at?: string
          department?: string | null
          fiscal_year?: number
          gl_account_id?: string | null
          id?: string
          notes?: string | null
          spent?: number
          updated_at?: string
        }
        Relationships: []
      }
      req_notifications: {
        Row: {
          body: string | null
          branch_id: string | null
          created_at: string
          id: string
          is_read: boolean
          kind: string
          link: string | null
          ref_id: string | null
          title: string
          user_name: string | null
          user_role: string | null
        }
        Insert: {
          body?: string | null
          branch_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          kind: string
          link?: string | null
          ref_id?: string | null
          title: string
          user_name?: string | null
          user_role?: string | null
        }
        Update: {
          body?: string | null
          branch_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          kind?: string
          link?: string | null
          ref_id?: string | null
          title?: string
          user_name?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      req_quotations: {
        Row: {
          attachment_path: string | null
          created_at: string
          id: string
          is_selected: boolean
          lead_time_days: number | null
          notes: string | null
          quoted_total: number
          requisition_id: string
          supplier_contact: string | null
          supplier_name: string
          valid_until: string | null
        }
        Insert: {
          attachment_path?: string | null
          created_at?: string
          id?: string
          is_selected?: boolean
          lead_time_days?: number | null
          notes?: string | null
          quoted_total?: number
          requisition_id: string
          supplier_contact?: string | null
          supplier_name: string
          valid_until?: string | null
        }
        Update: {
          attachment_path?: string | null
          created_at?: string
          id?: string
          is_selected?: boolean
          lead_time_days?: number | null
          notes?: string | null
          quoted_total?: number
          requisition_id?: string
          supplier_contact?: string | null
          supplier_name?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      req_workflow_steps: {
        Row: {
          approver_role: string
          created_at: string
          id: string
          sla_hours: number | null
          step_name: string
          step_order: number
          workflow_id: string
        }
        Insert: {
          approver_role: string
          created_at?: string
          id?: string
          sla_hours?: number | null
          step_name: string
          step_order: number
          workflow_id: string
        }
        Update: {
          approver_role?: string
          created_at?: string
          id?: string
          sla_hours?: number | null
          step_name?: string
          step_order?: number
          workflow_id?: string
        }
        Relationships: []
      }
      requisition_items: {
        Row: {
          category: string | null
          created_at: string
          id: string
          item_name: string
          notes: string | null
          qty: number
          requisition_id: string
          total: number
          unit: string
          unit_price: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          item_name: string
          notes?: string | null
          qty?: number
          requisition_id: string
          total?: number
          unit?: string
          unit_price?: number
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          item_name?: string
          notes?: string | null
          qty?: number
          requisition_id?: string
          total?: number
          unit?: string
          unit_price?: number
        }
        Relationships: []
      }
      requisitions: {
        Row: {
          branch_id: string | null
          budget_gl_account_id: string | null
          created_at: string
          currency: string
          current_step: number
          department: string | null
          estimated_total: number
          id: string
          is_emergency: boolean
          justification: string | null
          notes: string | null
          parent_req_id: string | null
          priority: string
          project_id: string | null
          recurrence_rule: string | null
          req_number: string
          requester_id: string | null
          requester_name: string
          required_by: string | null
          status: string
          suggested_supplier: string | null
          title: string
          updated_at: string
          workflow_id: string | null
        }
        Insert: {
          branch_id?: string | null
          budget_gl_account_id?: string | null
          created_at?: string
          currency?: string
          current_step?: number
          department?: string | null
          estimated_total?: number
          id?: string
          is_emergency?: boolean
          justification?: string | null
          notes?: string | null
          parent_req_id?: string | null
          priority?: string
          project_id?: string | null
          recurrence_rule?: string | null
          req_number: string
          requester_id?: string | null
          requester_name: string
          required_by?: string | null
          status?: string
          suggested_supplier?: string | null
          title: string
          updated_at?: string
          workflow_id?: string | null
        }
        Update: {
          branch_id?: string | null
          budget_gl_account_id?: string | null
          created_at?: string
          currency?: string
          current_step?: number
          department?: string | null
          estimated_total?: number
          id?: string
          is_emergency?: boolean
          justification?: string | null
          notes?: string | null
          parent_req_id?: string | null
          priority?: string
          project_id?: string | null
          recurrence_rule?: string | null
          req_number?: string
          requester_id?: string | null
          requester_name?: string
          required_by?: string | null
          status?: string
          suggested_supplier?: string | null
          title?: string
          updated_at?: string
          workflow_id?: string | null
        }
        Relationships: []
      }
      warehouses: {
        Row: {
          branch_id: string
          capacity: number | null
          created_at: string
          id: string
          location_description: string | null
          name: string
          status: string
          updated_at: string
          warehouse_type: string
        }
        Insert: {
          branch_id: string
          capacity?: number | null
          created_at?: string
          id?: string
          location_description?: string | null
          name: string
          status?: string
          updated_at?: string
          warehouse_type?: string
        }
        Update: {
          branch_id?: string
          capacity?: number | null
          created_at?: string
          id?: string
          location_description?: string | null
          name?: string
          status?: string
          updated_at?: string
          warehouse_type?: string
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
      gl_account_type: "asset" | "liability" | "equity" | "revenue" | "expense"
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
    Enums: {
      gl_account_type: ["asset", "liability", "equity", "revenue", "expense"],
    },
  },
} as const
