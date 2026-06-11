import { Bell, BellOff, ChevronUp, ChevronDown, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { usePrayerReminders } from "@/hooks/usePrayerReminders";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ReminderBellButtonProps {
  prayerId: string;
  prayerTitle: string;
  /** Compact (icon-only) or labeled with "Daily" text. */
  size?: "icon" | "sm";
  className?: string;
}

/**
 * Small bell toggle for adding a daily reminder to pray for a single
 * request. Used on prayer cards across the app (community feed, shared
 * prayer page, "carrying" list). For the full inline panel, see
 * PrayerReminderToggle.
 */
const COMMON_TIMEZONES = [
  "Pacific/Honolulu",
  "America/Anchorage",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Sao_Paulo",
  "Atlantic/Azores",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Athens",
  "Africa/Nairobi",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
];

function parse24(t: string): { h: number; m: number } {
  const [hh, mm] = (t || "08:00").split(":");
  const h = Math.min(23, Math.max(0, parseInt(hh || "8", 10) || 0));
  const m = Math.min(59, Math.max(0, parseInt(mm || "0", 10) || 0));
  return { h, m };
}
function to24(h: number, m: number): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function to12(h: number): { h12: number; period: "AM" | "PM" } {
  const period: "AM" | "PM" = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return { h12, period };
}
function from12(h12: number, period: "AM" | "PM"): number {
  const base = h12 % 12;
  return period === "PM" ? base + 12 : base;
}

const ReminderBellButton = ({
  prayerId,
  prayerTitle,
  size = "sm",
  className = "",
}: ReminderBellButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    getReminderForPrayer,
    enableReminder,
    disableReminder,
    updateReminderTime,
    updateReminderTimezone,
  } = usePrayerReminders();
  const [open, setOpen] = useState(false);

  const reminder = getReminderForPrayer(prayerId);
  const enabled = !!reminder?.enabled;
  const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [time, setTime] = useState(reminder?.reminder_time_local ?? "08:00");
  const [tz, setTz] = useState(reminder?.timezone ?? browserTz);

  const { h, m } = parse24(time);
  const { h12, period } = to12(h);

  const bumpHour = (delta: number) => {
    const next = (h + delta + 24) % 24;
    handleTimeChange(to24(next, m));
  };
  const bumpMinute = (delta: number) => {
    const next = (m + delta + 60) % 60;
    handleTimeChange(to24(h, next));
  };
  const setPeriod = (p: "AM" | "PM") => {
    if (p === period) return;
    handleTimeChange(to24(from12(h12, p), m));
  };

  const handleEnable = async () => {
    if (!user) {
      toast({
        title: "Sign in to set reminders",
        description: "Create a free account to be reminded to pray daily.",
      });
      return;
    }
    await enableReminder(prayerId, prayerTitle, time);
    if (tz && tz !== browserTz) {
      // enableReminder writes browser tz; correct it if user picked another
      const fresh = getReminderForPrayer(prayerId);
      if (fresh) await updateReminderTimezone(fresh.id, tz);
    }
    setOpen(false);
  };

  const handleDisable = async () => {
    await disableReminder(prayerId);
    setOpen(false);
  };

  const handleTimeChange = async (next: string) => {
    setTime(next);
    if (reminder) await updateReminderTime(reminder.id, next);
  };

  const handleTzChange = async (next: string) => {
    setTz(next);
    if (reminder) await updateReminderTimezone(reminder.id, next);
  };

  const allTimezones = Array.from(
    new Set([browserTz, tz, ...COMMON_TIMEZONES].filter(Boolean))
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={enabled ? "secondary" : "ghost"}
          size={size === "icon" ? "icon" : "sm"}
          className={`gap-1.5 ${className}`}
          aria-label={enabled ? "Reminder on" : "Set daily reminder"}
          onClick={(e) => e.stopPropagation()}
        >
          {enabled ? (
            <Bell className="h-4 w-4 text-primary" />
          ) : (
            <BellOff className="h-4 w-4 text-muted-foreground" />
          )}
          {size !== "icon" && (
            <span className="text-xs">
              {enabled
                ? `Daily ${(() => {
                    const r = parse24(reminder?.reminder_time_local ?? time);
                    const t = to12(r.h);
                    return `${t.h12}:${String(r.m).padStart(2, "0")} ${t.period}`;
                  })()}`
                : "Remind me"}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 space-y-4"
        align="end"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1 text-center">
          <p className="text-sm font-medium text-foreground">
            Remind me to pray for this
          </p>
          <p className="text-xs text-muted-foreground">
            One gentle daily reminder at the time you choose.
          </p>
        </div>

        {/* Alarm-style time picker */}
        <div className="flex items-center justify-center gap-2 select-none">
          {/* Hour */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => bumpHour(1)}
              className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
              aria-label="Hour up"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <div className="font-mono text-3xl tabular-nums w-14 text-center py-1">
              {String(h12).padStart(2, "0")}
            </div>
            <button
              type="button"
              onClick={() => bumpHour(-1)}
              className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
              aria-label="Hour down"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <div className="font-mono text-3xl text-muted-foreground pb-1">:</div>

          {/* Minute */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => bumpMinute(5)}
              className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
              aria-label="Minute up"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <div className="font-mono text-3xl tabular-nums w-14 text-center py-1">
              {String(m).padStart(2, "0")}
            </div>
            <button
              type="button"
              onClick={() => bumpMinute(-5)}
              className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
              aria-label="Minute down"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          {/* AM/PM */}
          <div className="flex flex-col gap-1 ml-2">
            <button
              type="button"
              onClick={() => setPeriod("AM")}
              className={`px-2 py-1 rounded text-xs font-medium border ${
                period === "AM"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              AM
            </button>
            <button
              type="button"
              onClick={() => setPeriod("PM")}
              className={`px-2 py-1 rounded text-xs font-medium border ${
                period === "PM"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              PM
            </button>
          </div>
        </div>

        {/* Timezone */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Globe className="h-3 w-3" /> Time zone
          </Label>
          <Select value={tz} onValueChange={handleTzChange}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select time zone" />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {allTimezones.map((z) => (
                <SelectItem key={z} value={z} className="text-sm">
                  {z.replace(/_/g, " ")}
                  {z === browserTz ? " (detected)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 pt-1">
          {enabled ? (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={handleDisable}
            >
              Turn off
            </Button>
          ) : (
            <Button
              size="sm"
              variant="peaceful"
              className="flex-1"
              onClick={handleEnable}
            >
              Set daily reminder
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ReminderBellButton;