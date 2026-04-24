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
          branch_id: string
          budget: number | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          manager_name: string | null
          name: string
          priority: string
          spent: number | null
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          branch_id: string
          budget?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          manager_name?: string | null
          name: string
          priority?: string
          spent?: number | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          branch_id?: string
          budget?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          manager_name?: string | null
          name?: string
          priority?: string
          spent?: number | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      farm_tasks: {
        Row: {
          assigned_to: string | null
          branch_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          parent_task_id: string | null
          priority: string
          project_id: string
          start_date: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          branch_id: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          parent_task_id?: string | null
          priority?: string
          project_id: string
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          branch_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          parent_task_id?: string | null
          priority?: string
          project_id?: string
          start_date?: string | null
          status?: string
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
      payroll_items: {
        Row: {
          absence_penalty: number
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
      gl_account_type: ["asset", "liability", "equity", "revenue", "expense"],
    },
  },
} as const
