CREATE OR REPLACE FUNCTION public.set_updated_at_now() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TABLE IF NOT EXISTS public.go_live_plan_notes (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), note_title text NOT NULL, note_body text, author text, created_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE public.go_live_plan_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY admins_select_glp ON public.go_live_plan_notes FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY admins_insert_glp ON public.go_live_plan_notes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY admins_update_glp ON public.go_live_plan_notes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY admins_delete_glp ON public.go_live_plan_notes FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER set_go_live_plan_notes_updated_at BEFORE UPDATE ON public.go_live_plan_notes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_now();