DROP POLICY IF EXISTS "Authenticated users can view coverage for their prayers" ON public.prayer_coverage;

CREATE POLICY "Authenticated users can view coverage for their prayers"
ON public.prayer_coverage
FOR SELECT
TO authenticated
USING (
  (
    source_type = 'global' AND EXISTS (
      SELECT 1 FROM public.global_prayer_requests gpr
      WHERE gpr.id::text = prayer_coverage.prayer_id
        AND gpr.hidden_at IS NULL
        AND gpr.visibility = 'public'
        AND gpr.status IN ('open','progress','answered')
    )
  )
  OR EXISTS (
    SELECT 1 FROM public.prayer_actions pa
    WHERE pa.prayer_id = prayer_coverage.prayer_id
      AND pa.user_id = auth.uid()::text
  )
  OR EXISTS (
    SELECT 1 FROM public.global_prayer_requests gpr
    WHERE gpr.id::text = prayer_coverage.prayer_id
      AND gpr.created_by = auth.uid()::text
  )
);