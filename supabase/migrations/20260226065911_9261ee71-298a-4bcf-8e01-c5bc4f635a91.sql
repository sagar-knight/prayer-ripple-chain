
-- Prayer chain nodes for tracking ripple depth
CREATE TABLE public.prayer_chain_nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prayer_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  parent_user_id TEXT,
  depth_level INTEGER NOT NULL DEFAULT 0,
  prayed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  shared_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User prayer stats for aggregated counts
CREATE TABLE public.user_prayer_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  total_prayers_offered INTEGER NOT NULL DEFAULT 0,
  total_prayers_received INTEGER NOT NULL DEFAULT 0,
  total_chains_started INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prayer_chain_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_prayer_stats ENABLE ROW LEVEL SECURITY;

-- RLS for prayer_chain_nodes: users can view nodes they're part of (aggregated)
CREATE POLICY "Users can view their own chain nodes"
  ON public.prayer_chain_nodes FOR SELECT
  USING (user_id = (auth.uid())::text);

CREATE POLICY "Users can insert their own chain nodes"
  ON public.prayer_chain_nodes FOR INSERT
  WITH CHECK (user_id = (auth.uid())::text);

-- RLS for user_prayer_stats
CREATE POLICY "Users can view their own stats"
  ON public.user_prayer_stats FOR SELECT
  USING (user_id = (auth.uid())::text);

CREATE POLICY "Users can insert their own stats"
  ON public.user_prayer_stats FOR INSERT
  WITH CHECK (user_id = (auth.uid())::text);

CREATE POLICY "Users can update their own stats"
  ON public.user_prayer_stats FOR UPDATE
  USING (user_id = (auth.uid())::text);
