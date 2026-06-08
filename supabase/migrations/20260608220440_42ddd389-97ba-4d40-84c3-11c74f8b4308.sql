
CREATE POLICY "Authenticated can upload community logos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'community-logos' AND (storage.foldername(name))[1] = (auth.uid())::text);

CREATE POLICY "Authenticated can read community logos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'community-logos');

CREATE POLICY "Anon can read community logos"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'community-logos');

CREATE POLICY "Owners can update community logos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'community-logos' AND (storage.foldername(name))[1] = (auth.uid())::text);

CREATE POLICY "Owners can delete community logos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'community-logos' AND (storage.foldername(name))[1] = (auth.uid())::text);
