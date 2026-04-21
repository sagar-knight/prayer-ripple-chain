-- ============================================================
-- FIX: Restrict family_* tables from {public} → {authenticated}
-- (Existing policies already check auth.uid(), but role scope
--  should never be {public} for private data.)
-- ============================================================

-- family_groups
DROP POLICY IF EXISTS "Members can view their family groups" ON public.family_groups;
DROP POLICY IF EXISTS "Users can create family groups" ON public.family_groups;
DROP POLICY IF EXISTS "Admins can update their family groups" ON public.family_groups;

CREATE POLICY "Members can view their family groups"
ON public.family_groups FOR SELECT TO authenticated
USING (public.is_family_member((auth.uid())::text, id) OR created_by = (auth.uid())::text);

CREATE POLICY "Users can create family groups"
ON public.family_groups FOR INSERT TO authenticated
WITH CHECK (created_by = (auth.uid())::text);

CREATE POLICY "Admins can update their family groups"
ON public.family_groups FOR UPDATE TO authenticated
USING (created_by = (auth.uid())::text);

-- family_members
DROP POLICY IF EXISTS "Members can view family members" ON public.family_members;
DROP POLICY IF EXISTS "Admins can update members" ON public.family_members;

CREATE POLICY "Members can view family members"
ON public.family_members FOR SELECT TO authenticated
USING (public.is_family_member((auth.uid())::text, family_group_id) OR user_id = (auth.uid())::text);

CREATE POLICY "Admins can update members"
ON public.family_members FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.family_members fm
  WHERE fm.family_group_id = family_members.family_group_id
    AND fm.user_id = (auth.uid())::text
    AND fm.role = 'admin'
    AND fm.status = 'active'
));

-- family_notes
DROP POLICY IF EXISTS "Family members can view notes" ON public.family_notes;
DROP POLICY IF EXISTS "Family members can create notes" ON public.family_notes;

CREATE POLICY "Family members can view notes"
ON public.family_notes FOR SELECT TO authenticated
USING (public.is_family_member((auth.uid())::text, family_group_id));

CREATE POLICY "Family members can create notes"
ON public.family_notes FOR INSERT TO authenticated
WITH CHECK (public.is_family_member((auth.uid())::text, family_group_id) AND created_by = (auth.uid())::text);

-- family_prayer_requests
DROP POLICY IF EXISTS "Family members can view requests" ON public.family_prayer_requests;
DROP POLICY IF EXISTS "Family members can create requests" ON public.family_prayer_requests;
DROP POLICY IF EXISTS "Request creators can update" ON public.family_prayer_requests;

CREATE POLICY "Family members can view requests"
ON public.family_prayer_requests FOR SELECT TO authenticated
USING (public.is_family_member((auth.uid())::text, family_group_id));

CREATE POLICY "Family members can create requests"
ON public.family_prayer_requests FOR INSERT TO authenticated
WITH CHECK (public.is_family_member((auth.uid())::text, family_group_id) AND created_by = (auth.uid())::text);

CREATE POLICY "Request creators can update"
ON public.family_prayer_requests FOR UPDATE TO authenticated
USING (created_by = (auth.uid())::text);

-- family_prayer_logs
DROP POLICY IF EXISTS "Family members can view logs" ON public.family_prayer_logs;
DROP POLICY IF EXISTS "Family members can log prayers" ON public.family_prayer_logs;

CREATE POLICY "Family members can view logs"
ON public.family_prayer_logs FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.family_prayer_requests r
  WHERE r.id = family_prayer_logs.request_id
    AND public.is_family_member((auth.uid())::text, r.family_group_id)
));

CREATE POLICY "Family members can log prayers"
ON public.family_prayer_logs FOR INSERT TO authenticated
WITH CHECK (user_id = (auth.uid())::text AND EXISTS (
  SELECT 1 FROM public.family_prayer_requests r
  WHERE r.id = family_prayer_logs.request_id
    AND public.is_family_member((auth.uid())::text, r.family_group_id)
));

-- family_scriptures
DROP POLICY IF EXISTS "Family members can view scriptures" ON public.family_scriptures;
DROP POLICY IF EXISTS "Family members can share scriptures" ON public.family_scriptures;

CREATE POLICY "Family members can view scriptures"
ON public.family_scriptures FOR SELECT TO authenticated
USING (public.is_family_member((auth.uid())::text, family_group_id));

CREATE POLICY "Family members can share scriptures"
ON public.family_scriptures FOR INSERT TO authenticated
WITH CHECK (public.is_family_member((auth.uid())::text, family_group_id) AND shared_by = (auth.uid())::text);

-- ============================================================
-- FIX: Add missing UPDATE policy on doc-screenshots bucket
-- ============================================================
CREATE POLICY "Admins can update doc screenshots"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'doc-screenshots' AND public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (bucket_id = 'doc-screenshots' AND public.has_role(auth.uid(), 'admin'::public.app_role));