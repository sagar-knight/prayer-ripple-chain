
-- 1. Columns
ALTER TABLE public.global_prayer_requests
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS short_code TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS global_prayer_requests_slug_key ON public.global_prayer_requests (slug);
CREATE UNIQUE INDEX IF NOT EXISTS global_prayer_requests_short_code_key ON public.global_prayer_requests (short_code);

-- 2. Helpers
CREATE OR REPLACE FUNCTION public.generate_prayer_short_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'abcdefghjkmnpqrstuvwxyz23456789';
  code TEXT;
  i INT;
BEGIN
  LOOP
    code := '';
    FOR i IN 1..5 LOOP
      code := code || substr(chars, 1 + floor(random() * length(chars))::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.global_prayer_requests WHERE short_code = code);
  END LOOP;
  RETURN code;
END;
$$;

CREATE OR REPLACE FUNCTION public.slugify_text(_input TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT trim(both '-' from
    regexp_replace(
      regexp_replace(lower(coalesce(_input, '')), '[^a-z0-9]+', '-', 'g'),
      '-+', '-', 'g'
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.generate_prayer_slug(_title TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base TEXT;
  words TEXT[];
  keywords TEXT;
  code TEXT;
  candidate TEXT;
BEGIN
  base := public.slugify_text(_title);
  IF base = '' OR base IS NULL THEN
    base := 'prayer';
  END IF;

  -- keep first 3 words/segments to keep slugs short
  words := string_to_array(base, '-');
  IF array_length(words, 1) > 3 THEN
    keywords := array_to_string(words[1:3], '-');
  ELSE
    keywords := base;
  END IF;

  -- cap keyword length
  IF length(keywords) > 32 THEN
    keywords := substr(keywords, 1, 32);
    keywords := trim(both '-' from keywords);
  END IF;

  LOOP
    code := public.generate_prayer_short_code();
    candidate := keywords || '-' || code;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.global_prayer_requests WHERE slug = candidate);
  END LOOP;

  RETURN candidate;
END;
$$;

-- 3. Trigger to auto-fill on insert
CREATE OR REPLACE FUNCTION public.set_prayer_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_prayer_slug(NEW.title);
  END IF;
  IF NEW.short_code IS NULL OR NEW.short_code = '' THEN
    -- derive short_code from slug suffix to keep them paired
    NEW.short_code := split_part(NEW.slug, '-', array_length(string_to_array(NEW.slug, '-'), 1));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_prayer_slug ON public.global_prayer_requests;
CREATE TRIGGER trg_set_prayer_slug
  BEFORE INSERT ON public.global_prayer_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_prayer_slug();

-- 4. Backfill existing rows
DO $$
DECLARE
  r RECORD;
  new_slug TEXT;
BEGIN
  FOR r IN SELECT id, title FROM public.global_prayer_requests WHERE slug IS NULL OR slug = '' LOOP
    new_slug := public.generate_prayer_slug(r.title);
    UPDATE public.global_prayer_requests
       SET slug = new_slug,
           short_code = split_part(new_slug, '-', array_length(string_to_array(new_slug, '-'), 1))
     WHERE id = r.id;
  END LOOP;
END;
$$;

-- 5. Public lookup RPC (safe fields only, only public+open prayers)
CREATE OR REPLACE FUNCTION public.get_prayer_by_slug(_slug TEXT)
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'id', gpr.id,
    'slug', gpr.slug,
    'short_code', gpr.short_code,
    'title', gpr.title,
    'description', gpr.description,
    'category', gpr.category,
    'anonymous', gpr.anonymous,
    'prayer_count', gpr.prayer_count,
    'created_at', gpr.created_at,
    'country', CASE WHEN gpr.show_country THEN gpr.country ELSE NULL END,
    'status', gpr.status
  ) INTO result
  FROM public.global_prayer_requests gpr
  WHERE gpr.slug = _slug
    AND gpr.visibility = 'public'
    AND gpr.status = 'open'
  LIMIT 1;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_prayer_by_slug(TEXT) TO anon, authenticated;
