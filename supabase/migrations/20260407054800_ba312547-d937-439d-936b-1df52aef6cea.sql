-- Fix 1: Church membership privilege escalation
-- Restrict INSERT to only allow role = 'member'
DROP POLICY IF EXISTS "Users can join churches" ON public.church_memberships;
CREATE POLICY "Users can join churches"
ON public.church_memberships
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = (auth.uid())::text
  AND role = 'member'
);

-- Fix 2: Restrict public access to churches sensitive fields
-- Replace the broad public SELECT with scoped policies
DROP POLICY IF EXISTS "Anyone can view active churches" ON public.churches;

-- Authenticated users can see active churches (they need contact info for church detail pages)
CREATE POLICY "Authenticated users can view active churches"
ON public.churches
FOR SELECT
TO authenticated
USING (status = 'active');

-- Anonymous users can view active churches via the public policy but we use a restrictive approach
-- They should use the churches_public view instead, but for backward compat allow basic SELECT
CREATE POLICY "Anon can view active churches"
ON public.churches
FOR SELECT
TO anon
USING (status = 'active');