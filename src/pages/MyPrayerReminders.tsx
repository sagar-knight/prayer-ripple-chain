import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Bell, CheckCircle, Clock, Calendar } from "lucide-react";
import { usePrayerReminders } from "@/hooks/usePrayerReminders";
import { useReminderNotifications } from "@/hooks/useReminderNotifications";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const MyPrayerReminders = () => {
  const { user } = useAuth();
  const {
    reminders,
    loading,
    toggleReminder,
    updateReminderTime,
    markPrayedToday,
    hasPrayedToday,
    getStats,
    getLogsForReminder,
  } = usePrayerReminders();

  // Activate in-app reminder notifications
  useReminderNotifications(reminders, hasPrayedToday, markPrayedToday);

  // Build a 7-day view for a reminder
  const getWeekView = (reminderId: string) => {
    const logs = getLogsForReminder(reminderId);
    const days: { date: string; completed: boolean }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      days.push({
        date: dateStr,
        completed: logs.some((l) => l.date_local === dateStr && l.prayed_completed),
      });
    }
    return days;
  };

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-4">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto opacity-40" />
          <h2 className="font-playfair text-xl font-semibold">Sign in to manage reminders</h2>
          <p className="text-sm text-muted-foreground">You need an account to track prayer reminders.</p>
          <Button asChild variant="peaceful"><Link to="/login">Sign In</Link></Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-center text-muted-foreground py-12">Loading reminders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Bell className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="font-playfair text-3xl font-bold text-foreground mb-2">
            My Prayer Reminders
          </h1>
          <p className="text-muted-foreground">
            Manage your daily prayer reminders and track your consistency.
          </p>
        </div>

        {reminders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <h3 className="font-playfair text-lg font-semibold mb-2">No reminders yet</h3>
              <p className="text-sm text-muted-foreground">
                Enable reminders on any prayer request you're praying for to get daily nudges.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder) => {
              const prayedToday = hasPrayedToday(reminder.id);
              const stats = getStats(reminder.id, reminder.created_at);
              const weekView = getWeekView(reminder.id);

              return (
                <Card key={reminder.id} className="animate-gentle-fade">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-playfair text-foreground">
                        {reminder.prayer_title}
                      </CardTitle>
                      <Switch
                        checked={reminder.enabled}
                        onCheckedChange={(checked) =>
                          toggleReminder(reminder.prayer_id, reminder.prayer_title, checked, reminder.reminder_time_local)
                        }
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Reminder time */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Reminder at:</span>
                      <Input
                        type="time"
                        value={reminder.reminder_time_local}
                        onChange={(e) => updateReminderTime(reminder.id, e.target.value)}
                        className="w-28 h-7 text-sm"
                        disabled={!reminder.enabled}
                      />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <Calendar className="h-3 w-3" />
                        Prayed {stats.prayedDays} of {stats.totalDays} days
                      </Badge>
                      {prayedToday && (
                        <Badge className="bg-primary/10 text-primary gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Done today
                        </Badge>
                      )}
                    </div>

                    {/* Weekly view */}
                    <div className="flex items-center gap-1">
                      {weekView.map((day, i) => {
                        const dayOfWeek = new Date(day.date).getDay();
                        return (
                          <div key={day.date} className="flex flex-col items-center gap-1">
                            <span className="text-[10px] text-muted-foreground">
                              {dayLabels[dayOfWeek]}
                            </span>
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                                day.completed
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted/50 text-muted-foreground"
                              }`}
                            >
                              {day.completed ? "✓" : new Date(day.date).getDate()}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Mark prayed today */}
                    {!prayedToday && reminder.enabled && (
                      <Button
                        variant="peaceful"
                        size="sm"
                        onClick={() => markPrayedToday(reminder.id)}
                        className="w-full"
                      >
                        Mark prayed today
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPrayerReminders;
