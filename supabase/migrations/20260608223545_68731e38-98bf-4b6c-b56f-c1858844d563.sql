
REVOKE EXECUTE ON FUNCTION public.request_to_join_community(uuid, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.review_community_join_request(uuid, text, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_community_admin(text, uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.request_to_join_community(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.review_community_join_request(uuid, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_community_admin(text, uuid) TO authenticated, service_role;
