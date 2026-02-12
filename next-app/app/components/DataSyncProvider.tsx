'use client';

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/app/lib/supabaseClient'

export default function DataSyncProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient()

  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('table-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload: any) => {
        qc.invalidateQueries({ queryKey: ['projects'] })
        qc.invalidateQueries({ queryKey: ['clients'] })
        qc.invalidateQueries({ queryKey: ['dashboard'] })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload: any) => {
        qc.invalidateQueries({ queryKey: ['tasks'] })
        qc.invalidateQueries({ queryKey: ['reports'] })
        qc.invalidateQueries({ queryKey: ['approvals:timesheets'] })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'time_entries' }, (payload: any) => {
        qc.invalidateQueries({ queryKey: ['approvals:timesheets'] })
        qc.invalidateQueries({ queryKey: ['reports'] })
        qc.invalidateQueries({ queryKey: ['dashboard'] })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, (payload: any) => {
        qc.invalidateQueries({ queryKey: ['approvals:expenses'] })
        qc.invalidateQueries({ queryKey: ['reports'] })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [qc])

  return <>{children}</>
}
