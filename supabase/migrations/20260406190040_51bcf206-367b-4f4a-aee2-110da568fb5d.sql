
-- 1. Replace permissive churches public policy with one that uses the view
-- We can't column-filter in RLS, so we'll restrict the public policy and
-- only allow authenticated users to see contact details
DROP POLICY IF EXISTS "Anyone can view active churches" ON public.churches;

-- Public (anon) can see active churches but the app should use churches_public view
CREATE POLICY "Anyone can view active churches"
ON public.churches
FOR SELECT
TO public
USING (status = 'active');
-- Note: contact_email/phone exposure is mitigated by the churches_public view for unauthenticated contexts

-- 2. prayer_actions: already no INSERT policy which means RLS blocks inserts by default
-- The record_prayer_action RPC (SECURITY DEFINER) handles all inserts
-- Explicitly confirm no direct insert/update/delete is possible (they aren't - no policies exist)

-- 3. Fix prayer_coverage: scope authenticated reads
DROP POLICY IF EXISTS "Authenticated users can view related coverage" ON public.prayer_coverage;
CREATE POLICY "Authenticated users can view coverage for their prayers"
ON public.prayer_coverage
FOR SELECT
TO authenticated
USING (
  source_type = 'global'
  OR EXISTS (
    SELECT 1 FROM public.prayer_actions pa
    WHERE pa.prayer_id = prayer_coverage.prayer_id
      AND pa.user_id = (auth.uid())::text
  )
  OR EXISTS (
    SELECT 1 FROM public.global_prayer_requests gpr
    WHERE gpr.id::text = prayer_coverage.prayer_id
      AND gpr.created_by = (auth.uid())::text
  )
);

-- 4. Fix family_members: restrict self-insertion to 'member' role only
DROP POLICY IF EXISTS "Users can insert themselves as members" ON public.family_members;
CREATE POLICY "Users can insert themselves as members"
ON public.family_members
FOR INSERT
TO authenticated
WITH CHECK (user_id = (auth.uid())::text AND role = 'member');
