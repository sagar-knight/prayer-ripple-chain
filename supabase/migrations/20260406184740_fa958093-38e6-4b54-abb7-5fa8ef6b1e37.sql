-- =============================================================
-- 1. prayer_coverage: Remove public INSERT/UPDATE
--    (managed by record_prayer_action SECURITY DEFINER function)
-- =============================================================
DROP POLICY IF EXISTS "Anyone can insert coverage" ON public.prayer_coverage;
DROP POLICY IF EXISTS "Anyone can update coverage" ON public.prayer_coverage;
-- No replacement needed; record_prayer_action bypasses RLS

-- =============================================================
-- 2. prayer_actions: Remove public INSERT
--    (managed by record_prayer_action SECURITY DEFINER function)
-- =============================================================
DROP POLICY IF EXISTS "Anyone can log prayer actions" ON public.prayer_actions;
-- No replacement needed; record_prayer_action bypasses RLS

-- =============================================================
-- 3. prayer_assignments: Restrict to authenticated users
-- =============================================================
DROP POLICY IF EXISTS "Anyone can insert assignments" ON public.prayer_assignments;
CREATE POLICY "Authenticated users can create assignments"
  ON public.prayer_assignments FOR INSERT TO authenticated
  WITH CHECK (assigned_user_id = (auth.uid())::text);

-- =============================================================
-- 4. prayer_invites: Tighten INSERT and UPDATE
-- =============================================================
DROP POLICY IF EXISTS "Anyone can create invites" ON public.prayer_invites;
CREATE POLICY "Authenticated users can create invites"
  ON public.prayer_invites FOR INSERT TO authenticated
  WITH CHECK (inviter_user_id = (auth.uid())::text);

DROP POLICY IF EXISTS "Anyone can update invite counts" ON public.prayer_invites;
CREATE POLICY "Invite owners can update invites"
  ON public.prayer_invites FOR UPDATE TO authenticated
  USING (inviter_user_id = (auth.uid())::text);

-- Create SECURITY DEFINER function for anonymous click tracking
CREATE OR REPLACE FUNCTION public.increment_invite_click(_invite_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.prayer_invites
  SET click_count = click_count + 1
  WHERE id = _invite_id;
END;
$$;

-- =============================================================
-- 5. global_prayer_requests: Restrict to authenticated users
-- =============================================================
DROP POLICY IF EXISTS "Anyone can submit global prayer requests" ON public.global_prayer_requests;
CREATE POLICY "Authenticated users can submit prayer requests"
  ON public.global_prayer_requests FOR INSERT TO authenticated
  WITH CHECK (created_by = (auth.uid())::text);

-- =============================================================
-- 6. app_events: Restrict INSERT to authenticated with ownership
-- =============================================================
DROP POLICY IF EXISTS "Anyone can log events" ON public.app_events;
CREATE POLICY "Authenticated users can log events"
  ON public.app_events FOR INSERT TO authenticated
  WITH CHECK (actor_user_id = (auth.uid())::text OR actor_user_id IS NULL);

-- Create SECURITY DEFINER function for anonymous event logging
CREATE OR REPLACE FUNCTION public.log_public_event(
  _event_type text,
  _entity_type text DEFAULT NULL,
  _entity_id text DEFAULT NULL,
  _metadata jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.app_events (event_type, actor_user_id, entity_type, entity_id, metadata_json)
  VALUES (_event_type, NULL, _entity_type, _entity_id, _metadata);
END;
$$;

-- =============================================================
-- 7. moderation_queue: Restrict inserts
--    (edge functions use service role, bypass RLS)
-- =============================================================
DROP POLICY IF EXISTS "System and admins can insert into queue" ON public.moderation_queue;
DROP POLICY IF EXISTS "System can insert moderation items" ON public.moderation_queue;
CREATE POLICY "Admins and moderators can insert into queue"
  ON public.moderation_queue FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

-- =============================================================
-- 8. prayer_chain_nodes: Add missing UPDATE/DELETE policies
-- =============================================================
CREATE POLICY "Users can update their own chain nodes"
  ON public.prayer_chain_nodes FOR UPDATE TO authenticated
  USING (user_id = (auth.uid())::text);

CREATE POLICY "Users can delete their own chain nodes"
  ON public.prayer_chain_nodes FOR DELETE TO authenticated
  USING (user_id = (auth.uid())::text);