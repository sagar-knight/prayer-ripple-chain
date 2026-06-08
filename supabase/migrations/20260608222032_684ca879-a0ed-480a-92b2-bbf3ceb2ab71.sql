CREATE OR REPLACE FUNCTION public.is_community_wall_public(_church_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.churches c
    WHERE c.id = _church_id
      AND c.status = 'active'
      AND c.privacy = 'public'
  )
$$;

REVOKE ALL ON public.churches FROM anon;
REVOKE ALL ON public.church_memberships FROM anon;
REVOKE ALL ON public.church_prayer_requests FROM anon;
REVOKE ALL ON public.churches_public FROM anon;
REVOKE ALL ON public.churches_public FROM authenticated;
REVOKE ALL ON public.churches_public FROM service_role;

GRANT SELECT ON public.churches_public TO anon;
GRANT SELECT ON public.churches_public TO authenticated;
GRANT ALL ON public.churches_public TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.churches TO authenticated;
GRANT ALL ON public.churches TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.church_memberships TO authenticated;
GRANT ALL ON public.church_memberships TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.church_prayer_requests TO authenticated;
GRANT SELECT ON public.church_prayer_requests TO anon;
GRANT ALL ON public.church_prayer_requests TO service_role;

DROP POLICY IF EXISTS "Visitors see approved public requests" ON public.church_prayer_requests;
CREATE POLICY "Visitors see approved public requests"
ON public.church_prayer_requests
FOR SELECT
TO anon
USING (
  hidden_at IS NULL
  AND status = 'approved'
  AND public.is_community_wall_public(church_id)
);

DROP POLICY IF EXISTS "Members see approved requests or own" ON public.church_prayer_requests;
CREATE POLICY "Members see approved requests or own"
ON public.church_prayer_requests
FOR SELECT
TO authenticated
USING (
  (
    hidden_at IS NULL
    AND status = 'approved'
    AND (
      public.is_community_wall_public(church_id)
      OR public.is_church_member((auth.uid())::text, church_id)
    )
  )
  OR submitted_by = (auth.uid())::text
  OR public.get_church_role((auth.uid())::text, church_id) IN ('admin', 'moderator')
);