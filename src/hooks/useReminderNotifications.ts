import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import type { PrayerReminder } from "@/hooks/usePrayerReminders";

/**
 * In-app reminder notifications: checks every 60s if any enabled reminders
 * are due (current time >= reminder_time_local) and the user hasn't prayed today.
 */
export function useReminderNotifications(
  reminders: PrayerReminder[],
  hasPrayedToday: (reminderId: string) => boolean,
  markPrayedToday: (reminderId: string) => Promise<void>
) {
  const { toast } = useToast();
  const notifiedToday = useRef<Set<string>>(new Set());

  // Reset the notified set at midnight
  useEffect(() => {
    const now = new Date();
    const msUntilMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();

    const timeout = setTimeout(() => {
      notifiedToday.current.clear();
    }, msUntilMidnight);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const check = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      reminders
        .filter((r) => r.enabled && !hasPrayedToday(r.id) && !notifiedToday.current.has(r.id))
        .forEach((r) => {
          if (currentTime >= r.reminder_time_local) {
            notifiedToday.current.add(r.id);

            toast({
              title: "Prayer Reminder",
              description: `Someone you care about could still use prayer today: ${r.prayer_title}`,
              duration: 15000,
              action: undefined,
            });
          }
        });
    };

    check(); // run immediately
    const interval = setInterval(check, 60_000); // every 60s
    return () => clearInterval(interval);
  }, [reminders, hasPrayedToday, toast]);
}
