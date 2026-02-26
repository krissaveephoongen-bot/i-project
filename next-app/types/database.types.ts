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
      activity_log: {
        Row: {
          id: string;
          entity_type: string;
          entity_id: string;
          type: string;
          action: string;
          description: string | null;
          user_id: string;
          changes: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          entity_type: string;
          entity_id: string;
          type: string;
          action: string;
          description?: string | null;
          user_id: string;
          changes?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          entity_type?: string;
          entity_id?: string;
          type?: string;
          action?: string;
          description?: string | null;
          user_id?: string;
          changes?: Json | null;
          created_at?: string;
        };
      };
      approval_actions: {
        Row: {
          id: string;
          request_id: string;
          action_by: string;
          action: string;
          comments: string | null;
          action_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          action_by: string;
          action: string;
          comments?: string | null;
          action_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string;
          action_by?: string;
          action?: string;
          comments?: string | null;
          action_at?: string;
          created_at?: string;
        };
      };
      approval_requests: {
        Row: {
          id: string;
          type: string;
          request_id: string;
          title: string;
          description: string | null;
          requested_by: string;
          requested_at: string;
          status: string | null;
          priority: string | null;
          amount: number | null;
          currency: string | null;
          project_id: string | null;
          workflow_id: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          request_id: string;
          title: string;
          description?: string | null;
          requested_by: string;
          requested_at?: string;
          status?: string | null;
          priority?: string | null;
          amount?: number | null;
          currency?: string | null;
          project_id?: string | null;
          workflow_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          request_id?: string;
          title?: string;
          description?: string | null;
          requested_by?: string;
          requested_at?: string;
          status?: string | null;
          priority?: string | null;
          amount?: number | null;
          currency?: string | null;
          project_id?: string | null;
          workflow_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      approval_workflows: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          type: string;
          required_role: string;
          is_active: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          type: string;
          required_role: string;
          is_active?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          type?: string;
          required_role?: string;
          is_active?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      budget_revisions: {
        Row: {
          id: string;
          project_id: string;
          previous_budget: number;
          new_budget: number;
          reason: string;
          changed_by: string;
          changed_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          previous_budget: number;
          new_budget: number;
          reason: string;
          changed_by: string;
          changed_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          previous_budget?: number;
          new_budget?: number;
          reason?: string;
          changed_by?: string;
          changed_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          address: string | null;
          tax_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          tax_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          tax_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      contacts: {
        Row: {
          id: string;
          name: string;
          position: string | null;
          email: string | null;
          phone: string | null;
          department: string | null;
          type: string;
          client_id: string | null;
          project_id: string | null;
          user_id: string | null;
          is_key_person: boolean | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          position?: string | null;
          email?: string | null;
          phone?: string | null;
          department?: string | null;
          type: string;
          client_id?: string | null;
          project_id?: string | null;
          user_id?: string | null;
          is_key_person?: boolean | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          position?: string | null;
          email?: string | null;
          phone?: string | null;
          department?: string | null;
          type?: string;
          client_id?: string | null;
          project_id?: string | null;
          user_id?: string | null;
          is_key_person?: boolean | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          date: string;
          project_id: string;
          task_id: string | null;
          user_id: string;
          amount: number;
          category: string;
          description: string;
          receipt_url: string | null;
          status: string;
          approved_by: string | null;
          approved_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          project_id: string;
          task_id?: string | null;
          user_id: string;
          amount: number;
          category: string;
          description: string;
          receipt_url?: string | null;
          status?: string;
          approved_by?: string | null;
          approved_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          project_id?: string;
          task_id?: string | null;
          user_id?: string;
          amount?: number;
          category?: string;
          description?: string;
          receipt_url?: string | null;
          status?: string;
          approved_by?: string | null;
          approved_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          thread_id: string;
          sender_id: string;
          body: string;
          metadata: Json | null;
          created_at: string | null;
          edited_at: string | null;
        };
        Insert: {
          id?: string;
          thread_id: string;
          sender_id: string;
          body: string;
          metadata?: Json | null;
          created_at?: string | null;
          edited_at?: string | null;
        };
        Update: {
          id?: string;
          thread_id?: string;
          sender_id?: string;
          body?: string;
          metadata?: Json | null;
          created_at?: string | null;
          edited_at?: string | null;
        };
      };
      milestones: {
        Row: {
          id: string;
          project_id: string | null;
          title: string;
          description: string | null;
          due_date: string | null;
          status: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          title: string;
          description?: string | null;
          due_date?: string | null;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          title?: string;
          description?: string | null;
          due_date?: string | null;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          avatar_url: string | null;
          role: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          avatar_url?: string | null;
          role?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          avatar_url?: string | null;
          role?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          status: string | null;
          start_date: string | null;
          end_date: string | null;
          budget: number | null;
          manager_id: string | null;
          client_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          status?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          budget?: number | null;
          manager_id?: string | null;
          client_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          status?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          budget?: number | null;
          manager_id?: string | null;
          client_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      risks: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          probability: string | null;
          impact: string | null;
          status: string | null;
          mitigation_plan: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          probability?: string | null;
          impact?: string | null;
          status?: string | null;
          mitigation_plan?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          description?: string | null;
          probability?: string | null;
          impact?: string | null;
          status?: string | null;
          mitigation_plan?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      tasks: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          status: string | null;
          priority: string | null;
          assignee_id: string | null;
          due_date: string | null;
          estimated_hours: number | null;
          actual_hours: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          status?: string | null;
          priority?: string | null;
          assignee_id?: string | null;
          due_date?: string | null;
          estimated_hours?: number | null;
          actual_hours?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          description?: string | null;
          status?: string | null;
          priority?: string | null;
          assignee_id?: string | null;
          due_date?: string | null;
          estimated_hours?: number | null;
          actual_hours?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      team_structure: {
        Row: {
          id: string;
          name: string;
          role: string | null;
          parent_id: string | null;
          level: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          role?: string | null;
          parent_id?: string | null;
          level?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          role?: string | null;
          parent_id?: string | null;
          level?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      thread_members: {
        Row: {
          thread_id: string;
          user_id: string;
          joined_at: string | null;
        };
        Insert: {
          thread_id: string;
          user_id: string;
          joined_at?: string | null;
        };
        Update: {
          thread_id?: string;
          user_id?: string;
          joined_at?: string | null;
        };
      };
      threads: {
        Row: {
          id: string;
          title: string | null;
          created_by: string;
          created_at: string | null;
          updated_at: string | null;
          last_message_at: string | null;
        };
        Insert: {
          id?: string;
          title?: string | null;
          created_by: string;
          created_at?: string | null;
          updated_at?: string | null;
          last_message_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string | null;
          created_by?: string;
          created_at?: string | null;
          updated_at?: string | null;
          last_message_at?: string | null;
        };
      };
      time_entries: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          task_id: string | null;
          description: string | null;
          hours: number | null;
          date: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          task_id?: string | null;
          description?: string | null;
          hours?: number | null;
          date?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string | null;
          task_id?: string | null;
          description?: string | null;
          hours?: number | null;
          date?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      timesheet_weeks: {
        Row: {
          id: string;
          user_id: string;
          week_start: string;
          total_hours: number | null;
          status: string | null;
          submitted_at: string | null;
          approved_at: string | null;
          approved_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_start: string;
          total_hours?: number | null;
          status?: string | null;
          submitted_at?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          week_start?: string;
          total_hours?: number | null;
          status?: string | null;
          submitted_at?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      timesheets: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          task_id: string | null;
          date: string;
          hours: number;
          description: string | null;
          status: string | null;
          approved_by: string | null;
          approved_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          task_id?: string | null;
          date: string;
          hours: number;
          description?: string | null;
          status?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string | null;
          task_id?: string | null;
          date?: string;
          hours?: number;
          description?: string | null;
          status?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      users: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          role: string | null;
          department: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          role?: string | null;
          department?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          role?: string | null;
          department?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Common type aliases for convenience
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
export type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];

export type User = Database["public"]["Tables"]["users"]["Row"];
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
export type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];

export type Timesheet = Database["public"]["Tables"]["timesheets"]["Row"];
export type TimesheetInsert =
  Database["public"]["Tables"]["timesheets"]["Insert"];
export type TimesheetUpdate =
  Database["public"]["Tables"]["timesheets"]["Update"];

export type TimesheetWeek =
  Database["public"]["Tables"]["timesheet_weeks"]["Row"];
export type TimesheetWeekInsert =
  Database["public"]["Tables"]["timesheet_weeks"]["Insert"];
export type TimesheetWeekUpdate =
  Database["public"]["Tables"]["timesheet_weeks"]["Update"];

export type TimesheetEntry = any;
export type TimesheetEntryInsert = any;
export type TimesheetEntryUpdate = any;

export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"];
export type ClientUpdate = Database["public"]["Tables"]["clients"]["Update"];

export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];
export type MessageUpdate = Database["public"]["Tables"]["messages"]["Update"];

export type Thread = Database["public"]["Tables"]["threads"]["Row"];
export type ThreadInsert = Database["public"]["Tables"]["threads"]["Insert"];
export type ThreadUpdate = Database["public"]["Tables"]["threads"]["Update"];

export type Comment = Database["public"]["Tables"]["comments"]["Row"];
export type CommentInsert = Database["public"]["Tables"]["comments"]["Insert"];
export type CommentUpdate = Database["public"]["Tables"]["comments"]["Update"];

export type Expense = Database["public"]["Tables"]["expenses"]["Row"];
export type ExpenseInsert = Database["public"]["Tables"]["expenses"]["Insert"];
export type ExpenseUpdate = Database["public"]["Tables"]["expenses"]["Update"];

export type Risk = Database["public"]["Tables"]["risks"]["Row"];
export type RiskInsert = Database["public"]["Tables"]["risks"]["Insert"];
export type RiskUpdate = Database["public"]["Tables"]["risks"]["Update"];

export type Milestone = Database["public"]["Tables"]["milestones"]["Row"];
export type MilestoneInsert =
  Database["public"]["Tables"]["milestones"]["Insert"];
export type MilestoneUpdate =
  Database["public"]["Tables"]["milestones"]["Update"];

export type ApprovalRequest =
  Database["public"]["Tables"]["approval_requests"]["Row"];
export type ApprovalRequestInsert =
  Database["public"]["Tables"]["approval_requests"]["Insert"];
export type ApprovalRequestUpdate =
  Database["public"]["Tables"]["approval_requests"]["Update"];

export type ActivityLog = Database["public"]["Tables"]["activity_log"]["Row"];
export type ActivityLogInsert =
  Database["public"]["Tables"]["activity_log"]["Insert"];
export type ActivityLogUpdate =
  Database["public"]["Tables"]["activity_log"]["Update"];

// Joined types for common queries
export type ProjectWithManager = Project & {
  manager: User | null;
  client: Client | null;
  tasks: Task[];
  risks: Risk[];
  milestones: Milestone[];
};

export type TaskWithProject = Task & {
  project: Project | null;
  assignee: User | null;
  comments: Comment[];
};

export type TimesheetWithDetails = Timesheet & {
  user: User | null;
  project: Project | null;
  task: Task | null;
};

export type MessageWithSender = Message & {
  sender: User | null;
  thread: Thread | null;
};

export type ThreadWithDetails = Thread & {
  created_by_user: User | null;
  members: (User & { thread_members: { joined_at: string | null } })[];
  messages: MessageWithSender[];
};

// Enums based on schema constraints
export type ProjectStatus =
  | "planning"
  | "active"
  | "on_hold"
  | "completed"
  | "cancelled";
export type TaskStatus =
  | "todo"
  | "in_progress"
  | "review"
  | "completed"
  | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TimesheetStatus = "draft" | "submitted" | "approved" | "rejected";
export type ExpenseStatus = "pending" | "approved" | "rejected";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type RiskProbability = "low" | "medium" | "high";
export type RiskImpact = "low" | "medium" | "high";
export type UserRole = "admin" | "manager" | "member" | "viewer";
