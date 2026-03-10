
-- Fix: Make view use invoker's permissions instead of definer
ALTER VIEW public.unified_prayer_feed SET (security_invoker = on);
