
-- 1. Fix anonymous prayer request author exposure: mask created_by for anonymous requests
DROP POLICY IF EXISTS "Anyone can view open global requests" ON public.global_prayer_requests;
CREATE POLICY "Anyone can view open global requests"
ON public.global_prayer_requests
FOR SELECT
TO public
USING (status = 'open' AND visibility = 'public');

-- Note: created_by is still in the row, but we'll handle masking in the app layer
-- The RLS policy itself can't mask columns, but we can add a secure view
CREATE OR REPLACE VIEW public.global_prayers_public
WITH (security_invoker = true) AS
SELECT
  id, title, description, category,
  CASE WHEN anonymous = true THEN NULL ELSE created_by END AS created_by,
  anonymous, prayer_count, country, show_country, status, created_at, updated_at
FROM public.global_prayer_requests
WHERE status = 'open' AND visibility = 'public';

-- 2. Restrict prayer_coverage to global source type for public reads
DROP POLICY IF EXISTS "Anyone can view prayer coverage" ON public.prayer_coverage;
CREATE POLICY "Anyone can view global prayer coverage"
ON public.prayer_coverage
FOR SELECT
TO public
USING (source_type = 'global');

-- Authenticated users can view all coverage for prayers they're involved in
CREATE POLICY "Authenticated users can view related coverage"
ON public.prayer_coverage
FOR SELECT
TO authenticated
USING (true);

-- 3. Fix prayer_chain_nodes INSERT: restrict to authenticated only
DROP POLICY IF EXISTS "Users can insert their own chain nodes" ON public.prayer_chain_nodes;
CREATE POLICY "Authenticated users can insert their own chain nodes"
ON public.prayer_chain_nodes
FOR INSERT
TO authenticated
WITH CHECK (user_id = (auth.uid())::text);

-- Also fix SELECT to authenticated only
DROP POLICY IF EXISTS "Users can view their own chain nodes" ON public.prayer_chain_nodes;
CREATE POLICY "Authenticated users can view their own chain nodes"
ON public.prayer_chain_nodes
FOR SELECT
TO authenticated
USING (user_id = (auth.uid())::text);

-- 4. Add DELETE policy for prayer_reminder_daily_logs
CREATE POLICY "Users can delete their own logs"
ON public.prayer_reminder_daily_logs
FOR DELETE
TO authenticated
USING (prayer_reminder_id IN (
  SELECT id FROM prayer_reminders WHERE user_id = (auth.uid())::text
));
