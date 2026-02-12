'use client';

import { useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TimesheetActionButtonsProps {
  submission: {
    id: string;
    status: string;
  };
}

export default function TimesheetActionButtons({ submission }: TimesheetActionButtonsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleAction = async (newStatus: 'approved' | 'rejected', reason?: string) => {
    setIsLoading(true);
    setError(null);

    // This will fail until the 'timesheet_submissions' table is created in the database.
    const { error: updateError } = await supabase
      .from('timesheet_submissions')
      .update({ 
        status: newStatus,
        approved_at: newStatus === 'approved' ? new Date().toISOString() : null,
        rejection_reason: newStatus === 'rejected' ? reason : null,
        // TODO: approved_by should be set to the current logged-in manager's ID
      })
      .eq('id', submission.id);

    if (updateError) {
      setError(`Failed: ${updateError.message}. Ensure 'timesheet_submissions' table exists.`);
      console.error("Failed to update submission status:", updateError);
    } else {
      setShowRejectReason(false);
      router.refresh();
    }

    setIsLoading(false);
  };

  if (submission.status !== 'pending') {
    return <span className="text-xs text-slate-500 capitalize">{submission.status}</span>;
  }

  if (showRejectReason) {
    return (
        <div className="flex flex-col items-end gap-2">
            <input 
                type="text"
                placeholder="Reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full text-xs border-slate-300 rounded-md p-1"
            />
            <div className="flex gap-2">
                <button onClick={() => setShowRejectReason(false)} className="text-xs hover:underline text-slate-600">Cancel</button>
                <button 
                    onClick={() => handleAction('rejected', rejectionReason)} 
                    className="text-xs bg-red-600 text-white px-2 py-1 rounded-md hover:bg-red-700 disabled:bg-red-300"
                    disabled={isLoading || !rejectionReason}
                >
                    {isLoading ? 'Saving...' : 'Confirm Reject'}
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-500"></div>
      ) : (
        <>
          <button 
            onClick={() => setShowRejectReason(true)} 
            className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
            title="Reject"
          >
            <X className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleAction('approved')} 
            className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
            title="Approve"
          >
            <Check className="w-4 h-4" />
          </button>
        </>
      )}
      {error && <p className="text-xs text-red-500 truncate" title={error}>Failed!</p>}
    </div>
  );
}
