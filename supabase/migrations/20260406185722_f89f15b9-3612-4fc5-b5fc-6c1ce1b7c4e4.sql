
-- 1. Remove realtime publishing for sensitive tables
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE public.moderation_queue;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE public.app_events;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 2. Fix app_events SELECT: only admins/moderators can read report events
DROP POLICY IF EXISTS "Authenticated users can read reports" ON public.app_events;
CREATE POLICY "Admins can read report events"
ON public.app_events
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role)
);

CREATE POLICY "Users can read own events"
ON public.app_events
FOR SELECT
TO authenticated
USING (actor_user_id = (auth.uid())::text);

-- 3. Fix prayer_invites: replace blanket public read with scoped access
DROP POLICY IF EXISTS "Anyone can view invites" ON public.prayer_invites;

CREATE POLICY "Invite owners can view their invites"
ON public.prayer_invites
FOR SELECT
TO authenticated
USING (inviter_user_id = (auth.uid())::text);

-- 4. Create a secure public view for churches (without sensitive contact info)
CREATE OR REPLACE VIEW public.churches_public AS
SELECT id, name, denomination, city, state, country, logo_url, privacy, status, verified, slug, created_at
FROM public.churches
WHERE status = 'active';

-- 5. Let users read their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());
