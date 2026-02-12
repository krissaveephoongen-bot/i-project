import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { ApprovalRequest, Timesheet, Expense } from '../types/database.types'

interface PendingItem {
  id: string
  type: string
  date: string
  icon: string
  title: string
  amount?: number
  status: string
  raw: any
}

export function useApprovals() {
  const [approvals, setApprovals] = useState<PendingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        setLoading(true)
        
        // Fetch pending timesheets
        const { data: timesheets, error: timesheetError } = await supabase
          .from('timesheets')
          .select(`
            *,
            user:users(id, name, email),
            project:projects(id, name)
          `)
          .eq('status', 'pending')
          .order('date', { ascending: false })
          .limit(10)

        // Fetch pending expenses
        const { data: expenses, error: expenseError } = await supabase
          .from('expenses')
          .select(`
            *,
            user:users(id, name, email),
            project:projects(id, name)
          `)
          .eq('status', 'pending')
          .order('date', { ascending: false })
          .limit(10)

        // Fetch pending approval requests
        const { data: approvalRequests, error: approvalError } = await supabase
          .from('approval_requests')
          .select(`
            *,
            requested_by_user:users(id, name, email),
            project:projects(id, name)
          `)
          .eq('status', 'pending')
          .order('requested_at', { ascending: false })
          .limit(10)

        const pendingItems: PendingItem[] = []

        // Process timesheets
        if (!timesheetError && timesheets) {
          timesheets.forEach((timesheet: any) => {
            pendingItems.push({
              id: timesheet.id,
              type: 'Timesheet',
              date: timesheet.date,
              icon: 'clock',
              title: `${timesheet.user?.name || 'Unknown'} - ${timesheet.project?.name || 'General'}`,
              amount: timesheet.hours,
              status: timesheet.status,
              raw: timesheet
            })
          })
        }

        // Process expenses
        if (!expenseError && expenses) {
          expenses.forEach((expense: any) => {
            pendingItems.push({
              id: expense.id,
              type: 'Expense',
              date: expense.date,
              icon: 'receipt',
              title: `${expense.user?.name || 'Unknown'} - ${expense.description}`,
              amount: expense.amount,
              status: expense.status,
              raw: expense
            })
          })
        }

        // Process approval requests
        if (!approvalError && approvalRequests) {
          approvalRequests.forEach((request: any) => {
            pendingItems.push({
              id: request.id,
              type: request.type,
              date: request.requested_at,
              icon: 'file-text',
              title: request.title,
              amount: request.amount,
              status: request.status,
              raw: request
            })
          })
        }

        // Sort by date (most recent first) and limit to 5
        pendingItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setApprovals(pendingItems.slice(0, 5))
        
        setError(null)
      } catch (err) {
        setError('Failed to fetch approvals')
        console.error('Error fetching approvals:', err)
        setApprovals([])
      } finally {
        setLoading(false)
      }
    }

    fetchApprovals()
  }, [])

  const refreshApprovals = async () => {
    // Re-fetch approvals
    setLoading(true)
    // ... (same logic as above)
    setLoading(false)
  }

  const approveItem = async (id: string, type: string) => {
    try {
      if (type === 'Timesheet') {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase
            .from('timesheets')
            .update({ 
              status: 'approved', 
              approved_by: user.id, 
              approved_at: new Date().toISOString() 
            })
            .eq('id', id)
        }
      } else if (type === 'Expense') {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase
            .from('expenses')
            .update({ 
              status: 'approved', 
              approved_by: user.id, 
              approved_at: new Date().toISOString() 
            })
            .eq('id', id)
        }
      } else if (type === 'Approval Request') {
        // Handle approval request approval
        await supabase
          .from('approval_requests')
          .update({ status: 'approved' })
          .eq('id', id)
      }

      // Refresh the list
      refreshApprovals()
    } catch (err) {
      console.error('Error approving item:', err)
      throw err
    }
  }

  const rejectItem = async (id: string, type: string) => {
    try {
      if (type === 'Timesheet') {
        await supabase
          .from('timesheets')
          .update({ status: 'rejected' })
          .eq('id', id)
      } else if (type === 'Expense') {
        await supabase
          .from('expenses')
          .update({ status: 'rejected' })
          .eq('id', id)
      } else if (type === 'Approval Request') {
        await supabase
          .from('approval_requests')
          .update({ status: 'rejected' })
          .eq('id', id)
      }

      // Refresh the list
      refreshApprovals()
    } catch (err) {
      console.error('Error rejecting item:', err)
      throw err
    }
  }

  return {
    approvals,
    loading,
    error,
    refreshApprovals,
    approveItem,
    rejectItem
  }
}
