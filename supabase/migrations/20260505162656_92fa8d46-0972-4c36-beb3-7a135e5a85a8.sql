-- 1. Add hidden_at to content tables so moderation can actually hide
ALTER TABLE public.global_prayer_requests ADD COLUMN IF NOT EXISTS hidden_at timestamptz;
ALTER TABLE public.church_prayer_requests ADD COLUMN IF NOT EXISTS hidden_at timestamptz;
ALTER TABLE public.family_prayer_requests ADD COLUMN IF NOT EXISTS hidden_at timestamptz;
ALTER TABLE public.family_notes ADD COLUMN IF NOT EXISTS hidden_at timestamptz;
ALTER TABLE public.family_scriptures ADD COLUMN IF NOT EXISTS hidden_at timestamptz;

-- 2. Update SELECT RLS so hidden content disappears for non-admins
DROP POLICY IF EXISTS "Authenticated users can view active global requests" ON public.global_prayer_requests;
CREATE POLICY "Authenticated users can view active global requests"
  ON public.global_prayer_requests FOR SELECT TO authenticated
  USING (
    status = ANY (ARRAY['open','progress','answered'])
    AND visibility = 'public'
    AND hidden_at IS NULL
  );

DROP POLICY IF EXISTS "Members see approved requests or own" ON public.church_prayer_requests;
CREATE POLICY "Members see approved requests or own"
  ON public.church_prayer_requests FOR SELECT TO authenticated
  USING (
    (
      hidden_at IS NULL AND status = 'approved'
      AND (
        (SELECT churches.privacy FROM churches WHERE churches.id = church_prayer_requests.church_id) = 'public'
        OR is_church_member((auth.uid())::text, church_id)
      )
    )
    OR submitted_by = (auth.uid())::text
    OR get_church_role((auth.uid())::text, church_id) = ANY (ARRAY['admin','moderator'])
  );

DROP POLICY IF EXISTS "Visitors see approved public requests" ON public.church_prayer_requests;
CREATE POLICY "Visitors see approved public requests"
  ON public.church_prayer_requests FOR SELECT TO anon
  USING (
    hidden_at IS NULL
    AND status = 'approved'
    AND (SELECT churches.privacy FROM churches WHERE churches.id = church_prayer_requests.church_id) = 'public'
  );

DROP POLICY IF EXISTS "Family members can view requests" ON public.family_prayer_requests;
CREATE POLICY "Family members can view requests"
  ON public.family_prayer_requests FOR SELECT TO authenticated
  USING (is_family_member((auth.uid())::text, family_group_id) AND hidden_at IS NULL);

DROP POLICY IF EXISTS "Family members can view notes" ON public.family_notes;
CREATE POLICY "Family members can view notes"
  ON public.family_notes FOR SELECT TO authenticated
  USING (is_family_member((auth.uid())::text, family_group_id) AND hidden_at IS NULL);

DROP POLICY IF EXISTS "Family members can view scriptures" ON public.family_scriptures;
CREATE POLICY "Family members can view scriptures"
  ON public.family_scriptures FOR SELECT TO authenticated
  USING (is_family_member((auth.uid())::text, family_group_id) AND hidden_at IS NULL);

-- 3. RPC: any authenticated user can submit a report -> creates moderation_queue row
CREATE OR REPLACE FUNCTION public.submit_content_report(
  _entity_type text,
  _entity_id text,
  _reason text,
  _details text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user uuid := auth.uid();
  _queue_id uuid;
  _preview text;
  _title text;
  _source text := 'global';
BEGIN
  IF _user IS NULL THEN
    RAISE EXCEPTION 'Authentication required to report content';
  END IF;

  IF _entity_type = 'global_prayer' THEN
    SELECT title, left(coalesce(description,''), 280), 'global'
      INTO _title, _preview, _source
      FROM public.global_prayer_requests WHERE id::text = _entity_id;
  ELSIF _entity_type = 'church_prayer' THEN
    SELECT title, left(coalesce(description,''), 280), 'church'
      INTO _title, _preview, _source
      FROM public.church_prayer_requests WHERE id::text = _entity_id;
  ELSIF _entity_type = 'family_note' THEN
    SELECT 'Family note', left(coalesce(note_text,''), 280), 'family'
      INTO _title, _preview, _source
      FROM public.family_notes WHERE id::text = _entity_id;
  ELSIF _entity_type = 'family_scripture' THEN
    SELECT verse_reference, left(coalesce(verse_text,''), 280), 'family'
      INTO _title, _preview, _source
      FROM public.family_scriptures WHERE id::text = _entity_id;
  END IF;

  INSERT INTO public.moderation_queue (
    content_type, content_id, source_type, source_id,
    title, content_preview, submitted_by, reason,
    moderation_source, status, metadata_json
  ) VALUES (
    _entity_type, _entity_id, _source, _entity_id,
    _title, _preview, _user::text, _reason,
    'user_report', 'pending',
    jsonb_build_object('details', _details, 'reported_by', _user::text)
  )
  RETURNING id INTO _queue_id;

  INSERT INTO public.app_events (event_type, actor_user_id, entity_type, entity_id, metadata_json)
  VALUES ('content_reported', _user::text, _entity_type, _entity_id,
          jsonb_build_object('reason', _reason, 'details', _details, 'queue_id', _queue_id));

  RETURN _queue_id;
END;
$$;

-- 4. RPC: admin/moderator decision that also hides/unhides underlying content
CREATE OR REPLACE FUNCTION public.apply_moderation_decision(
  _queue_id uuid,
  _new_status text,
  _notes text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user uuid := auth.uid();
  _row record;
  _hide_ts timestamptz;
BEGIN
  IF NOT (public.has_role(_user, 'admin'::app_role) OR public.has_role(_user, 'moderator'::app_role)) THEN
    RAISE EXCEPTION 'Moderator access required';
  END IF;

  IF _new_status NOT IN ('approved','denied','hidden','removed','pending','flagged') THEN
    RAISE EXCEPTION 'Invalid moderation status %', _new_status;
  END IF;

  UPDATE public.moderation_queue
     SET status = _new_status,
         reviewed_by = _user::text,
         reviewed_at = now(),
         admin_notes = COALESCE(_notes, admin_notes),
         updated_at = now()
   WHERE id = _queue_id
   RETURNING content_type, content_id INTO _row;

  IF _row.content_type IS NULL THEN
    RAISE EXCEPTION 'Queue item not found';
  END IF;

  IF _new_status IN ('hidden','removed','denied') THEN
    _hide_ts := now();
  ELSIF _new_status IN ('approved','pending') THEN
    _hide_ts := NULL;
  END IF;

  IF _new_status IN ('hidden','removed','denied','approved','pending') THEN
    IF _row.content_type = 'global_prayer' THEN
      UPDATE public.global_prayer_requests SET hidden_at = _hide_ts, updated_at = now()
       WHERE id::text = _row.content_id;
    ELSIF _row.content_type = 'church_prayer' THEN
      UPDATE public.church_prayer_requests SET hidden_at = _hide_ts, updated_at = now()
       WHERE id::text = _row.content_id;
    ELSIF _row.content_type = 'family_note' THEN
      UPDATE public.family_notes SET hidden_at = _hide_ts WHERE id::text = _row.content_id;
    ELSIF _row.content_type = 'family_scripture' THEN
      UPDATE public.family_scriptures SET hidden_at = _hide_ts WHERE id::text = _row.content_id;
    ELSIF _row.content_type IN ('family_prayer','family_request') THEN
      UPDATE public.family_prayer_requests SET hidden_at = _hide_ts WHERE id::text = _row.content_id;
    END IF;
  END IF;

  INSERT INTO public.admin_audit_log (actor_id, action, target_type, target_id, reason)
  VALUES (_user::text, _new_status, 'moderation_item', _queue_id::text, _notes);
END;
$$;