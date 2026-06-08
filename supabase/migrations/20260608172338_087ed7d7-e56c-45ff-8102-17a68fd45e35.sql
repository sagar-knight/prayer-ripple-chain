CREATE OR REPLACE FUNCTION public.get_prayer_geography(_prayer_id text, _source_type text DEFAULT 'global')
RETURNS json
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(json_agg(g ORDER BY g.prayers DESC), '[]'::json)
  FROM (
    SELECT
      COALESCE(prayer_country_code, 'XX') AS country_code,
      COALESCE(prayer_country_name, 'Unknown') AS country,
      COUNT(*) FILTER (WHERE action_type = 'prayed')::int AS prayers,
      COUNT(*) FILTER (WHERE action_type = 'shared')::int AS forwards,
      COUNT(DISTINCT user_id)::int AS participants
    FROM public.prayer_actions
    WHERE prayer_id = _prayer_id
      AND source_type = _source_type
      AND action_type IN ('prayed', 'shared')
    GROUP BY 1, 2
  ) g;
$$;

GRANT EXECUTE ON FUNCTION public.get_prayer_geography(text, text) TO authenticated, anon;
