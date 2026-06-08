DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='global_prayer_requests') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.global_prayer_requests;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='prayer_ripple_locations') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.prayer_ripple_locations;
  END IF;
END $$;