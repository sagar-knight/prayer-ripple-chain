import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface PrayerReminder {
  id: string;
  user_id: string;
  prayer_id: string;
  prayer_title: string;
  enabled: boolean;
  reminder_time_local: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface PrayerReminderDailyLog {
  id: string;
  prayer_reminder_id: string;
  date_local: string;
  prayed_completed: boolean;
  completed_at: string | null;
  source: string;
}

function getTodayLocal(): string {
  return new Date().toISOString().split("T")[0];
}

export function usePrayerReminders() {
  const [reminders, setReminders] = useState<PrayerReminder[]>([]);
  const [logs, setLogs] = useState<PrayerReminderDailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const userId = user?.id ?? null;

  const fetchReminders = useCallback(async () => {
    if (!userId) { setReminders([]); return; }
    const { data, error } = await supabase
      .from("prayer_reminders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) setReminders(data as PrayerReminder[]);
  }, [userId]);

  const fetchLogs = useCallback(async (reminderIds: string[]) => {
    if (reminderIds.length === 0) { setLogs([]); return; }
    const { data, error } = await supabase
      .from("prayer_reminder_daily_logs")
      .select("*")
      .in("prayer_reminder_id", reminderIds);

    if (!error && data) setLogs(data as PrayerReminderDailyLog[]);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchReminders().finally(() => setLoading(false));
  }, [fetchReminders]);

  useEffect(() => {
    if (reminders.length > 0) {
      fetchLogs(reminders.map((r) => r.id));
    } else {
      setLogs([]);
    }
  }, [reminders, fetchLogs]);

  const enableReminder = async (prayerId: string, prayerTitle: string, time: string = "08:00") => {
    if (!userId) return;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const existing = reminders.find((r) => r.prayer_id === prayerId);
    if (existing) {
      const { error } = await supabase
        .from("prayer_reminders")
        .update({ enabled: true, reminder_time_local: time, timezone: tz, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      if (!error) await fetchReminders();
      return;
    }

    const { error } = await supabase.from("prayer_reminders").insert({
      user_id: userId,
      prayer_id: prayerId,
      prayer_title: prayerTitle,
      enabled: true,
      reminder_time_local: time,
      timezone: tz,
    });
    if (!error) {
      toast({ title: "Reminder enabled", description: `Daily reminder set for ${time}` });
      await fetchReminders();
    }
  };

  const disableReminder = async (prayerId: string) => {
    const existing = reminders.find((r) => r.prayer_id === prayerId);
    if (!existing) return;
    const { error } = await supabase
      .from("prayer_reminders")
      .update({ enabled: false, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (!error) {
      toast({ title: "Reminder disabled", description: "You won't be reminded for this prayer." });
      await fetchReminders();
    }
  };

  const toggleReminder = async (prayerId: string, prayerTitle: string, enabled: boolean, time?: string) => {
    if (enabled) {
      await enableReminder(prayerId, prayerTitle, time);
    } else {
      await disableReminder(prayerId);
    }
  };

  const updateReminderTime = async (reminderId: string, time: string) => {
    const { error } = await supabase
      .from("prayer_reminders")
      .update({ reminder_time_local: time, updated_at: new Date().toISOString() })
      .eq("id", reminderId);
    if (!error) await fetchReminders();
  };

  const updateReminderTimezone = async (reminderId: string, timezone: string) => {
    const { error } = await supabase
      .from("prayer_reminders")
      .update({ timezone, updated_at: new Date().toISOString() })
      .eq("id", reminderId);
    if (!error) await fetchReminders();
  };

  const markPrayedToday = async (reminderId: string) => {
    const today = getTodayLocal();
    const { error } = await supabase
      .from("prayer_reminder_daily_logs")
      .upsert(
        {
          prayer_reminder_id: reminderId,
          date_local: today,
          prayed_completed: true,
          completed_at: new Date().toISOString(),
          source: "manual",
        },
        { onConflict: "prayer_reminder_id,date_local" }
      );
    if (!error) {
      toast({ title: "Prayed today", description: "No more reminders for this request today." });
      await fetchLogs(reminders.map((r) => r.id));
    }
  };

  const getReminderForPrayer = (prayerId: string) => reminders.find((r) => r.prayer_id === prayerId);

  const hasPrayedToday = (reminderId: string) => {
    const today = getTodayLocal();
    return logs.some((l) => l.prayer_reminder_id === reminderId && l.date_local === today && l.prayed_completed);
  };

  const getLogsForReminder = (reminderId: string) => logs.filter((l) => l.prayer_reminder_id === reminderId);

  const getStats = (reminderId: string, createdAt: string) => {
    const rLogs = getLogsForReminder(reminderId).filter((l) => l.prayed_completed);
    const start = new Date(createdAt);
    const now = new Date();
    const totalDays = Math.max(1, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    return { prayedDays: rLogs.length, totalDays };
  };

  return {
    reminders,
    logs,
    loading,
    enableReminder,
    disableReminder,
    toggleReminder,
    updateReminderTime,
    updateReminderTimezone,
    markPrayedToday,
    getReminderForPrayer,
    hasPrayedToday,
    getLogsForReminder,
    getStats,
    refresh: fetchReminders,
  };
}
