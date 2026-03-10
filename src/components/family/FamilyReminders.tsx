import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, Clock } from "lucide-react";
import type { FamilyGroupPrayerRequest } from "./FamilyPrayerRequests";

interface Props {
  requests: FamilyGroupPrayerRequest[];
  prayedDays: Record<string, string[]>; // requestId -> dates prayed
  onToggleReminder: (id: string) => void;
  onMarkPrayed: (id: string) => void;
}

const FamilyReminders = ({ requests, prayedDays, onToggleReminder, onMarkPrayed }: Props) => {
  const today = new Date().toISOString().slice(0, 10);
  const activeRequests = requests.filter((r) => r.status === "active");

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Set personal reminders for family prayer requests. Your reminders are private.
      </p>

      {activeRequests.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Bell className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">
              No active prayer requests to set reminders for.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {activeRequests.map((req) => {
            const days = prayedDays[req.id] || [];
            const prayedToday = days.includes(today);

            return (
              <Card key={req.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="pt-5 pb-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground text-sm">{req.title}</h3>
                    <Button
                      variant={req.reminderEnabled ? "default" : "outline"}
                      size="sm"
                      className="gap-1 text-xs"
                      onClick={() => onToggleReminder(req.id)}
                    >
                      <Bell className="h-3 w-3" />
                      {req.reminderEnabled ? "Reminder on" : "Set reminder"}
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    You've prayed for this {days.length} {days.length === 1 ? "day" : "days"}.
                    {!prayedToday && " You can still pray for them today."}
                  </p>

                  <Button
                    variant={prayedToday ? "outline" : "peaceful"}
                    size="sm"
                    className="gap-1 text-xs w-full"
                    disabled={prayedToday}
                    onClick={() => onMarkPrayed(req.id)}
                  >
                    <CheckCircle className="h-3 w-3" />
                    {prayedToday ? "Prayed today" : "I prayed for them today"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FamilyReminders;
