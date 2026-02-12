'use client';

import { useState } from 'react'
import Header from '@/app/components/Header'

export const dynamic = 'force-dynamic';

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { getPendingTimesheets, updateTimesheetApproval } from '@/app/lib/approvals'
import ApprovalModal from '../components/ApprovalModal'
import { Button } from '@/app/components/ui/Button'
import { Card, CardContent } from '@/app/components/ui/card'

export default function TimesheetApprovalsPage() {
  const qc = useQueryClient()
  const { data = [], isLoading } = useQuery({
    queryKey: ['approvals:timesheets'],
    queryFn: getPendingTimesheets,
  })

  const [selected, setSelected] = useState<{ id: string, label: string } | null>(null)
  const [mode, setMode] = useState<'approve' | 'reject'>('approve')
  const [open, setOpen] = useState(false)

  const mutate = useMutation({
    mutationFn: ({ id, action, reason }: { id: string, action: 'approve' | 'reject', reason?: string }) =>
      updateTimesheetApproval(id, action, { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['approvals:timesheets'] })
      setOpen(false)
      setSelected(null)
    },
  })

  const openModal = (id: string, label: string, action: 'approve' | 'reject') => {
    setSelected({ id, label })
    setMode(action)
    setOpen(true)
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header title="อนุมัติเวลาทำงาน (Timesheets)" breadcrumbs={[{ label: 'Workspace', href: '/' }, { label: 'Approvals' }, { label: 'Timesheets' }]} />
      <div className="container mx-auto px-6 py-8 pt-24">
        <Card>
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">รายการที่รออนุมัติ</h2>
                <p className="text-sm text-slate-500">{data.length} รายการ</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">วันที่</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">ผู้ใช้</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">โครงการ</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">งาน</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">ชั่วโมง</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">คำอธิบาย</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">เหตุผลปฏิเสธ</th>
                    <th className="text-right py-3 px-6 text-sm font-medium text-slate-600">การกระทำ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr><td colSpan={5} className="py-8 px-6 text-center text-slate-500">กำลังโหลด...</td></tr>
                  ) : data.length === 0 ? (
                    <tr><td colSpan={5} className="py-8 px-6 text-center text-slate-500">ไม่มีรายการรออนุมัติ</td></tr>
                  ) : data.map((row: any) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="py-3 px-6 text-sm">{new Date(row.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      <td className="py-3 px-6 text-sm">{row.user?.name || row.userId}</td>
                      <td className="py-3 px-6 text-sm">{row.project?.name || '-'}</td>
                      <td className="py-3 px-6 text-sm">{row.task?.title || '-'}</td>
                      <td className="py-3 px-6 text-sm">{Number(row.hours || 0).toFixed(2)}</td>
                      <td className="py-3 px-6 text-sm text-slate-600">{row.description || '-'}</td>
                      <td className="py-3 px-6 text-sm text-slate-600">{row.rejectedReason || '-'}</td>
                      <td className="py-3 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button className="bg-green-600 hover:bg-green-700" onClick={() => openModal(row.id, `ชั่วโมง ${row.hours}`, 'approve')}>อนุมัติ</Button>
                          <Button variant="destructive" onClick={() => openModal(row.id, `ชั่วโมง ${row.hours}`, 'reject')}>ปฏิเสธ</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <ApprovalModal
        isOpen={open}
        mode={mode}
        label={selected?.label}
        onClose={() => setOpen(false)}
        onConfirm={(reason?: string) => {
          if (!selected) return
          mutate.mutate({ id: selected.id, action: mode, reason })
        }}
      />
    </div>
  )
}
