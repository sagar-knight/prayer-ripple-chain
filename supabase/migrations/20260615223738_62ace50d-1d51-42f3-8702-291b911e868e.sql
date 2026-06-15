
-- Avatar moderation fields on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pending_avatar_url text,
  ADD COLUMN IF NOT EXISTS avatar_status text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS avatar_rejection_reason text,
  ADD COLUMN IF NOT EXISTS avatar_reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS avatar_reviewed_by uuid;

-- Friend requests
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending | accepted | declined | cancelled
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  CONSTRAINT friend_requests_no_self CHECK (requester_id <> recipient_id),
  CONSTRAINT friend_requests_unique_pair UNIQUE (requester_id, recipient_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.friend_requests TO authenticated;
GRANT ALL ON public.friend_requests TO service_role;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own friend requests" ON public.friend_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

CREATE POLICY "Users send friend requests" ON public.friend_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users update own outgoing or incoming" ON public.friend_requests
  FOR UPDATE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = requester_id OR auth.uid() = recipient_id);

CREATE POLICY "Users delete own outgoing" ON public.friend_requests
  FOR DELETE TO authenticated
  USING (auth.uid() = requester_id);

CREATE TRIGGER friend_requests_set_updated
  BEFORE UPDATE ON public.friend_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_now();

-- User blocks
CREATE TABLE IF NOT EXISTS public.user_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL,
  blocked_id uuid NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_blocks_no_self CHECK (blocker_id <> blocked_id),
  CONSTRAINT user_blocks_unique UNIQUE (blocker_id, blocked_id)
);

GRANT SELECT, INSERT, DELETE ON public.user_blocks TO authenticated;
GRANT ALL ON public.user_blocks TO service_role;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own blocks" ON public.user_blocks
  FOR SELECT TO authenticated USING (auth.uid() = blocker_id);

CREATE POLICY "Users create own blocks" ON public.user_blocks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users remove own blocks" ON public.user_blocks
  FOR DELETE TO authenticated USING (auth.uid() = blocker_id);

-- Admin review function for avatars
CREATE OR REPLACE FUNCTION public.review_pending_avatar(_profile_id uuid, _decision text, _reason text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user uuid := auth.uid();
  _pending text;
BEGIN
  IF NOT (public.has_role(_user, 'admin'::app_role) OR public.has_role(_user, 'moderator'::app_role)) THEN
    RAISE EXCEPTION 'Moderator access required';
  END IF;
  IF _decision NOT IN ('approved','rejected') THEN
    RAISE EXCEPTION 'Invalid decision';
  END IF;

  SELECT pending_avatar_url INTO _pending FROM public.profiles WHERE id = _profile_id;
  IF _pending IS NULL THEN
    RAISE EXCEPTION 'No pending avatar';
  END IF;

  IF _decision = 'approved' THEN
    UPDATE public.profiles
       SET avatar_url = _pending,
           pending_avatar_url = NULL,
           avatar_status = 'approved',
           avatar_rejection_reason = NULL,
           avatar_reviewed_at = now(),
           avatar_reviewed_by = _user,
           updated_at = now()
     WHERE id = _profile_id;
  ELSE
    UPDATE public.profiles
       SET pending_avatar_url = NULL,
           avatar_status = 'rejected',
           avatar_rejection_reason = _reason,
           avatar_reviewed_at = now(),
           avatar_reviewed_by = _user,
           updated_at = now()
     WHERE id = _profile_id;
  END IF;

  INSERT INTO public.admin_audit_log (actor_id, action, target_type, target_id, reason)
  VALUES (_user::text, 'avatar_' || _decision, 'profile', _profile_id::text, _reason);
END;
$$;
