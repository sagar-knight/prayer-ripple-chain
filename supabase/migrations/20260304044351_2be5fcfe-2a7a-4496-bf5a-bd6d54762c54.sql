
-- Churches table
CREATE TABLE public.churches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  denomination text,
  city text,
  state text,
  country text NOT NULL DEFAULT '',
  address text,
  website text,
  phone text,
  contact_email text NOT NULL,
  logo_url text,
  privacy text NOT NULL DEFAULT 'public' CHECK (privacy IN ('public', 'members_only')),
  status text NOT NULL DEFAULT 'active',
  verified boolean NOT NULL DEFAULT false,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;

-- Church memberships table
CREATE TABLE public.church_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id uuid NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  status text NOT NULL DEFAULT 'active',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(church_id, user_id)
);

ALTER TABLE public.church_memberships ENABLE ROW LEVEL SECURITY;

-- Church prayer requests table
CREATE TABLE public.church_prayer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id uuid NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  submitted_by text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  anonymous boolean NOT NULL DEFAULT false,
  show_country boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by text,
  approved_at timestamptz,
  rejected_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.church_prayer_requests ENABLE ROW LEVEL SECURITY;

-- Helper function to check church membership role
CREATE OR REPLACE FUNCTION public.get_church_role(_user_id text, _church_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.church_memberships
  WHERE user_id = _user_id AND church_id = _church_id AND status = 'active'
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.is_church_member(_user_id text, _church_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.church_memberships
    WHERE user_id = _user_id AND church_id = _church_id AND status = 'active'
  )
$$;

-- Churches RLS
CREATE POLICY "Anyone can view active churches" ON public.churches
  FOR SELECT USING (status = 'active');

CREATE POLICY "Authenticated users can create churches" ON public.churches
  FOR INSERT TO authenticated WITH CHECK (created_by = (auth.uid())::text);

CREATE POLICY "Church admin can update" ON public.churches
  FOR UPDATE TO authenticated USING (public.get_church_role((auth.uid())::text, id) = 'admin');

-- Church memberships RLS
CREATE POLICY "Members can view church members" ON public.church_memberships
  FOR SELECT TO authenticated USING (
    public.is_church_member((auth.uid())::text, church_id) OR user_id = (auth.uid())::text
  );

CREATE POLICY "Users can join churches" ON public.church_memberships
  FOR INSERT TO authenticated WITH CHECK (user_id = (auth.uid())::text);

CREATE POLICY "Admins can update memberships" ON public.church_memberships
  FOR UPDATE TO authenticated USING (
    public.get_church_role((auth.uid())::text, church_id) IN ('admin', 'moderator')
  );

-- Church prayer requests RLS
CREATE POLICY "Members see approved requests or own" ON public.church_prayer_requests
  FOR SELECT TO authenticated USING (
    (status = 'approved' AND (
      (SELECT privacy FROM public.churches WHERE id = church_id) = 'public'
      OR public.is_church_member((auth.uid())::text, church_id)
    ))
    OR submitted_by = (auth.uid())::text
    OR public.get_church_role((auth.uid())::text, church_id) IN ('admin', 'moderator')
  );

CREATE POLICY "Visitors see approved public requests" ON public.church_prayer_requests
  FOR SELECT TO anon USING (
    status = 'approved' AND (SELECT privacy FROM public.churches WHERE id = church_id) = 'public'
  );

CREATE POLICY "Members can submit requests" ON public.church_prayer_requests
  FOR INSERT TO authenticated WITH CHECK (
    submitted_by = (auth.uid())::text AND public.is_church_member((auth.uid())::text, church_id)
  );

CREATE POLICY "Admins can update requests" ON public.church_prayer_requests
  FOR UPDATE TO authenticated USING (
    public.get_church_role((auth.uid())::text, church_id) IN ('admin', 'moderator')
    OR (submitted_by = (auth.uid())::text AND status = 'pending')
  );
