-- Add rejectedReason column to record structured rejection reason without polluting description
ALTER TABLE public.time_entries
  ADD COLUMN IF NOT EXISTS "rejectedReason" text;

ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS "rejectedReason" text;

-- Optional helpful indexes for approvals queues
CREATE INDEX IF NOT EXISTS idx_time_entries_status_date ON public.time_entries(status, date);
CREATE INDEX IF NOT EXISTS idx_expenses_status_date ON public.expenses(status, date);
