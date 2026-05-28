-- Enable Supabase Realtime broadcasts for live prayer counts and live activity feed.
-- REPLICA IDENTITY FULL ensures UPDATE payloads include the previous row for change tracking.
ALTER TABLE public.prayer_coverage REPLICA IDENTITY FULL;
ALTER TABLE public.prayer_actions REPLICA IDENTITY FULL;

-- Add the tables to the realtime publication so clients can subscribe to changes.
-- Wrapped in DO blocks to be idempotent if a table is already in the publication.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'prayer_coverage'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.prayer_coverage;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'prayer_actions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.prayer_actions;
  END IF;
END $$;