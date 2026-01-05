export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'manager' | 'member'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'member'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'member'
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          status: string
          start_date: string | null
          due_date: string | null
          budget: number | null
          manager_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: string
          start_date?: string | null
          due_date?: string | null
          budget?: number | null
          manager_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: string
          start_date?: string | null
          due_date?: string | null
          budget?: number | null
          manager_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          status: 'todo' | 'in_progress' | 'in_review' | 'done'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          due_date: string | null
          assignee_id: string | null
          estimated_hours: number | null
          actual_hours: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'in_review' | 'done'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          assignee_id?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'in_review' | 'done'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          assignee_id?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      time_entries: {
        Row: {
          id: string
          user_id: string
          task_id: string | null
          project_id: string | null
          description: string | null
          start_time: string
          end_time: string | null
          duration_minutes: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          task_id?: string | null
          project_id?: string | null
          description?: string | null
          start_time: string
          end_time?: string | null
          duration_minutes?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          task_id?: string | null
          project_id?: string | null
          description?: string | null
          start_time?: string
          end_time?: string | null
          duration_minutes?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      // Add other tables as needed
    }
    Views: {
      task_stats: {
        Row: {
          project_id: string | null
          project_name: string | null
          total_tasks: number | null
          todo_count: number | null
          in_progress_count: number | null
          in_review_count: number | null
          done_count: number | null
          total_estimated_hours: number | null
          total_actual_hours: number | null
        }
      }
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: 'admin' | 'manager' | 'member'
      }
      is_project_member: {
        Args: { project_id_param: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: 'admin' | 'manager' | 'member'
      task_status: 'todo' | 'in_progress' | 'in_review' | 'done'
      priority_level: 'low' | 'medium' | 'high' | 'urgent'
    }
  }
}
