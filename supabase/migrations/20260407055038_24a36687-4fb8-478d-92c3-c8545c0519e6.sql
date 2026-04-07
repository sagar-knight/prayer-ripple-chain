-- Remove anon access to churches base table (has contact_email, phone)
DROP POLICY IF EXISTS "Anon can view active churches" ON public.churches;