
-- Broaden global prayer feed visibility to include progress + answered (exclude archived)
DROP POLICY IF EXISTS "Authenticated users can view open global requests" ON public.global_prayer_requests;
CREATE POLICY "Authenticated users can view active global requests"
ON public.global_prayer_requests
FOR SELECT
TO authenticated
USING (status IN ('open', 'progress', 'answered') AND visibility = 'public');

-- Prayer updates (testimonies / progress notes from prayer owner)
CREATE TABLE IF NOT EXISTS public.prayer_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prayer_request_id UUID NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'global',
  author_user_id TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prayer_updates_prayer ON public.prayer_updates(prayer_request_id, created_at DESC);

ALTER TABLE public.prayer_updates ENABLE ROW LEVEL SECURITY;

-- Owner of the global prayer can post updates
CREATE POLICY "Owners can post prayer updates"
ON public.prayer_updates
FOR INSERT
TO authenticated
WITH CHECK (
  author_user_id = (auth.uid())::text
  AND source_type = 'global'
  AND EXISTS (
    SELECT 1 FROM public.global_prayer_requests gpr
    WHERE gpr.id = prayer_updates.prayer_request_id
      AND gpr.created_by = (auth.uid())::text
  )
);

-- Anyone who can see the underlying prayer can read its updates
CREATE POLICY "Authenticated users can read updates for visible prayers"
ON public.prayer_updates
FOR SELECT
TO authenticated
USING (
  source_type = 'global'
  AND EXISTS (
    SELECT 1 FROM public.global_prayer_requests gpr
    WHERE gpr.id = prayer_updates.prayer_request_id
      AND (
        (gpr.status IN ('open','progress','answered') AND gpr.visibility = 'public')
        OR gpr.created_by = (auth.uid())::text
      )
  )
);

-- Auto-archive helper: archive open/progress prayers with no activity in last 30 days
CREATE OR REPLACE FUNCTION public.auto_archive_stale_prayers()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  WITH stale AS (
    SELECT gpr.id
    FROM public.global_prayer_requests gpr
    LEFT JOIN public.prayer_coverage pc
      ON pc.prayer_id = gpr.id::text AND pc.source_type = 'global'
    WHERE gpr.status IN ('open','progress')
      AND gpr.created_at < now() - INTERVAL '30 days'
      AND COALESCE(pc.last_prayed_at, gpr.created_at) < now() - INTERVAL '14 days'
  )
  UPDATE public.global_prayer_requests g
  SET status = 'archived', updated_at = now()
  FROM stale
  WHERE g.id = stale.id;

  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN archived_count;
END;
$$;
