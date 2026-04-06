
-- Fix the view to use SECURITY INVOKER (safe - queries run as the calling user)
CREATE OR REPLACE VIEW public.churches_public 
WITH (security_invoker = true) AS
SELECT id, name, denomination, city, state, country, logo_url, privacy, status, verified, slug, created_at
FROM public.churches
WHERE status = 'active';
