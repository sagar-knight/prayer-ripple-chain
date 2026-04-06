
-- Secure RPC for anonymous invite lookup by code
CREATE OR REPLACE FUNCTION public.get_invite_by_code(_invite_code text)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'id', pi.id,
    'prayer_id', pi.prayer_id,
    'inviter_user_id', pi.inviter_user_id,
    'invite_code', pi.invite_code,
    'message', pi.message,
    'prayer', json_build_object(
      'id', gpr.id,
      'title', gpr.title,
      'description', gpr.description,
      'category', gpr.category,
      'anonymous', gpr.anonymous,
      'prayer_count', gpr.prayer_count
    ),
    'inviter_name', COALESCE(p.display_name, 'Someone')
  ) INTO result
  FROM public.prayer_invites pi
  LEFT JOIN public.global_prayer_requests gpr ON gpr.id = pi.prayer_id::uuid
  LEFT JOIN public.profiles p ON p.id = pi.inviter_user_id::uuid
  WHERE pi.invite_code = _invite_code;

  RETURN result;
END;
$$;
