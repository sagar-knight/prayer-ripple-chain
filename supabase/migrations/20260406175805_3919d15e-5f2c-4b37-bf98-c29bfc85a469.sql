
-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. RLS policies for user_roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. Moderation queue table
CREATE TABLE public.moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL, -- 'prayer_request', 'church', 'family_note', 'report'
  content_id TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'global', -- 'global', 'church', 'family'
  source_id TEXT,
  title TEXT,
  content_preview TEXT,
  submitted_by TEXT,
  reason TEXT, -- 'profanity', 'spam', 'ai_flagged', 'user_report', 'manual'
  moderation_source TEXT NOT NULL DEFAULT 'system', -- 'system', 'ai', 'user_report', 'admin'
  confidence_score NUMERIC(4,2),
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, denied, auto-approved, auto-denied, flagged, hidden, removed
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,
  metadata_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view moderation queue"
  ON public.moderation_queue FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "System and admins can insert into queue"
  ON public.moderation_queue FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update queue items"
  ON public.moderation_queue FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Allow anon inserts for system/edge function use
CREATE POLICY "System can insert moderation items"
  ON public.moderation_queue FOR INSERT TO anon
  WITH CHECK (true);

-- 6. Automation rules table
CREATE TABLE public.automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  rule_type TEXT NOT NULL, -- 'auto_approve', 'auto_deny', 'send_to_review'
  conditions JSONB NOT NULL DEFAULT '{}',
  enabled BOOLEAN NOT NULL DEFAULT false,
  priority INTEGER NOT NULL DEFAULT 0,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view rules"
  ON public.automation_rules FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage rules"
  ON public.automation_rules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 7. Admin audit log
CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id TEXT NOT NULL, -- admin user id or 'system'
  action TEXT NOT NULL, -- 'approve', 'deny', 'suspend_user', 'approve_church', etc.
  target_type TEXT NOT NULL, -- 'prayer_request', 'user', 'church', 'report'
  target_id TEXT NOT NULL,
  reason TEXT,
  metadata_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log"
  ON public.admin_audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins and system can insert audit log"
  ON public.admin_audit_log FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- 8. Seed default automation rules
INSERT INTO public.automation_rules (name, description, rule_type, conditions, enabled, priority) VALUES
  ('Auto-approve clean prayers', 'Automatically approve prayer requests with no flagged words from trusted users', 'auto_approve', '{"min_user_age_days": 7, "no_profanity": true, "max_length": 500}', false, 10),
  ('Auto-deny profanity', 'Automatically deny content containing profanity or hate speech', 'auto_deny', '{"profanity_detected": true}', true, 100),
  ('Auto-deny spam links', 'Automatically deny content containing suspicious URLs', 'auto_deny', '{"contains_urls": true, "spam_score_above": 0.8}', true, 90),
  ('Flag uncertain content', 'Send content with uncertain AI scores to manual review', 'send_to_review', '{"ai_score_between": [0.3, 0.7]}', true, 50),
  ('Flag rapid submissions', 'Flag users submitting more than 5 items in 10 minutes', 'send_to_review', '{"max_submissions_per_10min": 5}', true, 80);
