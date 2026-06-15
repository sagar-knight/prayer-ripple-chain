
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT
  p.id,
  COALESCE(p.display_name, 'Prayer Warrior') AS display_name,
  CASE
    WHEN COALESCE(p.avatar_status, 'none') = 'approved' THEN p.avatar_url
    ELSE NULL
  END AS avatar_url
FROM public.profiles p
WHERE COALESCE(p.is_test_account, false) = false;

GRANT SELECT ON public.profiles_public TO anon;
GRANT SELECT ON public.profiles_public TO authenticated;
