-- ============================================================
-- FIX 1: prayer_actions — add strict INSERT policy (defense in depth)
-- ============================================================
CREATE POLICY "Users can insert own prayer actions"
ON public.prayer_actions
FOR INSERT
TO authenticated
WITH CHECK (user_id = (auth.uid())::text);

-- ============================================================
-- FIX 2: family_members — require valid invite_code to join
-- ============================================================
-- Tighten direct INSERT: only the family creator can self-insert (bootstrap)
DROP POLICY IF EXISTS "Users can insert themselves as members" ON public.family_members;

CREATE POLICY "Family creator can self-insert"
ON public.family_members
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = (auth.uid())::text
  AND role = 'member'
  AND EXISTS (
    SELECT 1 FROM public.family_groups fg
    WHERE fg.id = family_members.family_group_id
      AND fg.created_by = (auth.uid())::text
  )
);

-- Secure RPC: join a family group by invite_code
CREATE OR REPLACE FUNCTION public.join_family_by_invite(_invite_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _family_id uuid;
  _user_id text := (auth.uid())::text;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT id INTO _family_id
  FROM public.family_groups
  WHERE invite_code = _invite_code
  LIMIT 1;

  IF _family_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;

  INSERT INTO public.family_members (family_group_id, user_id, role, status)
  VALUES (_family_id, _user_id, 'member', 'active')
  ON CONFLICT DO NOTHING;

  RETURN _family_id;
END;
$$;

REVOKE ALL ON FUNCTION public.join_family_by_invite(text) FROM public;
GRANT EXECUTE ON FUNCTION public.join_family_by_invite(text) TO authenticated;

-- ============================================================
-- FIX 3: churches — hide contact_email & phone from non-members
-- ============================================================
-- Drop the broad "all authenticated can view" policy
DROP POLICY IF EXISTS "Authenticated users can view active churches" ON public.churches;

-- Members & church admins can see the full record (incl. contact_email/phone)
CREATE POLICY "Members and admins can view full church"
ON public.churches
FOR SELECT
TO authenticated
USING (
  status = 'active'
  AND (
    public.is_church_member((auth.uid())::text, id)
    OR public.get_church_role((auth.uid())::text, id) = ANY (ARRAY['admin','moderator'])
    OR created_by = (auth.uid())::text
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

-- Ensure churches_public view runs as querying user (no contact fields)
ALTER VIEW public.churches_public SET (security_invoker = true);

-- Allow public/anon read of churches_public (it already excludes contact info)
GRANT SELECT ON public.churches_public TO anon, authenticated;