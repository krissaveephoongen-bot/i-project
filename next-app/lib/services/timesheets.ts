import { supabase } from '../supabaseClient'
import { 
  Timesheet, 
  TimesheetInsert, 
  TimesheetUpdate, 
  TimesheetWithDetails,
  TimesheetWeek,
  TimesheetEntry,
  TimesheetWeekInsert,
  TimesheetEntryInsert
} from '../../types/database.types'

export class TimesheetService {
  // Fetch all timesheets with user, project, and task details
  static async fetchTimesheets(): Promise<TimesheetWithDetails[]> {
    const { data, error } = await supabase
      .from('time_entries')
      .select(`
        *,
        user:users(id, name, email, role),
        project:projects(id, name, status),
        task:tasks(id, title, status)
      `)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching timesheets:', error)
      throw new Error('Failed to fetch timesheets')
    }

    return data as TimesheetWithDetails[]
  }

  // Fetch timesheets for a specific user
  static async fetchTimesheetsByUser(userId: string): Promise<TimesheetWithDetails[]> {
    const { data, error } = await supabase
      .from('time_entries')
      .select(`
        *,
        user:users(id, name, email, role),
        project:projects(id, name, status),
        task:tasks(id, title, status)
      `)
      .eq('userId', userId)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching user timesheets:', error)
      throw new Error('Failed to fetch user timesheets')
    }

    return data as TimesheetWithDetails[]
  }

  // Fetch timesheets for a specific project
  static async fetchTimesheetsByProject(projectId: string): Promise<TimesheetWithDetails[]> {
    const { data, error } = await supabase
      .from('time_entries')
      .select(`
        *,
        user:users(id, name, email, role),
        project:projects(id, name, status),
        task:tasks(id, title, status)
      `)
      .eq('projectId', projectId)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching project timesheets:', error)
      throw new Error('Failed to fetch project timesheets')
    }

    return data as TimesheetWithDetails[]
  }

  // Create a new timesheet entry
  static async createTimesheet(timesheet: TimesheetInsert): Promise<Timesheet> {
    const { data, error } = await supabase
      .from('time_entries')
      .insert(timesheet)
      .select()
      .single()

    if (error) {
      console.error('Error creating timesheet:', error)
      throw new Error('Failed to create timesheet')
    }

    return data as Timesheet
  }

  // Update an existing timesheet
  static async updateTimesheet(id: string, updates: TimesheetUpdate): Promise<Timesheet> {
    const { data, error } = await supabase
      .from('time_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating timesheet:', error)
      throw new Error('Failed to update timesheet')
    }

    return data as Timesheet
  }

  // Delete a timesheet entry
  static async deleteTimesheet(id: string): Promise<void> {
    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting timesheet:', error)
      throw new Error('Failed to delete timesheet')
    }
  }

  // Update timesheet status
  static async updateTimesheetStatus(id: string, status: string): Promise<Timesheet> {
    return this.updateTimesheet(id, { status })
  }

  // Approve timesheet
  static async approveTimesheet(id: string, approvedBy: string): Promise<Timesheet> {
    const { data, error } = await supabase
      .from('time_entries')
      .update({ 
        status: 'approved', 
        approvedBy: approvedBy, 
        approvedAt: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error approving timesheet:', error)
      throw new Error('Failed to approve timesheet')
    }

    return data as Timesheet
  }

  // Reject timesheet
  static async rejectTimesheet(id: string): Promise<Timesheet> {
    return this.updateTimesheet(id, { status: 'rejected' })
  }

  // Fetch timesheet weeks for a user
  static async fetchTimesheetWeeks(userId: string): Promise<TimesheetWeek[]> {
    const { data, error } = await supabase
      .from('timesheet_weeks')
      .select('*')
      .eq('userId', userId)
      .order('weekStart', { ascending: false })

    if (error) {
      console.error('Error fetching timesheet weeks:', error)
      throw new Error('Failed to fetch timesheet weeks')
    }

    return data as TimesheetWeek[]
  }

  // Create or update timesheet week
  static async upsertTimesheetWeek(week: TimesheetWeekInsert): Promise<TimesheetWeek> {
    const { data, error } = await supabase
      .from('timesheet_weeks')
      .upsert(week, { onConflict: 'userId,weekStart' })
      .select()
      .single()

    if (error) {
      console.error('Error upserting timesheet week:', error)
      throw new Error('Failed to upsert timesheet week')
    }

    return data as TimesheetWeek
  }

  // Fetch timesheet entries for a week
  static async fetchTimesheetEntries(weekId: string): Promise<TimesheetEntry[]> {
    const { data, error } = await supabase
      .from('timesheet_entries')
      .select(`
        *,
        project:projects(id, name)
      `)
      .eq('timesheetWeekId', weekId)
      .order('dayOfWeek', { ascending: true })

    if (error) {
      console.error('Error fetching timesheet entries:', error)
      throw new Error('Failed to fetch timesheet entries')
    }

    return data as TimesheetEntry[]
  }

  // Create timesheet entry
  static async createTimesheetEntry(entry: TimesheetEntryInsert): Promise<TimesheetEntry> {
    const { data, error } = await supabase
      .from('timesheet_entries')
      .insert(entry)
      .select()
      .single()

    if (error) {
      console.error('Error creating timesheet entry:', error)
      throw new Error('Failed to create timesheet entry')
    }

    return data as TimesheetEntry
  }

  // Update timesheet entry
  static async updateTimesheetEntry(id: string, hours: number, description?: string): Promise<TimesheetEntry> {
    const { data, error } = await supabase
      .from('timesheet_entries')
      .update({ hours, description })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating timesheet entry:', error)
      throw new Error('Failed to update timesheet entry')
    }

    return data as TimesheetEntry
  }

  // Delete timesheet entry
  static async deleteTimesheetEntry(id: string): Promise<void> {
    const { error } = await supabase
      .from('timesheet_entries')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting timesheet entry:', error)
      throw new Error('Failed to delete timesheet entry')
    }
  }

  // Get timesheet summary for a date range
  static async getTimesheetSummary(userId: string, startDate: string, endDate: string): Promise<any> {
    const { data, error } = await supabase
      .from('time_entries')
      .select(`
        *,
        project:projects(id, name)
      `)
      .eq('userId', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching timesheet summary:', error)
      throw new Error('Failed to fetch timesheet summary')
    }

    return data
  }
}
