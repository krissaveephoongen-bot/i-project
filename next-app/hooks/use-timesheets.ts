import { useState, useEffect } from 'react'
import { TimesheetService } from '../lib/services/timesheets'
import { TimesheetWithDetails } from '../types/database.types'

export function useTimesheets() {
  const [timesheets, setTimesheets] = useState<TimesheetWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTimesheets = async () => {
      try {
        setLoading(true)
        const data = await TimesheetService.fetchTimesheets()
        setTimesheets(data)
        setError(null)
      } catch (err) {
        setError('Failed to fetch timesheets')
        console.error('Error fetching timesheets:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTimesheets()
  }, [])

  const refreshTimesheets = async () => {
    try {
      setLoading(true)
      const data = await TimesheetService.fetchTimesheets()
      setTimesheets(data)
      setError(null)
    } catch (err) {
      setError('Failed to refresh timesheets')
      console.error('Error refreshing timesheets:', err)
    } finally {
      setLoading(false)
    }
  }

  const createTimesheet = async (timesheet: any) => {
    try {
      const newTimesheet = await TimesheetService.createTimesheet(timesheet)
      setTimesheets(prev => [...prev, newTimesheet as TimesheetWithDetails])
      return newTimesheet
    } catch (err) {
      console.error('Error creating timesheet:', err)
      throw err
    }
  }

  const updateTimesheet = async (id: string, updates: any) => {
    try {
      const updatedTimesheet = await TimesheetService.updateTimesheet(id, updates)
      setTimesheets(prev => 
        prev.map(ts => ts.id === id ? { ...ts, ...updatedTimesheet } : ts)
      )
      return updatedTimesheet
    } catch (err) {
      console.error('Error updating timesheet:', err)
      throw err
    }
  }

  const deleteTimesheet = async (id: string) => {
    try {
      await TimesheetService.deleteTimesheet(id)
      setTimesheets(prev => prev.filter(ts => ts.id !== id))
    } catch (err) {
      console.error('Error deleting timesheet:', err)
      throw err
    }
  }

  const approveTimesheet = async (id: string, approvedBy: string) => {
    try {
      const approvedTimesheet = await TimesheetService.approveTimesheet(id, approvedBy)
      setTimesheets(prev => 
        prev.map(ts => ts.id === id ? { ...ts, ...approvedTimesheet } : ts)
      )
      return approvedTimesheet
    } catch (err) {
      console.error('Error approving timesheet:', err)
      throw err
    }
  }

  return {
    timesheets,
    loading,
    error,
    refreshTimesheets,
    createTimesheet,
    updateTimesheet,
    deleteTimesheet,
    approveTimesheet
  }
}

export function useUserTimesheets(userId: string) {
  const [timesheets, setTimesheets] = useState<TimesheetWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return

    const fetchUserTimesheets = async () => {
      try {
        setLoading(true)
        const data = await TimesheetService.fetchTimesheetsByUser(userId)
        setTimesheets(data)
        setError(null)
      } catch (err) {
        setError('Failed to fetch user timesheets')
        console.error('Error fetching user timesheets:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserTimesheets()
  }, [userId])

  return {
    timesheets,
    loading,
    error
  }
}
