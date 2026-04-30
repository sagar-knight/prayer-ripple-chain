
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS country_name text,
  ADD COLUMN IF NOT EXISTS last_login_country_code text,
  ADD COLUMN IF NOT EXISTS last_login_country_name text,
  ADD COLUMN IF NOT EXISTS last_login_at timestamptz;

ALTER TABLE public.global_prayer_requests
  ADD COLUMN IF NOT EXISTS origin_country_code text,
  ADD COLUMN IF NOT EXISTS origin_country_name text;

ALTER TABLE public.prayer_actions
  ADD COLUMN IF NOT EXISTS prayer_country_code text,
  ADD COLUMN IF NOT EXISTS prayer_country_name text;

ALTER TABLE public.app_events
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS country_name text;

CREATE INDEX IF NOT EXISTS idx_profiles_country_code ON public.profiles(country_code);
CREATE INDEX IF NOT EXISTS idx_global_prayer_requests_origin_country ON public.global_prayer_requests(origin_country_code);
CREATE INDEX IF NOT EXISTS idx_prayer_actions_country ON public.prayer_actions(prayer_country_code);
