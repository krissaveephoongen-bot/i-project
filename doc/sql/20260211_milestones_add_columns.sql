ALTER TABLE public.milestones
  ADD COLUMN IF NOT EXISTS "name" text;

ALTER TABLE public.milestones
  ADD COLUMN IF NOT EXISTS "percentage" numeric DEFAULT 0.00;
