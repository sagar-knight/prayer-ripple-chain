
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Prayer Warrior'));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update prayer_reminders RLS to use real auth
DROP POLICY IF EXISTS "Users can view their own reminders" ON public.prayer_reminders;
DROP POLICY IF EXISTS "Users can insert their own reminders" ON public.prayer_reminders;
DROP POLICY IF EXISTS "Users can update their own reminders" ON public.prayer_reminders;
DROP POLICY IF EXISTS "Users can delete their own reminders" ON public.prayer_reminders;

CREATE POLICY "Users can view their own reminders"
  ON public.prayer_reminders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own reminders"
  ON public.prayer_reminders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own reminders"
  ON public.prayer_reminders FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own reminders"
  ON public.prayer_reminders FOR DELETE
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Update prayer_reminder_daily_logs RLS
DROP POLICY IF EXISTS "Users can view their own logs" ON public.prayer_reminder_daily_logs;
DROP POLICY IF EXISTS "Users can insert their own logs" ON public.prayer_reminder_daily_logs;
DROP POLICY IF EXISTS "Users can update their own logs" ON public.prayer_reminder_daily_logs;

CREATE POLICY "Users can view their own logs"
  ON public.prayer_reminder_daily_logs FOR SELECT
  TO authenticated
  USING (
    prayer_reminder_id IN (
      SELECT id FROM public.prayer_reminders WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert their own logs"
  ON public.prayer_reminder_daily_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    prayer_reminder_id IN (
      SELECT id FROM public.prayer_reminders WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update their own logs"
  ON public.prayer_reminder_daily_logs FOR UPDATE
  TO authenticated
  USING (
    prayer_reminder_id IN (
      SELECT id FROM public.prayer_reminders WHERE user_id = auth.uid()::text
    )
  );
