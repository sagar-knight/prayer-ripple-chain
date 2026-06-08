
CREATE TABLE public.prayer_ripple_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_request_id uuid NOT NULL,
  source_type text NOT NULL DEFAULT 'global',
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approximate_lat numeric NOT NULL,
  approximate_lng numeric NOT NULL,
  country text,
  region text,
  city text,
  source text NOT NULL DEFAULT 'prayer',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_prl_prayer ON public.prayer_ripple_locations (prayer_request_id);
CREATE INDEX idx_prl_created ON public.prayer_ripple_locations (created_at);
CREATE INDEX idx_prl_country ON public.prayer_ripple_locations (country);
CREATE INDEX idx_prl_region ON public.prayer_ripple_locations (region);
CREATE UNIQUE INDEX uq_prl_prayer_user ON public.prayer_ripple_locations (prayer_request_id, user_id)
  WHERE user_id IS NOT NULL;

GRANT SELECT ON public.prayer_ripple_locations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prayer_ripple_locations TO authenticated;
GRANT ALL ON public.prayer_ripple_locations TO service_role;

ALTER TABLE public.prayer_ripple_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approximate prayer locations"
  ON public.prayer_ripple_locations FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add their own prayer location"
  ON public.prayer_ripple_locations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prayer location"
  ON public.prayer_ripple_locations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prayer location"
  ON public.prayer_ripple_locations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any prayer location"
  ON public.prayer_ripple_locations FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
