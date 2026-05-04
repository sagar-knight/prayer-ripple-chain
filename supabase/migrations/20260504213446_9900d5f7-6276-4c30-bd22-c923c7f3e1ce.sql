
-- Update public ripple function to include country_code in geography
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

  -- Geography reach with country_code, prayers + forwards aggregates
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

-- Admin global reach analytics: aggregated, no PII
CREATE OR REPLACE FUNCTION public.get_global_reach_analytics(_days int DEFAULT 30)
 RETURNS json
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_start timestamptz := now() - (_days || ' days')::interval;
  v_top_prayers json;
  v_requests_by_country json;
  v_forwards_by_country json;
  v_total_countries int;
  v_growth json;
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin'::app_role)
       OR public.has_role(auth.uid(), 'moderator'::app_role)) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT COALESCE(json_agg(t ORDER BY t.prayers DESC), '[]'::json) INTO v_top_prayers
  FROM (
    SELECT prayer_country_code AS country_code,
           prayer_country_name AS country,
           COUNT(*)::int AS prayers
    FROM public.prayer_actions
    WHERE action_type = 'prayed' AND created_at >= v_start
      AND prayer_country_code IS NOT NULL
    GROUP BY 1, 2
    ORDER BY prayers DESC
    LIMIT 25
  ) t;

  SELECT COALESCE(json_agg(t ORDER BY t.requests DESC), '[]'::json) INTO v_requests_by_country
  FROM (
    SELECT origin_country_code AS country_code,
           origin_country_name AS country,
           COUNT(*)::int AS requests
    FROM public.global_prayer_requests
    WHERE created_at >= v_start
      AND origin_country_code IS NOT NULL
    GROUP BY 1, 2
    ORDER BY requests DESC
    LIMIT 25
  ) t;

  SELECT COALESCE(json_agg(t ORDER BY t.forwards DESC), '[]'::json) INTO v_forwards_by_country
  FROM (
    SELECT prayer_country_code AS country_code,
           prayer_country_name AS country,
           COUNT(*)::int AS forwards
    FROM public.prayer_actions
    WHERE action_type = 'shared' AND created_at >= v_start
      AND prayer_country_code IS NOT NULL
    GROUP BY 1, 2
    ORDER BY forwards DESC
    LIMIT 25
  ) t;

  SELECT COUNT(DISTINCT country_code)::int INTO v_total_countries
  FROM (
    SELECT prayer_country_code AS country_code FROM public.prayer_actions
      WHERE prayer_country_code IS NOT NULL AND created_at >= v_start
    UNION
    SELECT origin_country_code FROM public.global_prayer_requests
      WHERE origin_country_code IS NOT NULL AND created_at >= v_start
  ) u;

  SELECT COALESCE(json_agg(g ORDER BY g.day), '[]'::json) INTO v_growth
  FROM (
    SELECT date_trunc('day', created_at)::date AS day,
           COUNT(*) FILTER (WHERE action_type = 'prayed')::int AS prayers,
           COUNT(*) FILTER (WHERE action_type = 'shared')::int AS forwards
    FROM public.prayer_actions
    WHERE created_at >= v_start
    GROUP BY 1
    ORDER BY 1
  ) g;

  RETURN json_build_object(
    'days', _days,
    'top_prayers_by_country', v_top_prayers,
    'requests_by_country', v_requests_by_country,
    'forwards_by_country', v_forwards_by_country,
    'total_countries_reached', v_total_countries,
    'growth', v_growth
  );
END;
$function$;
