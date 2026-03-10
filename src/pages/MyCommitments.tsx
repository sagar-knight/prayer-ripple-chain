import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Heart, Calendar, CheckCircle, Clock, ArrowLeft, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export interface PrayerCommitment {
  id: string;
  prayerTitle: string;
  category: string;
  createdAt: string;
  lastPrayedAt: string | null;
  daysPrayedCount: number;
  totalDaysSinceStart: number;
  reminderEnabled: boolean;
  reminderTimeLocal: string;
  status: "active" | "archived";
  prayerLog: string[]; // ISO date strings of days prayed
}

const MOCK_COMMITMENTS: PrayerCommitment[] = [
  {
    id: "c1",
    prayerTitle: "Healing for Sarah's mother",
    category: "health",
    createdAt: "2026-02-04T10:00:00Z",
    lastPrayedAt: "2026-02-17T08:30:00Z",
    daysPrayedCount: 9,
    totalDaysSinceStart: 14,
    reminderEnabled: true,
    reminderTimeLocal: "08:00",
    status: "active",
    prayerLog: [
      "2026-02-04", "2026-02-05", "2026-02-06", "2026-02-08", "2026-02-09",
      "2026-02-11", "2026-02-14", "2026-02-16", "2026-02-17",
    ],
  },
  {
    id: "c2",
    prayerTitle: "Peace for the Johnson family",
    category: "family",
    createdAt: "2026-02-10T12:00:00Z",
    lastPrayedAt: "2026-02-18T07:00:00Z",
    daysPrayedCount: 7,
    totalDaysSinceStart: 8,
    reminderEnabled: false,
    reminderTimeLocal: "09:00",
    status: "active",
    prayerLog: [
      "2026-02-10", "2026-02-11", "2026-02-12", "2026-02-13",
      "2026-02-15", "2026-02-17", "2026-02-18",
    ],
  },
  {
    id: "c3",
    prayerTitle: "Guidance for Mark's career",
    category: "work",
    createdAt: "2026-02-01T09:00:00Z",
    lastPrayedAt: "2026-02-15T06:00:00Z",
    daysPrayedCount: 5,
    totalDaysSinceStart: 17,
    reminderEnabled: true,
    reminderTimeLocal: "07:30",
    status: "active",
    prayerLog: [
      "2026-02-01", "2026-02-03", "2026-02-07", "2026-02-12", "2026-02-15",
    ],
  },
];

const MyCommitments = () => {
  const [commitments, setCommitments] = useLocalStorage<PrayerCommitment[]>(
    "pf-commitments",
    MOCK_COMMITMENTS
  );
  const [filter, setFilter] = useState<"active" | "archived">("active");

  const filtered = commitments.filter((c) => c.status === filter);
  const today = new Date().toISOString().slice(0, 10);

  const markPrayedToday = (id: string) => {
    setCommitments((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (c.prayerLog.includes(today)) return c;
        return {
          ...c,
          lastPrayedAt: new Date().toISOString(),
          daysPrayedCount: c.daysPrayedCount + 1,
          prayerLog: [...c.prayerLog, today],
        };
      })
    );
  };

  const toggleReminder = (id: string) => {
    setCommitments((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, reminderEnabled: !c.reminderEnabled } : c
      )
    );
  };

  const archiveCommitment = (id: string) => {
    setCommitments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "archived" } : c))
    );
  };

  // Build mini calendar for last 14 days
  const getLast14Days = () => {
    const days: string[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  };

  const last14 = getLast14Days();

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 animate-gentle-fade">
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-playfair text-2xl md:text-3xl font-bold text-foreground">
              People You're Praying For
            </h1>
            <p className="text-sm text-muted-foreground">
              Continue carrying others in prayer. There is no pressure, only grace.
            </p>
          </div>
        </div>

        {/* Summary card */}
        <Card className="mb-6 animate-gentle-fade">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {commitments.filter((c) => c.status === "active").length}
                  </p>
                  <p className="text-sm text-muted-foreground">People you're praying for</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filter */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={filter === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("active")}
          >
            Active
          </Button>
          <Button
            variant={filter === "archived" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("archived")}
          >
            Archived
          </Button>
        </div>

        {/* Commitment list */}
        <div className="space-y-4">
          {filtered.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>No {filter} prayers yet.</p>
                <Button asChild variant="peaceful" size="sm" className="mt-3">
                  <Link to="/pray">Start Praying</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {filtered.map((commitment, i) => {
            const prayedToday = commitment.prayerLog.includes(today);

            return (
              <Card
                key={commitment.id}
                className="animate-gentle-fade"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="font-playfair text-base">
                      {commitment.prayerTitle}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {commitment.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Encouraging summary instead of progress bar */}
                  <p className="text-sm text-muted-foreground">
                    You've prayed for this {commitment.daysPrayedCount} {commitment.daysPrayedCount === 1 ? "day" : "days"}.
                    {!prayedToday && " You can still pray for them today."}
                  </p>

                  {/* Mini calendar */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Last 14 days</p>
                    <div className="flex gap-1 flex-wrap">
                      {last14.map((day) => {
                        const prayed = commitment.prayerLog.includes(day);
                        const isToday = day === today;
                        return (
                          <div
                            key={day}
                            className={`w-6 h-6 rounded-sm flex items-center justify-center text-[9px] ${
                              prayed
                                ? "bg-primary text-primary-foreground"
                                : isToday
                                ? "bg-accent/30 border border-accent"
                                : "bg-muted"
                            }`}
                            title={day}
                          >
                            {prayed ? <CheckCircle className="h-3 w-3" /> : new Date(day + "T00:00:00").getDate()}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Started {new Date(commitment.createdAt).toLocaleDateString()}
                    </span>
                    {commitment.lastPrayedAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last prayed{" "}
                        {new Date(commitment.lastPrayedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Daily reminder</span>
                      <Switch
                        checked={commitment.reminderEnabled}
                        onCheckedChange={() => toggleReminder(commitment.id)}
                      />
                    </div>
                    <div className="flex gap-2">
                      {commitment.status === "active" && (
                        <>
                          <Button
                            variant={prayedToday ? "outline" : "peaceful"}
                            size="sm"
                            className="gap-1 text-xs"
                            disabled={prayedToday}
                            onClick={() => markPrayedToday(commitment.id)}
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            {prayedToday ? "Prayed today" : "I prayed for them"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={() => archiveCommitment(commitment.id)}
                          >
                            Archive
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyCommitments;
