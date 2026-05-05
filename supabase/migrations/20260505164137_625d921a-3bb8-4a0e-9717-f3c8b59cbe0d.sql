-- 1. prayer_translations: replace permissive policy
DROP POLICY IF EXISTS "Authenticated can read translations" ON public.prayer_translations;

CREATE POLICY "Authorized users can read translations"
ON public.prayer_translations
FOR SELECT
TO authenticated
USING (
  CASE
    WHEN source_type = 'global' THEN EXISTS (
      SELECT 1 FROM public.global_prayer_requests gpr
      WHERE gpr.id::text = prayer_translations.prayer_request_id
        AND gpr.hidden_at IS NULL
        AND (
          (gpr.visibility = 'public' AND gpr.status = ANY (ARRAY['open','progress','answered']))
          OR gpr.created_by = (auth.uid())::text
        )
    )
    WHEN source_type = 'church' THEN EXISTS (
      SELECT 1 FROM public.church_prayer_requests cpr
      WHERE cpr.id::text = prayer_translations.prayer_request_id
        AND cpr.hidden_at IS NULL
        AND (
          public.is_church_member((auth.uid())::text, cpr.church_id)
          OR cpr.submitted_by = (auth.uid())::text
        )
    )
    WHEN source_type = 'family' THEN EXISTS (
      SELECT 1 FROM public.family_prayer_requests fpr
      WHERE fpr.id::text = prayer_translations.prayer_request_id
        AND fpr.hidden_at IS NULL
        AND public.is_family_member((auth.uid())::text, fpr.family_group_id)
    )
    ELSE false
  END
);

-- 2. prayer_coverage: limit anon SELECT to currently visible global prayers
DROP POLICY IF EXISTS "Anyone can view global prayer coverage" ON public.prayer_coverage;

CREATE POLICY "Anyone can view visible global prayer coverage"
ON public.prayer_coverage
FOR SELECT
TO public
USING (
  source_type = 'global'
  AND EXISTS (
    SELECT 1 FROM public.global_prayer_requests gpr
    WHERE gpr.id::text = prayer_coverage.prayer_id
      AND gpr.hidden_at IS NULL
      AND gpr.visibility = 'public'
      AND gpr.status = ANY (ARRAY['open','progress','answered'])
  )
);

-- 3. Public slug RPCs: also exclude hidden prayers
CREATE OR REPLACE FUNCTION public.get_prayer_by_slug(_slug text)
 RETURNS json
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    AND gpr.hidden_at IS NULL
  LIMIT 1;

  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_public_ripple_by_slug(_slug text)
 RETURNS json
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_prayer RECORD;
  v_total_prayers INT := 0;
  v_unique_people INT := 0;
  v_forwards INT := 0;
  v_depth INT := 0;
  v_geography JSON;
  v_activity JSON;
BEGIN
  SELECT id, slug, short_code, title, description, category, anonymous,
         prayer_count, created_at, status, show_country, country,
         origin_country_code, origin_country_name
    INTO v_prayer
  FROM public.global_prayer_requests
  WHERE slug = _slug
    AND visibility = 'public'
    AND status = 'open'
    AND allow_public_ripple_view = true
    AND hidden_at IS NULL
  LIMIT 1;

  IF v_prayer.id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(current_prayers, 0),
         COALESCE(unique_people_prayed, 0),
         COALESCE(passed_forward_count, 0)
    INTO v_total_prayers, v_unique_people, v_forwards
  FROM public.prayer_coverage
  WHERE prayer_id = v_prayer.id::text AND source_type = 'global'
  LIMIT 1;

  SELECT COALESCE(MAX(depth_level), 0) + 1
    INTO v_depth
  FROM public.prayer_chain_nodes
  WHERE prayer_id = v_prayer.id::text;

  IF v_depth IS NULL THEN v_depth := 0; END IF;

  SELECT COALESCE(json_agg(g ORDER BY g.prayers DESC), '[]'::json) INTO v_geography
  FROM (
    SELECT
      COALESCE(prayer_country_code, 'XX') AS country_code,
      COALESCE(prayer_country_name, 'Unknown') AS country,
      COUNT(*) FILTER (WHERE action_type = 'prayed')::int AS prayers,
      COUNT(*) FILTER (WHERE action_type = 'shared')::int AS forwards,
      COUNT(DISTINCT user_id)::int AS participants
    FROM public.prayer_actions
    WHERE prayer_id = v_prayer.id::text
      AND source_type = 'global'
      AND action_type IN ('prayed', 'shared')
    GROUP BY 1, 2
    ORDER BY prayers DESC
    LIMIT 50
  ) g;

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
        WHEN pa.action_type = 'shared' AND pa.prayer_country_name IS NOT NULL
          THEN 'Someone forwarded this prayer from ' || pa.prayer_country_name
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
      'origin_country_code', CASE WHEN v_prayer.show_country THEN v_prayer.origin_country_code ELSE NULL END,
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
$function$;