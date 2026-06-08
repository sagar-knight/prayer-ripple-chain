CREATE OR REPLACE FUNCTION public.leave_community(_community_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user text := (auth.uid())::text;
  _role text;
  _is_owner boolean;
  _other_admin_count int;
BEGIN
  IF _user IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT (created_by = _user) INTO _is_owner FROM public.churches WHERE id = _community_id;
  IF _is_owner THEN
    RAISE EXCEPTION 'Community owners cannot leave their own community';
  END IF;

  SELECT role INTO _role FROM public.church_memberships
   WHERE church_id = _community_id AND user_id = _user AND status = 'active';
  IF _role IS NULL THEN
    RAISE EXCEPTION 'You are not a member of this community';
  END IF;

  IF _role IN ('admin','owner') THEN
    SELECT count(*) INTO _other_admin_count FROM public.church_memberships
     WHERE church_id = _community_id
       AND status = 'active'
       AND user_id <> _user
       AND role IN ('admin','owner');
    IF _other_admin_count = 0 THEN
      RAISE EXCEPTION 'You are the last admin. Promote another member to admin before leaving.';
    END IF;
  END IF;

  DELETE FROM public.church_memberships
   WHERE church_id = _community_id AND user_id = _user;

  INSERT INTO public.app_events (event_type, actor_user_id, entity_type, entity_id)
  VALUES ('community_left', _user, 'community', _community_id::text);
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_community_join_request(_request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user text := (auth.uid())::text;
  _row record;
BEGIN
  IF _user IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  SELECT * INTO _row FROM public.community_join_requests WHERE id = _request_id;
  IF _row IS NULL THEN RAISE EXCEPTION 'Request not found'; END IF;
  IF _row.user_id <> _user THEN RAISE EXCEPTION 'You can only cancel your own request'; END IF;
  IF _row.status <> 'pending' THEN RAISE EXCEPTION 'Only pending requests can be cancelled'; END IF;

  UPDATE public.community_join_requests
     SET status = 'cancelled', updated_at = now()
   WHERE id = _request_id;

  INSERT INTO public.app_events (event_type, actor_user_id, entity_type, entity_id, metadata_json)
  VALUES ('community_join_cancelled', _user, 'community', _row.community_id::text,
          jsonb_build_object('request_id', _request_id));
END;
$$;