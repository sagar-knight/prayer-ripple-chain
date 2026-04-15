
-- documentation_updates: master change log
CREATE TABLE public.documentation_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  update_id text NOT NULL DEFAULT ('UPD-' || substr(gen_random_uuid()::text, 1, 8)),
  title text NOT NULL,
  summary text,
  detailed_description text,
  module_keys text[] DEFAULT '{}',
  submodule_keys text[] DEFAULT '{}',
  change_type text NOT NULL DEFAULT 'feature',
  affected_roles text[] DEFAULT '{}',
  flow_types text[] DEFAULT '{}',
  source_reference text,
  version_tag text DEFAULT '1.0',
  status text NOT NULL DEFAULT 'logged',
  created_by text DEFAULT 'system',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.documentation_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view updates" ON public.documentation_updates FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert updates" ON public.documentation_updates FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can edit updates" ON public.documentation_updates FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete updates" ON public.documentation_updates FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- documentation_update_modules: links updates to doc modules
CREATE TABLE public.documentation_update_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  documentation_update_id uuid NOT NULL REFERENCES public.documentation_updates(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES public.documentation_modules(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.documentation_update_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage update modules" ON public.documentation_update_modules FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- documentation_update_notes: notes on updates
CREATE TABLE public.documentation_update_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  documentation_update_id uuid NOT NULL REFERENCES public.documentation_updates(id) ON DELETE CASCADE,
  note_title text NOT NULL,
  note_body text,
  author text DEFAULT 'Admin',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.documentation_update_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage update notes" ON public.documentation_update_notes FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- test_case_update_links: links updates to test cases
CREATE TABLE public.test_case_update_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  documentation_update_id uuid NOT NULL REFERENCES public.documentation_updates(id) ON DELETE CASCADE,
  test_case_id uuid NOT NULL REFERENCES public.test_cases(id) ON DELETE CASCADE,
  link_type text NOT NULL DEFAULT 'impacted',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.test_case_update_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage test links" ON public.test_case_update_links FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- module_change_history: per-module change summary
CREATE TABLE public.module_change_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.documentation_modules(id) ON DELETE CASCADE,
  documentation_update_id uuid NOT NULL REFERENCES public.documentation_updates(id) ON DELETE CASCADE,
  change_summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.module_change_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage change history" ON public.module_change_history FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
