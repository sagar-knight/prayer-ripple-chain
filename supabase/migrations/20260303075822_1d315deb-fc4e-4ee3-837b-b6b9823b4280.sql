
-- Family Groups
CREATE TABLE public.family_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by text NOT NULL,
  invite_code text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.family_groups ENABLE ROW LEVEL SECURITY;

-- Family Members
CREATE TABLE public.family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_group_id uuid REFERENCES public.family_groups(id) ON DELETE CASCADE NOT NULL,
  user_id text NOT NULL,
  display_name text,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active')),
  joined_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Family Prayer Requests
CREATE TABLE public.family_prayer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_group_id uuid REFERENCES public.family_groups(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  created_by text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'answered')),
  reminder_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.family_prayer_requests ENABLE ROW LEVEL SECURITY;

-- Family Prayer Logs
CREATE TABLE public.family_prayer_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES public.family_prayer_requests(id) ON DELETE CASCADE NOT NULL,
  user_id text NOT NULL,
  prayed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.family_prayer_logs ENABLE ROW LEVEL SECURITY;

-- Family Scriptures
CREATE TABLE public.family_scriptures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_group_id uuid REFERENCES public.family_groups(id) ON DELETE CASCADE NOT NULL,
  verse_reference text NOT NULL,
  translation text NOT NULL DEFAULT 'NIV',
  verse_text text NOT NULL,
  note text,
  shared_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.family_scriptures ENABLE ROW LEVEL SECURITY;

-- Family Notes / Testimonies
CREATE TABLE public.family_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_group_id uuid REFERENCES public.family_groups(id) ON DELETE CASCADE NOT NULL,
  note_text text NOT NULL,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.family_notes ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is a member of a family group
CREATE OR REPLACE FUNCTION public.is_family_member(_user_id text, _family_group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members
    WHERE user_id = _user_id
      AND family_group_id = _family_group_id
      AND status = 'active'
  )
$$;

-- RLS: family_groups - members can view their groups, creators can insert
CREATE POLICY "Members can view their family groups"
  ON public.family_groups FOR SELECT
  USING (public.is_family_member((auth.uid())::text, id) OR created_by = (auth.uid())::text);

CREATE POLICY "Users can create family groups"
  ON public.family_groups FOR INSERT
  WITH CHECK (created_by = (auth.uid())::text);

CREATE POLICY "Admins can update their family groups"
  ON public.family_groups FOR UPDATE
  USING (created_by = (auth.uid())::text);

-- RLS: family_members
CREATE POLICY "Members can view family members"
  ON public.family_members FOR SELECT
  USING (public.is_family_member((auth.uid())::text, family_group_id) OR user_id = (auth.uid())::text);

CREATE POLICY "Users can insert themselves as members"
  ON public.family_members FOR INSERT
  WITH CHECK (user_id = (auth.uid())::text);

CREATE POLICY "Admins can update members"
  ON public.family_members FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.family_members fm
    WHERE fm.family_group_id = family_members.family_group_id
      AND fm.user_id = (auth.uid())::text
      AND fm.role = 'admin'
      AND fm.status = 'active'
  ));

-- RLS: family_prayer_requests - only family members
CREATE POLICY "Family members can view requests"
  ON public.family_prayer_requests FOR SELECT
  USING (public.is_family_member((auth.uid())::text, family_group_id));

CREATE POLICY "Family members can create requests"
  ON public.family_prayer_requests FOR INSERT
  WITH CHECK (public.is_family_member((auth.uid())::text, family_group_id) AND created_by = (auth.uid())::text);

CREATE POLICY "Request creators can update"
  ON public.family_prayer_requests FOR UPDATE
  USING (created_by = (auth.uid())::text);

-- RLS: family_prayer_logs
CREATE POLICY "Family members can view logs"
  ON public.family_prayer_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.family_prayer_requests r
    WHERE r.id = family_prayer_logs.request_id
      AND public.is_family_member((auth.uid())::text, r.family_group_id)
  ));

CREATE POLICY "Family members can log prayers"
  ON public.family_prayer_logs FOR INSERT
  WITH CHECK (user_id = (auth.uid())::text AND EXISTS (
    SELECT 1 FROM public.family_prayer_requests r
    WHERE r.id = family_prayer_logs.request_id
      AND public.is_family_member((auth.uid())::text, r.family_group_id)
  ));

-- RLS: family_scriptures
CREATE POLICY "Family members can view scriptures"
  ON public.family_scriptures FOR SELECT
  USING (public.is_family_member((auth.uid())::text, family_group_id));

CREATE POLICY "Family members can share scriptures"
  ON public.family_scriptures FOR INSERT
  WITH CHECK (public.is_family_member((auth.uid())::text, family_group_id) AND shared_by = (auth.uid())::text);

-- RLS: family_notes
CREATE POLICY "Family members can view notes"
  ON public.family_notes FOR SELECT
  USING (public.is_family_member((auth.uid())::text, family_group_id));

CREATE POLICY "Family members can create notes"
  ON public.family_notes FOR INSERT
  WITH CHECK (public.is_family_member((auth.uid())::text, family_group_id) AND created_by = (auth.uid())::text);
