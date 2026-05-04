-- Add allow_public_ripple_view toggle (default true; only matters when visibility='public')
ALTER TABLE public.global_prayer_requests
  ADD COLUMN IF NOT EXISTS allow_public_ripple_view boolean NOT NULL DEFAULT true;

-- Update slug lookup to also require ripple toggle on, plus enforce visibility/status
CREATE OR REPLACE FUNCTION public.get_prayer_by_slug(_slug text)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
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
    AND gpr.allow_public_ripple_view = true
  LIMIT 1;

  RETURN result;
END;
$$;

-- Public ripple summary RPC: returns only safe, anonymized data
CREATE OR REPLACE FUNCTION public.get_public_ripple_by_slug(_slug text)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_prayer RECORD;
  v_total_prayers INT := 0;
  v_unique_people INT := 0;
  v_forwards INT := 0;
  v_depth INT := 0;
  v_geography JSON;
  v_activity JSON;
BEGIN
  -- Gate: must be public, open, and ripple-view allowed
  SELECT id, slug, short_code, title, description, category, anonymous,
         prayer_count, created_at, status, show_country, country
    INTO v_prayer
  FROM public.global_prayer_requests
  WHERE slug = _slug
    AND visibility = 'public'
    AND status = 'open'
    AND allow_public_ripple_view = true
  LIMIT 1;

  IF v_prayer.id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Coverage stats
  SELECT COALESCE(current_prayers, 0),
         COALESCE(unique_people_prayed, 0),
         COALESCE(passed_forward_count, 0)
    INTO v_total_prayers, v_unique_people, v_forwards
  FROM public.prayer_coverage
  WHERE prayer_id = v_prayer.id::text AND source_type = 'global'
  LIMIT 1;

  -- Ripple depth from chain nodes
  SELECT COALESCE(MAX(depth_level), 0) + 1
    INTO v_depth
  FROM public.prayer_chain_nodes
  WHERE prayer_id = v_prayer.id::text;

  IF v_depth IS NULL THEN v_depth := 0; END IF;

  -- Geography reach: country-level only, top 8
  SELECT COALESCE(json_agg(g), '[]'::json) INTO v_geography
  FROM (
    SELECT prayer_country_name AS country, COUNT(*)::int AS count
    FROM public.prayer_actions
    WHERE prayer_id = v_prayer.id::text
      AND source_type = 'global'
      AND action_type = 'prayed'
      AND prayer_country_name IS NOT NULL
    GROUP BY prayer_country_name
    ORDER BY count DESC
    LIMIT 8
  ) g;

  -- Anonymized activity feed: last 15 events, no user identifiers
  SELECT COALESCE(json_agg(a ORDER BY a.created_at DESC), '[]'::json) INTO v_activity
  FROM (
    SELECT
      pa.created_at,
      pa.action_type,
      CASE
        WHEN pa.action_type = 'prayed' AND pa.prayer_country_name IS NOT NULL
          THEN 'Someone prayed from ' || pa.prayer_country_name
        WHEN pa.action_type = 'prayed'
          THEN 'Someone prayed for this request'
        WHEN pa.action_type = 'shared'
          THEN 'Someone forwarded this prayer'
        ELSE 'Someone joined this prayer ripple'
      END AS message
    FROM public.prayer_actions pa
    WHERE pa.prayer_id = v_prayer.id::text
      AND pa.source_type = 'global'
      AND pa.action_type IN ('prayed', 'shared')
    ORDER BY pa.created_at DESC
    LIMIT 15
  ) a;

  RETURN json_build_object(
    'prayer', json_build_object(
      'id', v_prayer.id,
      'slug', v_prayer.slug,
      'short_code', v_prayer.short_code,
      'title', v_prayer.title,
      'description', v_prayer.description,
      'category', v_prayer.category,
      'anonymous', v_prayer.anonymous,
      'prayer_count', v_prayer.prayer_count,
      'created_at', v_prayer.created_at,
      'country', CASE WHEN v_prayer.show_country THEN v_prayer.country ELSE NULL END,
      'status', v_prayer.status
    ),
    'ripple', json_build_object(
      'total_prayers', v_total_prayers,
      'unique_people', v_unique_people,
      'forwards', v_forwards,
      'depth', v_depth
    ),
    'geography', v_geography,
    'activity', v_activity
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_ripple_by_slug(text) TO anon, authenticated;