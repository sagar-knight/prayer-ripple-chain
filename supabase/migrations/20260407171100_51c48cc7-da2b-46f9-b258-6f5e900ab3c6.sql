
-- Update unified_prayer_feed to exclude test account prayers
CREATE OR REPLACE VIEW public.unified_prayer_feed
WITH (security_invoker=on) AS
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
     LEFT JOIN prayer_coverage c ON c.prayer_id = g.id::text AND c.source_type = 'global'::text
     LEFT JOIN profiles p ON p.id::text = g.created_by
  WHERE g.status = 'open'::text AND g.visibility = 'public'::text
    AND COALESCE(p.is_test_account, false) = false;

-- Update global_prayers_public to exclude test account prayers
CREATE OR REPLACE VIEW public.global_prayers_public
WITH (security_invoker=on) AS
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
  WHERE g.status = 'open'::text AND g.visibility = 'public'::text
    AND COALESCE(p.is_test_account, false) = false;
