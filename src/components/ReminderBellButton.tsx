import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  } = usePrayerReminders();
  const [open, setOpen] = useState(false);

  const reminder = getReminderForPrayer(prayerId);
  const enabled = !!reminder?.enabled;
  const [time, setTime] = useState(reminder?.reminder_time_local ?? "08:00");

  const handleEnable = async () => {
    if (!user) {
      toast({
        title: "Sign in to set reminders",
        description: "Create a free account to be reminded to pray daily.",
      });
      return;
    }
    await enableReminder(prayerId, prayerTitle, time);
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
              {enabled ? `Daily ${reminder?.reminder_time_local ?? time}` : "Remind me"}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 space-y-3"
        align="end"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            Remind me to pray for this
          </p>
          <p className="text-xs text-muted-foreground">
            One gentle nudge each day. Mark prayed to stop for today.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Time</Label>
          <Input
            type="time"
            value={time}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="h-9 text-sm"
          />
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
              Remind me daily
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ReminderBellButton;