
-- Add test account fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_test_account boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS test_role_label text,
  ADD COLUMN IF NOT EXISTS exclude_from_analytics boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS internal_only boolean NOT NULL DEFAULT false;

-- Allow admins to view all profiles (needed for admin user management)
-- Currently profiles only has "users can view own profile" SELECT policy
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update any profile (for setting test account flags)
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
