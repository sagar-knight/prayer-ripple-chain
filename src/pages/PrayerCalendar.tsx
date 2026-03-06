import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Calendar,
  Bell,
  CheckCircle,
  Circle,
  Clock,
  Heart,
  BellRing,
  BellOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AcceptedPrayer {
  id: string;
  title: string;
  category: string;
  acceptedDate: Date;
  lastPrayed: Date | null;
  reminderEnabled: boolean;
  daysStreak: number;
  prayedToday: boolean;
}

const PrayerCalendar = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const [acceptedPrayers, setAcceptedPrayers] = useState<AcceptedPrayer[]>([
    {
      id: "1",
      title: "Healing for grandmother",
      category: "Health",
      acceptedDate: new Date(2026, 1, 3),
      lastPrayed: new Date(2026, 1, 8),
      reminderEnabled: true,
      daysStreak: 6,
      prayedToday: false,
    },
    {
      id: "2",
      title: "Guidance in job search",
      category: "Work",
      acceptedDate: new Date(2026, 1, 5),
      lastPrayed: new Date(2026, 1, 9),
      reminderEnabled: true,
      daysStreak: 4,
      prayedToday: true,
    },
    {
      id: "3",
      title: "Marriage restoration",
      category: "Family",
      acceptedDate: new Date(2026, 1, 7),
      lastPrayed: null,
      reminderEnabled: false,
      daysStreak: 0,
      prayedToday: false,
    },
  ]);

  const handleMarkPrayed = (prayerId: string) => {
    setAcceptedPrayers((prev) =>
      prev.map((p) =>
        p.id === prayerId
          ? { ...p, prayedToday: true, lastPrayed: new Date(), daysStreak: p.daysStreak + 1 }
          : p
      )
    );
    toast({
      title: "Prayer Marked",
      description: "You committed to pray for someone today.",
    });
  };

  const handleToggleReminder = (prayerId: string) => {
    setAcceptedPrayers((prev) =>
      prev.map((p) =>
        p.id === prayerId ? { ...p, reminderEnabled: !p.reminderEnabled } : p
      )
    );
  };

  const prayedDates = acceptedPrayers
    .filter((p) => p.lastPrayed)
    .map((p) => p.lastPrayed as Date);

  const totalStreak = Math.max(...acceptedPrayers.map((p) => p.daysStreak), 0);
  const todayCount = acceptedPrayers.filter((p) => p.prayedToday).length;
  const pendingCount = acceptedPrayers.filter((p) => !p.prayedToday).length;

  return (
    <div className="min-h-screen bg-background py-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Calendar className="h-10 w-10 text-foreground mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-3 tracking-tight">
            Prayer Calendar
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
            Track your prayer commitments and stay faithful
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border border-border">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-semibold text-foreground">{totalStreak}</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-semibold text-foreground">{todayCount}</div>
              <div className="text-sm text-muted-foreground">Prayed Today</div>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-semibold text-foreground">{pendingCount}</div>
              <div className="text-sm text-muted-foreground">Pending Today</div>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-semibold text-foreground">{acceptedPrayers.length}</div>
              <div className="text-sm text-muted-foreground">Total Commitments</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar View */}
          <Card className="lg:col-span-1 border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                Calendar
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={{ prayed: prayedDates }}
                modifiersClassNames={{
                  prayed: "bg-foreground/10 text-foreground font-bold",
                }}
              />
            </CardContent>
          </Card>

          {/* Prayer Commitments List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Your Prayer Commitments
            </h2>

            {pendingCount > 0 && (
              <Card className="bg-secondary border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <BellRing className="h-6 w-6 text-foreground" />
                    <div>
                      <p className="font-semibold text-foreground">
                        You committed to pray for someone today
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {pendingCount} prayer{pendingCount > 1 ? "s" : ""} still pending for today
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {acceptedPrayers.map((prayer) => (
              <Card key={prayer.id} className="border border-border hover:border-foreground/20 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{prayer.title}</h3>
                        <Badge variant="secondary">{prayer.category}</Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Accepted: {prayer.acceptedDate.toLocaleDateString()}</span>
                        </div>
                        {prayer.lastPrayed && (
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            <span>Last prayed: {prayer.lastPrayed.toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <span>{prayer.daysStreak} day streak</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {prayer.reminderEnabled ? (
                          <Bell className="h-4 w-4 text-foreground" />
                        ) : (
                          <BellOff className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm text-muted-foreground">Daily reminder</span>
                        <Switch
                          checked={prayer.reminderEnabled}
                          onCheckedChange={() => handleToggleReminder(prayer.id)}
                        />
                      </div>
                    </div>

                    <div>
                      {prayer.prayedToday ? (
                        <Button variant="secondary" disabled className="gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Prayed Today
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleMarkPrayed(prayer.id)}
                          className="gap-2 rounded-full"
                        >
                          <Circle className="h-4 w-4" />
                          Mark Prayed
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {acceptedPrayers.length === 0 && (
              <Card className="text-center py-12 border border-border">
                <CardContent>
                  <Heart className="h-14 w-14 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No prayer commitments yet</h3>
                  <p className="text-muted-foreground text-sm">
                    Start praying for others and your commitments will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Scripture Encouragement */}
        <Card className="mt-8 bg-foreground text-background border-none">
          <CardContent className="pt-6 text-center">
            <p className="text-lg italic leading-relaxed">
              "Devote yourselves to prayer, being watchful and thankful."
            </p>
            <p className="font-semibold mt-2 opacity-80">— Colossians 4:2</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrayerCalendar;
