import { useState, useEffect } from 'react'
import { WeeklySummaryService, WeeklySummary } from '../lib/services/weekly-summary'

export function useWeeklySummary(userId?: string) {
  const [summary, setSummary] = useState<WeeklySummary>({
    hoursWorked: 0,
    tasksCompleted: 0,
    meetingsAttended: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeeklySummary = async () => {
      try {
        setLoading(true)
        const data = await WeeklySummaryService.getWeeklySummary(userId)
        setSummary(data)
        setError(null)
      } catch (err) {
        setError('Failed to fetch weekly summary')
        console.error('Error fetching weekly summary:', err)
        setSummary({
          hoursWorked: 0,
          tasksCompleted: 0,
          meetingsAttended: 0
        })
      } finally {
        setLoading(false)
      }
    }

    fetchWeeklySummary()
  }, [userId])

  const refreshSummary = async () => {
    try {
      setLoading(true)
      const data = await WeeklySummaryService.getWeeklySummary(userId)
      setSummary(data)
      setError(null)
    } catch (err) {
      setError('Failed to refresh weekly summary')
      console.error('Error refreshing weekly summary:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    summary,
    loading,
    error,
    refreshSummary
  }
}