
-- 1. Drop the overly permissive public SELECT policy on the raw table
DROP POLICY IF EXISTS "Anyone can view open global requests" ON public.global_prayer_requests;

-- 2. Add authenticated-only policy for viewing open requests (needed for RippleImpact stats etc.)
CREATE POLICY "Authenticated users can view open global requests"
ON public.global_prayer_requests
FOR SELECT
TO authenticated
USING (status = 'open' AND visibility = 'public');

-- 3. Recreate global_prayers_public view WITHOUT security_invoker (defaults to security definer/owner)
-- This view already masks created_by for anonymous requests
CREATE OR REPLACE VIEW public.global_prayers_public AS
SELECT g.id,
    g.title,
    g.description,
    g.category,
    CASE
        WHEN g.anonymous = true THEN NULL::text
        ELSE g.created_by
    END AS created_by,
    g.anonymous,
    g.prayer_count,
    g.country,
    g.show_country,
    g.status,
    g.created_at,
    g.updated_at
FROM global_prayer_requests g
LEFT JOIN profiles p ON p.id::text = g.created_by
WHERE g.status = 'open' AND g.visibility = 'public'
  AND COALESCE(p.is_test_account, false) = false;

-- Grant access on the view to anon and authenticated
GRANT SELECT ON public.global_prayers_public TO anon;
GRANT SELECT ON public.global_prayers_public TO authenticated;

-- 4. Recreate unified_prayer_feed view WITHOUT security_invoker
CREATE OR REPLACE VIEW public.unified_prayer_feed AS
SELECT g.id::text AS prayer_id,
    'global'::text AS source_type,
    NULL::uuid AS source_id,
    g.title,
    g.description,
    g.category,
    g.anonymous,
    g.show_country,
    g.country,
    g.visibility,
    g.status,
    g.created_by,
    g.created_at,
    g.updated_at,
    COALESCE(c.current_prayers, 0) AS prayer_count,
    COALESCE(c.unique_people_prayed, 0) AS unique_people_prayed,
    COALESCE(c.target_prayers, 3) AS target_prayers,
    c.last_prayed_at
FROM global_prayer_requests g
LEFT JOIN prayer_coverage c ON c.prayer_id = g.id::text AND c.source_type = 'global'
LEFT JOIN profiles p ON p.id::text = g.created_by
WHERE g.status = 'open' AND g.visibility = 'public'
  AND COALESCE(p.is_test_account, false) = false;

GRANT SELECT ON public.unified_prayer_feed TO anon;
GRANT SELECT ON public.unified_prayer_feed TO authenticated;
