
-- User flows table
CREATE TABLE public.documentation_user_flows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.documentation_modules(id) ON DELETE CASCADE,
  flow_name text NOT NULL,
  flow_type text NOT NULL DEFAULT 'primary',
  steps_json jsonb DEFAULT '[]'::jsonb,
  role_type text NOT NULL DEFAULT 'user',
  version text DEFAULT '1.0',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.documentation_user_flows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view flows" ON public.documentation_user_flows FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert flows" ON public.documentation_user_flows FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update flows" ON public.documentation_user_flows FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete flows" ON public.documentation_user_flows FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Flow steps table
CREATE TABLE public.documentation_flow_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id uuid NOT NULL REFERENCES public.documentation_user_flows(id) ON DELETE CASCADE,
  step_number integer NOT NULL DEFAULT 0,
  step_title text NOT NULL,
  step_description text,
  system_action text,
  expected_result text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.documentation_flow_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view flow steps" ON public.documentation_flow_steps FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert flow steps" ON public.documentation_flow_steps FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update flow steps" ON public.documentation_flow_steps FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete flow steps" ON public.documentation_flow_steps FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
