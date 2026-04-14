
-- Documentation modules table
CREATE TABLE public.documentation_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key text NOT NULL UNIQUE,
  module_name text NOT NULL,
  parent_module text,
  slug text,
  description text,
  access_roles text[] DEFAULT '{admin}',
  version text DEFAULT '1.0',
  status text DEFAULT 'active',
  content_json jsonb DEFAULT '{}'::jsonb,
  last_updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.documentation_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view docs" ON public.documentation_modules
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert docs" ON public.documentation_modules
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update docs" ON public.documentation_modules
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete docs" ON public.documentation_modules
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Documentation notes table
CREATE TABLE public.documentation_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  documentation_module_id uuid REFERENCES public.documentation_modules(id) ON DELETE CASCADE NOT NULL,
  note_title text NOT NULL,
  note_body text,
  note_type text DEFAULT 'update',
  version_tag text,
  updated_by text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.documentation_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view doc notes" ON public.documentation_notes
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert doc notes" ON public.documentation_notes
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update doc notes" ON public.documentation_notes
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete doc notes" ON public.documentation_notes
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Documentation screenshots table
CREATE TABLE public.documentation_screenshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  documentation_module_id uuid REFERENCES public.documentation_modules(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  image_url text NOT NULL,
  caption text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.documentation_screenshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view screenshots" ON public.documentation_screenshots
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert screenshots" ON public.documentation_screenshots
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update screenshots" ON public.documentation_screenshots
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete screenshots" ON public.documentation_screenshots
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Test modules table
CREATE TABLE public.test_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key text NOT NULL UNIQUE,
  module_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.test_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view test modules" ON public.test_modules
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert test modules" ON public.test_modules
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update test modules" ON public.test_modules
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Test cases table
CREATE TABLE public.test_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES public.test_modules(id) ON DELETE CASCADE NOT NULL,
  feature_name text NOT NULL,
  title text NOT NULL,
  description text,
  preconditions text,
  steps_json jsonb DEFAULT '[]'::jsonb,
  test_data text,
  expected_result text,
  actual_result text,
  priority text DEFAULT 'medium',
  severity text DEFAULT 'medium',
  role_tested text DEFAULT 'user',
  status text DEFAULT 'not_run',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.test_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view test cases" ON public.test_cases
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert test cases" ON public.test_cases
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update test cases" ON public.test_cases
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete test cases" ON public.test_cases
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage bucket for doc screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('doc-screenshots', 'doc-screenshots', true);

CREATE POLICY "Admins can upload screenshots" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'doc-screenshots' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view doc screenshots" ON storage.objects
  FOR SELECT USING (bucket_id = 'doc-screenshots');

CREATE POLICY "Admins can delete screenshots" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'doc-screenshots' AND has_role(auth.uid(), 'admin'::app_role));
