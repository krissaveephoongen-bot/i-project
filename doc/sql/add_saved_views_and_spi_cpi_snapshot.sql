-- Saved views per user per page
CREATE TABLE IF NOT EXISTS public.saved_views (
  id text PRIMARY KEY,
  userId text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  pageKey text NOT NULL,
  name text NOT NULL,
  filters jsonb NOT NULL,
  createdAt timestamp with time zone DEFAULT now(),
  updatedAt timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS saved_views_user_page_idx ON public.saved_views(userId, pageKey);

-- SPI/CPI daily snapshot per project
CREATE TABLE IF NOT EXISTS public.spi_cpi_daily_snapshot (
  id text PRIMARY KEY,
  projectId text NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  date date NOT NULL,
  spi numeric NOT NULL,
  cpi numeric NOT NULL,
  createdAt timestamp with time zone DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS spi_cpi_daily_snapshot_unique ON public.spi_cpi_daily_snapshot(projectId, date);

-- Basic RLS policies enabling users to read their saved views; admins/managers can read all
ALTER TABLE public.saved_views ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'saved_views' AND policyname = 'saved_views_read_own'
  ) THEN
    CREATE POLICY saved_views_read_own ON public.saved_views
      FOR SELECT USING (auth.uid()::text = userId);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'saved_views' AND policyname = 'saved_views_insert_own'
  ) THEN
    CREATE POLICY saved_views_insert_own ON public.saved_views
      FOR INSERT WITH CHECK (auth.uid()::text = userId);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'saved_views' AND policyname = 'saved_views_delete_own'
  ) THEN
    CREATE POLICY saved_views_delete_own ON public.saved_views
      FOR DELETE USING (auth.uid()::text = userId);
  END IF;
END $$;

-- Snapshots are read-only for clients; write via service role only
ALTER TABLE public.spi_cpi_daily_snapshot ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'spi_cpi_daily_snapshot' AND policyname = 'spi_cpi_daily_snapshot_read_all'
  ) THEN
    CREATE POLICY spi_cpi_daily_snapshot_read_all ON public.spi_cpi_daily_snapshot
      FOR SELECT USING (true);
  END IF;
END $$;

