CREATE POLICY "Authenticated users can read reports"
ON public.app_events
FOR SELECT
TO authenticated
USING (event_type = 'content_reported');