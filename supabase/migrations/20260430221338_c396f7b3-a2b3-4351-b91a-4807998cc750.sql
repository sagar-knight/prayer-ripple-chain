
-- Phase 1: Translation system - additive only

-- 1. Profile language preference (nullable, additive)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_language_code text,
  ADD COLUMN IF NOT EXISTS preferred_language_name text;

-- 2. Translation cache table
CREATE TABLE IF NOT EXISTS public.prayer_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_request_id text NOT NULL,
  source_type text NOT NULL DEFAULT 'global',
  source_language_code text,
  target_language_code text NOT NULL,
  translated_title text,
  translated_body text,
  provider text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (prayer_request_id, source_type, target_language_code)
);

CREATE INDEX IF NOT EXISTS idx_prayer_translations_lookup
  ON public.prayer_translations (prayer_request_id, source_type, target_language_code);

ALTER TABLE public.prayer_translations ENABLE ROW LEVEL SECURITY;

-- Authenticated users may read cached translations (visibility is enforced by the
-- edge function before insert; reading a cached row only exposes content the user
-- could already view through the existing prayer policies).
CREATE POLICY "Authenticated can read translations"
  ON public.prayer_translations
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can directly write/update via the API. The edge function uses the
-- service role and bypasses RLS for cache writes.
CREATE POLICY "Admins can manage translations"
  ON public.prayer_translations
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. Translation events log (uses existing app_events; no schema change needed)
