
-- Prayer invites table for tracking shareable invite links
CREATE TABLE public.prayer_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_id text NOT NULL,
  inviter_user_id text NOT NULL,
  invite_code text NOT NULL UNIQUE,
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  click_count integer NOT NULL DEFAULT 0,
  signup_count integer NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.prayer_invites ENABLE ROW LEVEL SECURITY;

-- Anyone can view invites (needed for landing page)
CREATE POLICY "Anyone can view invites" ON public.prayer_invites
  FOR SELECT TO public USING (true);

-- Anyone can create invites (visitors can pray without auth)
CREATE POLICY "Anyone can create invites" ON public.prayer_invites
  FOR INSERT TO public WITH CHECK (true);

-- Allow updating click/signup counts
CREATE POLICY "Anyone can update invite counts" ON public.prayer_invites
  FOR UPDATE TO public USING (true);

-- Index for fast invite code lookups
CREATE INDEX idx_prayer_invites_code ON public.prayer_invites (invite_code);
