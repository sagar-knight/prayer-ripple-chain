-- Fix Security Definer views by enabling security_invoker
ALTER VIEW public.global_prayers_public SET (security_invoker = true);
ALTER VIEW public.unified_prayer_feed SET (security_invoker = true);

-- Restrict listing of doc-screenshots bucket: drop broad SELECT and limit to admins
DROP POLICY IF EXISTS "Anyone can view doc screenshots" ON storage.objects;

CREATE POLICY "Admins can list doc screenshots"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'doc-screenshots' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Make bucket private (files served via signed URLs going forward)
UPDATE storage.buckets SET public = false WHERE id = 'doc-screenshots';