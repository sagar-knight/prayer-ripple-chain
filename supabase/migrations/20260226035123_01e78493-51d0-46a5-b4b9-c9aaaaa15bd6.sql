
-- Prayer Reminders table
CREATE TABLE public.prayer_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  prayer_id TEXT NOT NULL,
  prayer_title TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  reminder_time_local TEXT NOT NULL DEFAULT '08:00',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Prayer Reminder Daily Log table
CREATE TABLE public.prayer_reminder_daily_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prayer_reminder_id UUID NOT NULL REFERENCES public.prayer_reminders(id) ON DELETE CASCADE,
  date_local TEXT NOT NULL,
  prayed_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  source TEXT NOT NULL DEFAULT 'manual',
  UNIQUE(prayer_reminder_id, date_local)
);

-- Indexes
CREATE INDEX idx_prayer_reminders_user ON public.prayer_reminders(user_id);
CREATE INDEX idx_prayer_reminder_logs_reminder ON public.prayer_reminder_daily_logs(prayer_reminder_id);

-- Enable RLS
ALTER TABLE public.prayer_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_reminder_daily_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for prayer_reminders (using user_id TEXT field, no auth required for now)
CREATE POLICY "Users can view their own reminders" ON public.prayer_reminders FOR SELECT USING (true);
CREATE POLICY "Users can insert their own reminders" ON public.prayer_reminders FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own reminders" ON public.prayer_reminders FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own reminders" ON public.prayer_reminders FOR DELETE USING (true);

-- RLS policies for prayer_reminder_daily_logs
CREATE POLICY "Users can view their own logs" ON public.prayer_reminder_daily_logs FOR SELECT USING (true);
CREATE POLICY "Users can insert their own logs" ON public.prayer_reminder_daily_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own logs" ON public.prayer_reminder_daily_logs FOR UPDATE USING (true);
