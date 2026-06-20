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
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          project_id: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          meta: Json
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          meta?: Json
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          meta?: Json
        }
        Relationships: []
      }
      contracts: {
        Row: {
          contract_no: string
          counterparty: string | null
          created_at: string
          document_url: string | null
          end_date: string | null
          id: string
          project_id: string
          signed_date: string | null
          start_date: string | null
          status: string | null
          title: string
          value: number | null
        }
        Insert: {
          contract_no: string
          counterparty?: string | null
          created_at?: string
          document_url?: string | null
          end_date?: string | null
          id?: string
          project_id: string
          signed_date?: string | null
          start_date?: string | null
          status?: string | null
          title: string
          value?: number | null
        }
        Update: {
          contract_no?: string
          counterparty?: string | null
          created_at?: string
          document_url?: string | null
          end_date?: string | null
          id?: string
          project_id?: string
          signed_date?: string | null
          start_date?: string | null
          status?: string | null
          title?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      correspondence: {
        Row: {
          attachment_url: string | null
          body: string | null
          created_at: string
          direction: string | null
          from_party: string | null
          id: string
          project_id: string | null
          ref_no: string | null
          sent_date: string | null
          status: string
          subject: string
          template_id: string | null
          to_party: string | null
          updated_at: string
        }
        Insert: {
          attachment_url?: string | null
          body?: string | null
          created_at?: string
          direction?: string | null
          from_party?: string | null
          id?: string
          project_id?: string | null
          ref_no?: string | null
          sent_date?: string | null
          status?: string
          subject: string
          template_id?: string | null
          to_party?: string | null
          updated_at?: string
        }
        Update: {
          attachment_url?: string | null
          body?: string | null
          created_at?: string
          direction?: string | null
          from_party?: string | null
          id?: string
          project_id?: string | null
          ref_no?: string | null
          sent_date?: string | null
          status?: string
          subject?: string
          template_id?: string | null
          to_party?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "correspondence_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "correspondence_template_fk"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "correspondence_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      correspondence_templates: {
        Row: {
          body_template: string | null
          created_at: string
          created_by: string | null
          direction: string
          id: string
          name: string
          subject_template: string
          updated_at: string
        }
        Insert: {
          body_template?: string | null
          created_at?: string
          created_by?: string | null
          direction?: string
          id?: string
          name: string
          subject_template: string
          updated_at?: string
        }
        Update: {
          body_template?: string | null
          created_at?: string
          created_by?: string | null
          direction?: string
          id?: string
          name?: string
          subject_template?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_reports: {
        Row: {
          created_at: string
          id: string
          issues: string | null
          manpower_count: number | null
          next_day_plan: string | null
          progress_percent: number | null
          project_id: string
          report_date: string
          status: Database["public"]["Enums"]["report_status"]
          submitted_by: string | null
          updated_at: string
          weather: string | null
          work_summary: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          issues?: string | null
          manpower_count?: number | null
          next_day_plan?: string | null
          progress_percent?: number | null
          project_id: string
          report_date: string
          status?: Database["public"]["Enums"]["report_status"]
          submitted_by?: string | null
          updated_at?: string
          weather?: string | null
          work_summary?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          issues?: string | null
          manpower_count?: number | null
          next_day_plan?: string | null
          progress_percent?: number | null
          project_id?: string
          report_date?: string
          status?: Database["public"]["Enums"]["report_status"]
          submitted_by?: string | null
          updated_at?: string
          weather?: string | null
          work_summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          body_markdown: string
          created_at: string
          description: string | null
          id: string
          kind: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          body_markdown: string
          created_at?: string
          description?: string | null
          id?: string
          kind: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          body_markdown?: string
          created_at?: string
          description?: string | null
          id?: string
          kind?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: string | null
          created_at: string
          doc_no: string | null
          file_url: string | null
          id: string
          project_id: string | null
          title: string
          uploaded_by: string | null
          version: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          doc_no?: string | null
          file_url?: string | null
          id?: string
          project_id?: string | null
          title: string
          uploaded_by?: string | null
          version?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          doc_no?: string | null
          file_url?: string | null
          id?: string
          project_id?: string | null
          title?: string
          uploaded_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      hse_incidents: {
        Row: {
          category: string | null
          corrective_action: string | null
          created_at: string
          description: string | null
          id: string
          incident_date: string | null
          incident_no: string | null
          project_id: string
          severity: Database["public"]["Enums"]["priority_level"]
          status: string | null
        }
        Insert: {
          category?: string | null
          corrective_action?: string | null
          created_at?: string
          description?: string | null
          id?: string
          incident_date?: string | null
          incident_no?: string | null
          project_id: string
          severity?: Database["public"]["Enums"]["priority_level"]
          status?: string | null
        }
        Update: {
          category?: string | null
          corrective_action?: string | null
          created_at?: string
          description?: string | null
          id?: string
          incident_date?: string | null
          incident_no?: string | null
          project_id?: string
          severity?: Database["public"]["Enums"]["priority_level"]
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hse_incidents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          due_date: string | null
          id: string
          invoice_no: string
          issued_date: string | null
          notes: string | null
          paid_date: string | null
          project_id: string
          status: string
          tax_amount: number | null
        }
        Insert: {
          amount: number
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_no: string
          issued_date?: string | null
          notes?: string | null
          paid_date?: string | null
          project_id: string
          status?: string
          tax_amount?: number | null
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_no?: string
          issued_date?: string | null
          notes?: string | null
          paid_date?: string | null
          project_id?: string
          status?: string
          tax_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_documents: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          slug: string
          source: string | null
          title: string
          token_estimate: number | null
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          slug: string
          source?: string | null
          title: string
          token_estimate?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          slug?: string
          source?: string | null
          title?: string
          token_estimate?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      meetings: {
        Row: {
          action_items: Json | null
          agenda: string | null
          attendees: Json | null
          created_at: string
          id: string
          location: string | null
          meeting_date: string | null
          minutes: string | null
          project_id: string | null
          title: string
        }
        Insert: {
          action_items?: Json | null
          agenda?: string | null
          attendees?: Json | null
          created_at?: string
          id?: string
          location?: string | null
          meeting_date?: string | null
          minutes?: string | null
          project_id?: string | null
          title: string
        }
        Update: {
          action_items?: Json | null
          agenda?: string | null
          attendees?: Json | null
          created_at?: string
          id?: string
          location?: string | null
          meeting_date?: string | null
          minutes?: string | null
          project_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_reports: {
        Row: {
          created_at: string
          executive_summary: string | null
          financial_summary: Json | null
          id: string
          month: string
          project_id: string
          schedule_summary: Json | null
          status: Database["public"]["Enums"]["report_status"]
        }
        Insert: {
          created_at?: string
          executive_summary?: string | null
          financial_summary?: Json | null
          id?: string
          month: string
          project_id: string
          schedule_summary?: Json | null
          status?: Database["public"]["Enums"]["report_status"]
        }
        Update: {
          created_at?: string
          executive_summary?: string | null
          financial_summary?: Json | null
          id?: string
          month?: string
          project_id?: string
          schedule_summary?: Json | null
          status?: Database["public"]["Enums"]["report_status"]
        }
        Relationships: [
          {
            foreignKeyName: "monthly_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          meta: Json
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          meta?: Json
          read_at?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          meta?: Json
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      org_settings: {
        Row: {
          created_at: string
          digest_enabled: boolean
          digest_hour_wib: number
          fallback_owner_email: string | null
          fallback_owner_phone: string | null
          id: boolean
          realtime_overflow_enabled: boolean
          updated_at: string
          wa_from_number: string | null
        }
        Insert: {
          created_at?: string
          digest_enabled?: boolean
          digest_hour_wib?: number
          fallback_owner_email?: string | null
          fallback_owner_phone?: string | null
          id?: boolean
          realtime_overflow_enabled?: boolean
          updated_at?: string
          wa_from_number?: string | null
        }
        Update: {
          created_at?: string
          digest_enabled?: boolean
          digest_hour_wib?: number
          fallback_owner_email?: string | null
          fallback_owner_phone?: string | null
          id?: boolean
          realtime_overflow_enabled?: boolean
          updated_at?: string
          wa_from_number?: string | null
        }
        Relationships: []
      }
      overflow_events: {
        Row: {
          attempted_value: string | null
          created_at: string
          field_name: string | null
          id: string
          payload: Json
          project_id: string | null
          raw_error: string | null
          table_name: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          attempted_value?: string | null
          created_at?: string
          field_name?: string | null
          id?: string
          payload?: Json
          project_id?: string | null
          raw_error?: string | null
          table_name: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          attempted_value?: string | null
          created_at?: string
          field_name?: string | null
          id?: string
          payload?: Json
          project_id?: string | null
          raw_error?: string | null
          table_name?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "overflow_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      phase_deliverables: {
        Row: {
          approved_at: string | null
          category: string
          code: string | null
          created_at: string
          created_by: string | null
          due_date: string | null
          file_url: string | null
          id: string
          name: string
          notes: string | null
          phase_key: string
          project_id: string
          required: boolean
          sequence: number
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          category?: string
          code?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          file_url?: string | null
          id?: string
          name: string
          notes?: string | null
          phase_key: string
          project_id: string
          required?: boolean
          sequence?: number
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          category?: string
          code?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          file_url?: string | null
          id?: string
          name?: string
          notes?: string | null
          phase_key?: string
          project_id?: string
          required?: boolean
          sequence?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "phase_deliverables_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          job_title: string | null
          notification_prefs: Json
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          job_title?: string | null
          notification_prefs?: Json
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          job_title?: string | null
          notification_prefs?: Json
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_milestones: {
        Row: {
          completed_at: string | null
          created_at: string
          due_date: string | null
          id: string
          name: string
          project_id: string
          status: Database["public"]["Enums"]["task_status"]
          weight: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          name: string
          project_id: string
          status?: Database["public"]["Enums"]["task_status"]
          weight?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          name?: string
          project_id?: string
          status?: Database["public"]["Enums"]["task_status"]
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_phases: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          phase_key: string
          planned_end: string | null
          planned_start: string | null
          project_id: string
          sequence: number
          status: Database["public"]["Enums"]["task_status"]
          updated_at: string
          weight: number
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          phase_key: string
          planned_end?: string | null
          planned_start?: string | null
          project_id: string
          sequence?: number
          status?: Database["public"]["Enums"]["task_status"]
          updated_at?: string
          weight?: number
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          phase_key?: string
          planned_end?: string | null
          planned_start?: string | null
          project_id?: string
          sequence?: number
          status?: Database["public"]["Enums"]["task_status"]
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_phases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          assignee_id: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          parent_id: string | null
          planned_end: string | null
          planned_start: string | null
          predecessors: string[] | null
          priority: Database["public"]["Enums"]["priority_level"]
          progress_percent: number
          project_id: string
          status: Database["public"]["Enums"]["task_status"]
          updated_at: string
          wbs_code: string | null
          weight: number | null
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
          planned_end?: string | null
          planned_start?: string | null
          predecessors?: string[] | null
          priority?: Database["public"]["Enums"]["priority_level"]
          progress_percent?: number
          project_id: string
          status?: Database["public"]["Enums"]["task_status"]
          updated_at?: string
          wbs_code?: string | null
          weight?: number | null
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          planned_end?: string | null
          planned_start?: string | null
          predecessors?: string[] | null
          priority?: Database["public"]["Enums"]["priority_level"]
          progress_percent?: number
          project_id?: string
          status?: Database["public"]["Enums"]["task_status"]
          updated_at?: string
          wbs_code?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          actual_end_date: string | null
          actual_start_date: string | null
          client_name: string | null
          code: string
          contract_value: number | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          description: string | null
          end_date: string | null
          id: string
          location: string | null
          name: string
          owner_email: string | null
          owner_name: string | null
          owner_phone: string | null
          planned_progress_percent: number
          progress_percent: number
          project_manager_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string
        }
        Insert: {
          actual_end_date?: string | null
          actual_start_date?: string | null
          client_name?: string | null
          code: string
          contract_value?: number | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          name: string
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          planned_progress_percent?: number
          progress_percent?: number
          project_manager_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
        }
        Update: {
          actual_end_date?: string | null
          actual_start_date?: string | null
          client_name?: string | null
          code?: string
          contract_value?: number | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          name?: string
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          planned_progress_percent?: number
          progress_percent?: number
          project_manager_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
        }
        Relationships: []
      }
      qaqc_inspections: {
        Row: {
          area: string | null
          created_at: string
          id: string
          inspected_date: string | null
          inspection_no: string | null
          inspection_type: string | null
          inspector_id: string | null
          notes: string | null
          project_id: string
          result: string | null
        }
        Insert: {
          area?: string | null
          created_at?: string
          id?: string
          inspected_date?: string | null
          inspection_no?: string | null
          inspection_type?: string | null
          inspector_id?: string | null
          notes?: string | null
          project_id: string
          result?: string | null
        }
        Update: {
          area?: string | null
          created_at?: string
          id?: string
          inspected_date?: string | null
          inspection_no?: string | null
          inspection_type?: string | null
          inspector_id?: string | null
          notes?: string | null
          project_id?: string
          result?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qaqc_inspections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      risks: {
        Row: {
          category: string | null
          created_at: string
          id: string
          impact: Database["public"]["Enums"]["priority_level"]
          mitigation: string | null
          owner_id: string | null
          probability: Database["public"]["Enums"]["priority_level"]
          project_id: string
          status: string | null
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          impact?: Database["public"]["Enums"]["priority_level"]
          mitigation?: string | null
          owner_id?: string | null
          probability?: Database["public"]["Enums"]["priority_level"]
          project_id: string
          status?: string | null
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          impact?: Database["public"]["Enums"]["priority_level"]
          mitigation?: string | null
          owner_id?: string | null
          probability?: Database["public"]["Enums"]["priority_level"]
          project_id?: string
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "risks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      site_photos: {
        Row: {
          caption: string | null
          created_at: string
          geotag: Json | null
          id: string
          photo_url: string
          project_id: string
          source: string | null
          taken_at: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          geotag?: Json | null
          id?: string
          photo_url: string
          project_id: string
          source?: string | null
          taken_at?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          geotag?: Json | null
          id?: string
          photo_url?: string
          project_id?: string
          source?: string | null
          taken_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_photos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      variation_orders: {
        Row: {
          amount: number | null
          approved_date: string | null
          created_at: string
          description: string | null
          id: string
          project_id: string
          status: string
          submitted_date: string | null
          time_impact_days: number | null
          title: string
          vo_no: string
        }
        Insert: {
          amount?: number | null
          approved_date?: string | null
          created_at?: string
          description?: string | null
          id?: string
          project_id: string
          status?: string
          submitted_date?: string | null
          time_impact_days?: number | null
          title: string
          vo_no: string
        }
        Update: {
          amount?: number | null
          approved_date?: string | null
          created_at?: string
          description?: string | null
          id?: string
          project_id?: string
          status?: string
          submitted_date?: string | null
          time_impact_days?: number | null
          title?: string
          vo_no?: string
        }
        Relationships: [
          {
            foreignKeyName: "variation_orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      wa_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json
          recipient_phone: string
          status: string
          template_name: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json
          recipient_phone: string
          status?: string
          template_name?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json
          recipient_phone?: string
          status?: string
          template_name?: string | null
        }
        Relationships: []
      }
      weekly_reports: {
        Row: {
          actual_progress: number | null
          created_at: string
          id: string
          planned_progress: number | null
          project_id: string
          status: Database["public"]["Enums"]["report_status"]
          submitted_by: string | null
          summary: string | null
          variance: number | null
          week_end: string
          week_start: string
        }
        Insert: {
          actual_progress?: number | null
          created_at?: string
          id?: string
          planned_progress?: number | null
          project_id: string
          status?: Database["public"]["Enums"]["report_status"]
          submitted_by?: string | null
          summary?: string | null
          variance?: number | null
          week_end: string
          week_start: string
        }
        Update: {
          actual_progress?: number | null
          created_at?: string
          id?: string
          planned_progress?: number | null
          project_id?: string
          status?: Database["public"]["Enums"]["report_status"]
          submitted_by?: string | null
          summary?: string | null
          variance?: number | null
          week_end?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_project_safe: {
        Args: { _id: string }
        Returns: {
          client_name: string
          code: string
          contract_value: number
          created_at: string
          created_by: string
          description: string
          end_date: string
          id: string
          location: string
          name: string
          progress_percent: number
          start_date: string
          status: string
          updated_at: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: never; Returns: boolean }
      list_projects_directory: {
        Args: never
        Returns: {
          client_name: string
          code: string
          contract_value: number
          created_at: string
          created_by: string
          description: string
          end_date: string
          id: string
          location: string
          name: string
          progress_percent: number
          start_date: string
          status: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "director"
        | "project_manager"
        | "site_engineer"
        | "quantity_surveyor"
        | "scheduler"
        | "qaqc"
        | "hse"
        | "finance"
        | "client"
        | "read_only"
      priority_level: "low" | "medium" | "high" | "critical"
      project_status:
        | "planning"
        | "active"
        | "on_hold"
        | "completed"
        | "cancelled"
      report_status: "draft" | "submitted" | "approved" | "rejected"
      task_status:
        | "not_started"
        | "in_progress"
        | "completed"
        | "delayed"
        | "blocked"
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
        "super_admin",
        "director",
        "project_manager",
        "site_engineer",
        "quantity_surveyor",
        "scheduler",
        "qaqc",
        "hse",
        "finance",
        "client",
        "read_only",
      ],
      priority_level: ["low", "medium", "high", "critical"],
      project_status: [
        "planning",
        "active",
        "on_hold",
        "completed",
        "cancelled",
      ],
      report_status: ["draft", "submitted", "approved", "rejected"],
      task_status: [
        "not_started",
        "in_progress",
        "completed",
        "delayed",
        "blocked",
      ],
    },
  },
} as const
