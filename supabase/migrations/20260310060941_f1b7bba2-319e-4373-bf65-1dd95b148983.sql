
-- =============================================================
-- 1. Global Prayer Requests table (the new "global" scope)
-- =============================================================
CREATE TABLE public.global_prayer_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  anonymous BOOLEAN NOT NULL DEFAULT false,
  show_country BOOLEAN NOT NULL DEFAULT false,
  country TEXT,
  visibility TEXT NOT NULL DEFAULT 'public',
  status TEXT NOT NULL DEFAULT 'open',
  prayer_count INTEGER NOT NULL DEFAULT 0,
  answered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.global_prayer_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can read open public requests
CREATE POLICY "Anyone can view open global requests"
  ON public.global_prayer_requests FOR SELECT
  TO public
  USING (status = 'open' AND visibility = 'public');

-- Authenticated users can also see their own (any status)
CREATE POLICY "Users can view own requests"
  ON public.global_prayer_requests FOR SELECT
  TO authenticated
  USING (created_by = (auth.uid())::text);

-- Anyone can submit (visitor-friendly)
CREATE POLICY "Anyone can submit global prayer requests"
  ON public.global_prayer_requests FOR INSERT
  TO public
  WITH CHECK (true);

-- Creators can update their own requests
CREATE POLICY "Creators can update own requests"
  ON public.global_prayer_requests FOR UPDATE
  TO authenticated
  USING (created_by = (auth.uid())::text);

-- =============================================================
-- 2. Prayer Actions table (event log for all prayer scopes)
-- =============================================================
CREATE TABLE public.prayer_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prayer_id TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'global',
  user_id TEXT,
  action_type TEXT NOT NULL,
  metadata_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.prayer_actions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert actions (visitors can pray without login)
CREATE POLICY "Anyone can log prayer actions"
  ON public.prayer_actions FOR INSERT
  TO public
  WITH CHECK (true);

-- Authenticated users can view their own actions
CREATE POLICY "Users can view own actions"
  ON public.prayer_actions FOR SELECT
  TO authenticated
  USING (user_id = (auth.uid())::text);

-- =============================================================
-- 3. Prayer Coverage table (cached stats per request)
-- =============================================================
CREATE TABLE public.prayer_coverage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prayer_id TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'global',
  target_prayers INTEGER NOT NULL DEFAULT 3,
  current_prayers INTEGER NOT NULL DEFAULT 0,
  unique_people_prayed INTEGER NOT NULL DEFAULT 0,
  passed_forward_count INTEGER NOT NULL DEFAULT 0,
  last_prayed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (prayer_id, source_type)
);

ALTER TABLE public.prayer_coverage ENABLE ROW LEVEL SECURITY;

-- Anyone can read coverage (public stats)
CREATE POLICY "Anyone can view prayer coverage"
  ON public.prayer_coverage FOR SELECT
  TO public
  USING (true);

-- Service-level inserts/updates (via edge functions using service role)
CREATE POLICY "Anyone can insert coverage"
  ON public.prayer_coverage FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update coverage"
  ON public.prayer_coverage FOR UPDATE
  TO public
  USING (true);

-- =============================================================
-- 4. Prayer Assignments table
-- =============================================================
CREATE TABLE public.prayer_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prayer_id TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'global',
  assigned_user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.prayer_assignments ENABLE ROW LEVEL SECURITY;

-- Users can see their own assignments
CREATE POLICY "Users can view own assignments"
  ON public.prayer_assignments FOR SELECT
  TO authenticated
  USING (assigned_user_id = (auth.uid())::text);

-- Service-level insert
CREATE POLICY "Anyone can insert assignments"
  ON public.prayer_assignments FOR INSERT
  TO public
  WITH CHECK (true);

-- Users can update their own assignment status
CREATE POLICY "Users can update own assignments"
  ON public.prayer_assignments FOR UPDATE
  TO authenticated
  USING (assigned_user_id = (auth.uid())::text);

-- =============================================================
-- 5. App Events table (general event log)
-- =============================================================
CREATE TABLE public.app_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  actor_user_id TEXT,
  entity_type TEXT,
  entity_id TEXT,
  metadata_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.app_events ENABLE ROW LEVEL SECURITY;

-- Insert only (event log is append-only)
CREATE POLICY "Anyone can log events"
  ON public.app_events FOR INSERT
  TO public
  WITH CHECK (true);

-- No SELECT for regular users (admin-only in future)

-- =============================================================
-- 6. Indexes for performance
-- =============================================================
CREATE INDEX idx_global_prayers_status ON public.global_prayer_requests(status, visibility);
CREATE INDEX idx_global_prayers_created_by ON public.global_prayer_requests(created_by);
CREATE INDEX idx_global_prayers_category ON public.global_prayer_requests(category);
CREATE INDEX idx_global_prayers_country ON public.global_prayer_requests(country);
CREATE INDEX idx_global_prayers_created_at ON public.global_prayer_requests(created_at DESC);

CREATE INDEX idx_prayer_actions_prayer ON public.prayer_actions(prayer_id, source_type);
CREATE INDEX idx_prayer_actions_user ON public.prayer_actions(user_id);
CREATE INDEX idx_prayer_actions_type ON public.prayer_actions(action_type);

CREATE INDEX idx_prayer_coverage_prayer ON public.prayer_coverage(prayer_id, source_type);
CREATE INDEX idx_prayer_coverage_current ON public.prayer_coverage(current_prayers);

CREATE INDEX idx_prayer_assignments_user ON public.prayer_assignments(assigned_user_id, status);
CREATE INDEX idx_prayer_assignments_prayer ON public.prayer_assignments(prayer_id);

CREATE INDEX idx_app_events_type ON public.app_events(event_type);
CREATE INDEX idx_app_events_entity ON public.app_events(entity_type, entity_id);
CREATE INDEX idx_app_events_actor ON public.app_events(actor_user_id);

-- =============================================================
-- 7. Trigger: auto-create coverage row on new global prayer
-- =============================================================
CREATE OR REPLACE FUNCTION public.handle_new_global_prayer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.prayer_coverage (prayer_id, source_type, target_prayers)
  VALUES (NEW.id::text, 'global', 3);
  
  INSERT INTO public.app_events (event_type, actor_user_id, entity_type, entity_id)
  VALUES ('prayer_request_created', NEW.created_by, 'global_prayer_request', NEW.id::text);
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_global_prayer_created
  AFTER INSERT ON public.global_prayer_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_global_prayer();

-- =============================================================
-- 8. Function: record a prayer action + update coverage
-- =============================================================
CREATE OR REPLACE FUNCTION public.record_prayer_action(
  _prayer_id TEXT,
  _source_type TEXT,
  _user_id TEXT,
  _action_type TEXT,
  _metadata JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert the action
  INSERT INTO public.prayer_actions (prayer_id, source_type, user_id, action_type, metadata_json)
  VALUES (_prayer_id, _source_type, _user_id, _action_type, _metadata);

  -- Update coverage if action is 'prayed'
  IF _action_type = 'prayed' THEN
    INSERT INTO public.prayer_coverage (prayer_id, source_type, current_prayers, unique_people_prayed, last_prayed_at)
    VALUES (_prayer_id, _source_type, 1, 1, now())
    ON CONFLICT (prayer_id, source_type) DO UPDATE SET
      current_prayers = prayer_coverage.current_prayers + 1,
      unique_people_prayed = (
        SELECT COUNT(DISTINCT pa.user_id)
        FROM public.prayer_actions pa
        WHERE pa.prayer_id = _prayer_id
          AND pa.source_type = _source_type
          AND pa.action_type = 'prayed'
          AND pa.user_id IS NOT NULL
      ),
      last_prayed_at = now(),
      updated_at = now();

    -- Also update the prayer_count on global_prayer_requests
    IF _source_type = 'global' THEN
      UPDATE public.global_prayer_requests
      SET prayer_count = prayer_count + 1, updated_at = now()
      WHERE id = _prayer_id::uuid;
    END IF;
  END IF;

  IF _action_type = 'shared' THEN
    UPDATE public.prayer_coverage
    SET passed_forward_count = passed_forward_count + 1, updated_at = now()
    WHERE prayer_id = _prayer_id AND source_type = _source_type;
  END IF;

  -- Log app event
  INSERT INTO public.app_events (event_type, actor_user_id, entity_type, entity_id, metadata_json)
  VALUES ('prayer_' || _action_type, _user_id, _source_type || '_prayer', _prayer_id, _metadata);
END;
$$;

-- =============================================================
-- 9. Unified prayer view for selection service
-- =============================================================
CREATE OR REPLACE VIEW public.unified_prayer_feed AS
SELECT 
  g.id::text AS prayer_id,
  'global' AS source_type,
  NULL::uuid AS source_id,
  g.title,
  g.description,
  g.category,
  g.anonymous,
  g.show_country,
  g.country,
  g.visibility,
  g.status,
  g.created_by,
  g.created_at,
  g.updated_at,
  COALESCE(c.current_prayers, 0) AS prayer_count,
  COALESCE(c.unique_people_prayed, 0) AS unique_people_prayed,
  COALESCE(c.target_prayers, 3) AS target_prayers,
  c.last_prayed_at
FROM public.global_prayer_requests g
LEFT JOIN public.prayer_coverage c ON c.prayer_id = g.id::text AND c.source_type = 'global'
WHERE g.status = 'open' AND g.visibility = 'public';
