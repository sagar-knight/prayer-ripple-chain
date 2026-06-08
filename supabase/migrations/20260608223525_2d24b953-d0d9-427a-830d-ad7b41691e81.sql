
-- 1. Table
CREATE TABLE IF NOT EXISTS public.community_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','cancelled')),
  reviewed_at timestamptz,
  reviewed_by text,
  reviewed_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS community_join_requests_unique_pending
  ON public.community_join_requests(community_id, user_id)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS community_join_requests_community_idx
  ON public.community_join_requests(community_id, status);

CREATE INDEX IF NOT EXISTS community_join_requests_user_idx
  ON public.community_join_requests(user_id, status);

-- 2. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_join_requests TO authenticated;
GRANT ALL ON public.community_join_requests TO service_role;

-- 3. RLS
ALTER TABLE public.community_join_requests ENABLE ROW LEVEL SECURITY;

-- updated_at trigger
DROP TRIGGER IF EXISTS set_community_join_requests_updated_at ON public.community_join_requests;
CREATE TRIGGER set_community_join_requests_updated_at
BEFORE UPDATE ON public.community_join_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_now();

-- Helper: is community admin or moderator (or owner, treated as admin)
CREATE OR REPLACE FUNCTION public.is_community_admin(_user_id text, _community_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.church_memberships
    WHERE church_id = _community_id
      AND user_id = _user_id
      AND status = 'active'
      AND role IN ('admin','moderator','owner')
  )
  OR EXISTS (
    SELECT 1 FROM public.churches
    WHERE id = _community_id
      AND created_by = _user_id
  )
$$;

-- 4. Policies
DROP POLICY IF EXISTS "Users view own join requests" ON public.community_join_requests;
CREATE POLICY "Users view own join requests"
ON public.community_join_requests
FOR SELECT
TO authenticated
USING (user_id = (auth.uid())::text);

DROP POLICY IF EXISTS "Community admins view all requests" ON public.community_join_requests;
CREATE POLICY "Community admins view all requests"
ON public.community_join_requests
FOR SELECT
TO authenticated
USING (public.is_community_admin((auth.uid())::text, community_id));

DROP POLICY IF EXISTS "Users cancel own pending requests" ON public.community_join_requests;
CREATE POLICY "Users cancel own pending requests"
ON public.community_join_requests
FOR UPDATE
TO authenticated
USING (user_id = (auth.uid())::text AND status = 'pending')
WITH CHECK (user_id = (auth.uid())::text AND status IN ('pending','cancelled'));

-- Inserts/approvals are gated through SECURITY DEFINER functions below.

-- 5. Submit join request
CREATE OR REPLACE FUNCTION public.request_to_join_community(_community_id uuid, _message text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user text := (auth.uid())::text;
  _id uuid;
BEGIN
  IF _user IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.churches WHERE id = _community_id) THEN
    RAISE EXCEPTION 'Community not found';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.churches WHERE id = _community_id AND created_by = _user
  ) THEN
    RAISE EXCEPTION 'You already own this community';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.church_memberships
    WHERE church_id = _community_id AND user_id = _user AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'You are already a member of this community';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.community_join_requests
    WHERE community_id = _community_id AND user_id = _user AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'You already have a pending request for this community';
  END IF;

  INSERT INTO public.community_join_requests (community_id, user_id, message)
  VALUES (_community_id, _user, NULLIF(trim(_message), ''))
  RETURNING id INTO _id;

  INSERT INTO public.app_events (event_type, actor_user_id, entity_type, entity_id, metadata_json)
  VALUES ('community_join_requested', _user, 'community', _community_id::text,
          jsonb_build_object('request_id', _id));

  RETURN _id;
END;
$$;

-- 6. Review (approve / reject)
CREATE OR REPLACE FUNCTION public.review_community_join_request(
  _request_id uuid,
  _decision text,
  _note text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user text := (auth.uid())::text;
  _req record;
BEGIN
  IF _user IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF _decision NOT IN ('approved','rejected') THEN
    RAISE EXCEPTION 'Invalid decision';
  END IF;

  SELECT * INTO _req FROM public.community_join_requests WHERE id = _request_id;
  IF _req IS NULL THEN
    RAISE EXCEPTION 'Request not found';
  END IF;

  IF NOT public.is_community_admin(_user, _req.community_id) THEN
    RAISE EXCEPTION 'Only community admins or moderators can review requests';
  END IF;

  IF _req.status <> 'pending' THEN
    RAISE EXCEPTION 'Request is no longer pending';
  END IF;

  UPDATE public.community_join_requests
    SET status = _decision,
        reviewed_at = now(),
        reviewed_by = _user,
        reviewed_note = NULLIF(trim(_note), ''),
        updated_at = now()
    WHERE id = _request_id;

  IF _decision = 'approved' THEN
    INSERT INTO public.church_memberships (church_id, user_id, role, status)
    VALUES (_req.community_id, _req.user_id, 'member', 'active')
    ON CONFLICT (church_id, user_id) DO UPDATE
      SET status = 'active', role = COALESCE(NULLIF(EXCLUDED.role,''), public.church_memberships.role);
  END IF;

  INSERT INTO public.app_events (event_type, actor_user_id, entity_type, entity_id, metadata_json)
  VALUES ('community_join_' || _decision, _user, 'community', _req.community_id::text,
          jsonb_build_object('request_id', _request_id, 'target_user', _req.user_id));
END;
$$;
