CREATE OR REPLACE FUNCTION public.submit_content_report(_entity_type text, _entity_id text, _reason text, _details text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  ELSIF _entity_type IN ('family_prayer','family_request') THEN
    SELECT title, left(coalesce(description,''), 280), 'family'
      INTO _title, _preview, _source
      FROM public.family_prayer_requests WHERE id::text = _entity_id;
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
$function$;