GRANT SELECT, INSERT, UPDATE, DELETE ON public.churches TO authenticated;
GRANT SELECT ON public.churches TO anon;
GRANT ALL ON public.churches TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.church_memberships TO authenticated;
GRANT ALL ON public.church_memberships TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.church_prayer_requests TO authenticated;
GRANT SELECT ON public.church_prayer_requests TO anon;
GRANT ALL ON public.church_prayer_requests TO service_role;

DROP POLICY IF EXISTS "Community creators can become admins" ON public.church_memberships;
CREATE POLICY "Community creators can become admins"
ON public.church_memberships
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = (auth.uid())::text
  AND role = 'admin'
  AND status = 'active'
  AND EXISTS (
    SELECT 1
    FROM public.churches c
    WHERE c.id = church_memberships.church_id
      AND c.created_by = (auth.uid())::text
  )
);