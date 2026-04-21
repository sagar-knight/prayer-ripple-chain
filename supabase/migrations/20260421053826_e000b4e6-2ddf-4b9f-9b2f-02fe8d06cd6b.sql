-- Backfill any null user_id rows would be needed, but RLS prevented inserts
-- without user_id since policy requires user_id = auth.uid(). Safe to enforce.
ALTER TABLE public.prayer_actions
  ALTER COLUMN user_id SET NOT NULL;