
-- Public prayer reads: filter by visibility/status with hidden_at IS NULL
CREATE INDEX IF NOT EXISTS idx_global_prayers_public_active
  ON public.global_prayer_requests (visibility, status)
  WHERE hidden_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_global_prayers_short_code
  ON public.global_prayer_requests (short_code);

-- Church prayer wall lookups
CREATE INDEX IF NOT EXISTS idx_church_prayers_church_status
  ON public.church_prayer_requests (church_id, status)
  WHERE hidden_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_church_prayers_submitted_by
  ON public.church_prayer_requests (submitted_by);

-- Family
CREATE INDEX IF NOT EXISTS idx_family_members_user
  ON public.family_members (user_id, status);
CREATE INDEX IF NOT EXISTS idx_family_members_group
  ON public.family_members (family_group_id, status);
CREATE INDEX IF NOT EXISTS idx_family_prayer_requests_group
  ON public.family_prayer_requests (family_group_id)
  WHERE hidden_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_family_notes_group
  ON public.family_notes (family_group_id)
  WHERE hidden_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_family_scriptures_group
  ON public.family_scriptures (family_group_id)
  WHERE hidden_at IS NULL;

-- Chain / ripple lookups
CREATE INDEX IF NOT EXISTS idx_prayer_chain_nodes_prayer
  ON public.prayer_chain_nodes (prayer_id);

-- Moderation queue list views
CREATE INDEX IF NOT EXISTS idx_moderation_queue_status
  ON public.moderation_queue (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_content
  ON public.moderation_queue (content_type, content_id);

-- Church memberships lookup by user
CREATE INDEX IF NOT EXISTS idx_church_memberships_user
  ON public.church_memberships (user_id, status);

-- App events filtering
CREATE INDEX IF NOT EXISTS idx_app_events_type_created
  ON public.app_events (event_type, created_at DESC);
