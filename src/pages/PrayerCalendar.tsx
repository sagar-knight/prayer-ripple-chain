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
          ? {
              ...p,
              prayedToday: true,
              lastPrayed: new Date(),
              daysStreak: p.daysStreak + 1,
            }
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
    <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 animate-gentle-fade">
          <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-4">
            Prayer Calendar
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track your prayer commitments and stay faithful
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-warm text-accent-foreground animate-gentle-fade">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold">{totalStreak}</div>
              <div className="text-sm opacity-90">Day Streak</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-primary text-primary-foreground animate-gentle-fade" style={{ animationDelay: "100ms" }}>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold">{todayCount}</div>
              <div className="text-sm opacity-90">Prayed Today</div>
            </CardContent>
          </Card>
          <Card className="animate-gentle-fade" style={{ animationDelay: "200ms" }}>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-primary">{pendingCount}</div>
              <div className="text-sm text-muted-foreground">Pending Today</div>
            </CardContent>
          </Card>
          <Card className="animate-gentle-fade" style={{ animationDelay: "300ms" }}>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-primary">{acceptedPrayers.length}</div>
              <div className="text-sm text-muted-foreground">Total Commitments</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar View */}
          <Card className="lg:col-span-1 animate-gentle-fade" style={{ animationDelay: "400ms" }}>
            <CardHeader>
              <CardTitle className="font-playfair flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
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
                  prayed: "bg-primary/20 text-primary font-bold",
                }}
              />
            </CardContent>
          </Card>

          {/* Prayer Commitments List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-playfair text-2xl font-bold text-foreground">
              Your Prayer Commitments
            </h2>

            {/* Daily Reminder Banner */}
            {pendingCount > 0 && (
              <Card className="bg-accent/20 border-accent/40 animate-gentle-fade">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <BellRing className="h-6 w-6 text-accent-foreground" />
                    <div>
                      <p className="font-semibold text-accent-foreground">
                        You committed to pray for someone today
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {pendingCount} prayer{pendingCount > 1 ? "s" : ""} still
                        pending for today
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {acceptedPrayers.map((prayer, index) => (
              <Card
                key={prayer.id}
                className="animate-gentle-fade hover:shadow-peaceful transition-all duration-300"
                style={{ animationDelay: `${(index + 5) * 100}ms` }}
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {prayer.title}
                        </h3>
                        <Badge variant="secondary">{prayer.category}</Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            Accepted:{" "}
                            {prayer.acceptedDate.toLocaleDateString()}
                          </span>
                        </div>
                        {prayer.lastPrayed && (
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4 text-primary" />
                            <span>
                              Last prayed:{" "}
                              {prayer.lastPrayed.toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <span>{prayer.daysStreak} day streak</span>
                        </div>
                      </div>

                      {/* Reminder Toggle */}
                      <div className="flex items-center gap-2">
                        {prayer.reminderEnabled ? (
                          <Bell className="h-4 w-4 text-primary" />
                        ) : (
                          <BellOff className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm text-muted-foreground">
                          Daily reminder
                        </span>
                        <Switch
                          checked={prayer.reminderEnabled}
                          onCheckedChange={() =>
                            handleToggleReminder(prayer.id)
                          }
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
                          variant="peaceful"
                          onClick={() => handleMarkPrayed(prayer.id)}
                          className="gap-2"
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
              <Card className="text-center py-12">
                <CardContent>
                  <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    No prayer commitments yet
                  </h3>
                  <p className="text-muted-foreground">
                    Start praying for others and your commitments will appear
                    here.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Scripture Encouragement */}
        <Card className="mt-8 bg-gradient-primary text-primary-foreground animate-gentle-fade">
          <CardContent className="pt-6 text-center">
            <p className="text-lg italic leading-relaxed">
              "Devote yourselves to prayer, being watchful and thankful."
            </p>
            <p className="font-semibold mt-2 opacity-90">— Colossians 4:2</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrayerCalendar;
