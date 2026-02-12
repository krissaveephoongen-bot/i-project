'use client';

import { useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ExpenseActionButtonsProps {
  expense: {
    id: string;
    status: string;
  };
}

export default function ExpenseActionButtons({ expense }: ExpenseActionButtonsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (newStatus: 'approved' | 'rejected') => {
    setIsLoading(true);
    setError(null);

    // TODO: This should call an API route for security, but for simplicity we call Supabase directly.
    // In a real app, you'd have: await fetch(`/api/approvals/expenses/${expense.id}`, { method: 'POST', body: JSON.stringify({ status: newStatus }) });
    
    const { error: updateError } = await supabase
      .from('expenses')
      .update({ 
        status: newStatus,
        approved_at: newStatus === 'approved' ? new Date().toISOString() : null,
        // TODO: approved_by should be set to the current logged-in manager's ID
      })
      .eq('id', expense.id);

    if (updateError) {
      setError(updateError.message);
      console.error("Failed to update expense status:", updateError);
    } else {
      // Refresh the page to show the new status
      router.refresh();
    }

    setIsLoading(false);
  };

  if (expense.status !== 'pending') {
    return <span className="text-xs text-slate-500 capitalize">{expense.status}</span>;
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-500"></div>
      ) : (
        <>
          <button 
            onClick={() => handleAction('rejected')} 
            className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors disabled:opacity-50"
            title="Reject"
            disabled={isLoading}
          >
            <X className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleAction('approved')} 
            className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors disabled:opacity-50"
            title="Approve"
            disabled={isLoading}
          >
            <Check className="w-4 h-4" />
          </button>
        </>
      )}
      {error && <p className="text-xs text-red-500">Failed!</p>}
    </div>
  );
}
