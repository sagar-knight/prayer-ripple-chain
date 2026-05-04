-- Slug generation uniqueness test
--
-- Run with:  psql "$SUPABASE_DB_URL" -f e2e/sql/prayer-slug-uniqueness.sql
--
-- Generates 5,000 candidate slugs from the same title and verifies that
-- generate_prayer_slug() never produces a duplicate, even when the keyword
-- prefix is identical. This guards the "scalable for thousands or millions
-- of prayer requests" requirement.

BEGIN;

CREATE TEMP TABLE _slug_probe (slug text) ON COMMIT DROP;

INSERT INTO _slug_probe (slug)
SELECT public.generate_prayer_slug('Healing for mom')
FROM generate_series(1, 5000);

DO $$
DECLARE
  total int;
  unique_count int;
  bad_format int;
BEGIN
  SELECT count(*), count(DISTINCT slug) INTO total, unique_count FROM _slug_probe;

  -- All slugs must follow the {keywords}-{shortCode} pattern with a 4-6 char code
  SELECT count(*) INTO bad_format
    FROM _slug_probe
   WHERE slug !~ '^[a-z0-9-]+-[a-z0-9]{4,6}$';

  RAISE NOTICE 'generated=%, unique=%, bad_format=%', total, unique_count, bad_format;

  IF unique_count <> total THEN
    RAISE EXCEPTION 'Slug uniqueness FAILED: % duplicates in % rows', total - unique_count, total;
  END IF;
  IF bad_format > 0 THEN
    RAISE EXCEPTION 'Slug format FAILED: % rows do not match {keywords}-{shortCode}', bad_format;
  END IF;
END;
$$;

ROLLBACK;