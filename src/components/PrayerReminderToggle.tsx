import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Bell, BellOff } from "lucide-react";

interface PrayerReminderToggleProps {
  prayerId: string;
  prayerTitle: string;
  enabled: boolean;
  reminderTime: string;
  onToggle: (prayerId: string, prayerTitle: string, enabled: boolean, time?: string) => void;
  onTimeChange?: (time: string) => void;
}

const PrayerReminderToggle = ({
  prayerId,
  prayerTitle,
  enabled,
  reminderTime,
  onToggle,
  onTimeChange,
}: PrayerReminderToggleProps) => {
  const [time, setTime] = useState(reminderTime || "08:00");

  useEffect(() => {
    setTime(reminderTime || "08:00");
  }, [reminderTime]);

  const handleToggle = (checked: boolean) => {
    onToggle(prayerId, prayerTitle, checked, time);
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    onTimeChange?.(newTime);
  };

  return (
    <div className="border-t pt-3 mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {enabled ? (
            <Bell className="h-4 w-4 text-primary" />
          ) : (
            <BellOff className="h-4 w-4 text-muted-foreground" />
          )}
          <Label className="text-sm cursor-pointer">
            Remind me daily to pray for this
          </Label>
        </div>
        <Switch checked={enabled} onCheckedChange={handleToggle} />
      </div>

      {enabled && (
        <div className="flex items-center gap-2 pl-6">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">
            Remind at:
          </Label>
          <Input
            type="time"
            value={time}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="w-28 h-8 text-sm"
          />
        </div>
      )}

      {enabled && (
        <p className="text-xs text-muted-foreground pl-6">
          Mark "Prayed today" to stop reminders for the day.
        </p>
      )}
    </div>
  );
};

export default PrayerReminderToggle;
