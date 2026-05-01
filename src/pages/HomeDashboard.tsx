import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Bell, BookOpen, Waves, ArrowRight, Clock, Check, Sparkles, Sun } from "lucide-react";
import { getDailyVerse } from "@/data/verses";
import DailyPrayerFocus from "@/components/DailyPrayerFocus";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const HomeDashboard = () => {
  const dailyVerse = getDailyVerse();
  const { user } = useAuth();
  const [prayedToday, setPrayedToday] = useLocalStorage<Record<string, string>>("prayed_today_log", {});

  const today = new Date().toISOString().split("T")[0];
  const monthKey = today.slice(0, 7); // YYYY-MM

  // Grace-based "days in prayer this month" (no streak resets, no pressure)
  const [prayerDays, setPrayerDays] = useLocalStorage<Record<string, string[]>>("prayer_days_log", {});
  const daysInPrayerThisMonth = (prayerDays[monthKey] || []).length;
  const todayLabel = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  // Fetch prayer stats from DB
  const { data: stats } = useQuery({
    queryKey: ["user_prayer_stats", user?.id],
    queryFn: async () => {
      if (!user) return { total_prayers_offered: 0, total_prayers_received: 0, total_chains_started: 0 };
      const { data } = await supabase
        .from("user_prayer_stats")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return data || { total_prayers_offered: 0, total_prayers_received: 0, total_chains_started: 0 };
    },
    enabled: !!user,
  });

  // Fetch prayer reminders from DB
  const { data: reminders } = useQuery({
    queryKey: ["prayer_reminders_home", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("prayer_reminders")
        .select("*")
        .eq("user_id", user.id)
        .eq("enabled", true);
      return data || [];
    },
    enabled: !!user,
  });

  const activeReminders = reminders || [];

  const handlePrayedToday = (reminderId: string) => {
    setPrayedToday({ ...prayedToday, [reminderId]: today });
    const monthDays = prayerDays[monthKey] || [];
    if (!monthDays.includes(today)) {
      setPrayerDays({ ...prayerDays, [monthKey]: [...monthDays, today] });
    }
  };

  const hasPrayedToday = (reminderId: string) => prayedToday[reminderId] === today;

  const prayersOffered = stats?.total_prayers_offered ?? 0;
  const prayersReceived = stats?.total_prayers_received ?? 0;

  return (
    <div className="min-h-screen bg-aurora pb-24 relative overflow-hidden">
      {/* Decorative floating orbs */}
      <div className="pointer-events-none absolute -top-32 -left-24 w-72 h-72 rounded-full bg-primary/15 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute top-40 -right-24 w-80 h-80 rounded-full bg-success/15 blur-3xl animate-float-slow" style={{ animationDelay: "1.5s" }} />

      <div className="page-container py-12 section-gap relative">
        {/* Welcome */}
        <div className="page-header">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/70 backdrop-blur-sm border border-border/60 text-xs text-muted-foreground mb-4">
            <Sun className="h-3.5 w-3.5 text-accent" />
            {todayLabel}
          </div>
          <h1 className="page-title">Welcome back</h1>
          <p className="page-subtitle">
            Let's take a moment to pray.
          </p>
        </div>

        {/* Prayer Journey highlight card (grace-based, no streaks) */}
        <Card className="border-0 overflow-hidden card-glass animate-gentle-fade">
          <div className="relative bg-gradient-primary p-6 sm:p-8 text-primary-foreground">
            <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-aurora pointer-events-none" />
            <div className="relative flex items-center justify-between gap-6 flex-wrap">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider opacity-90">
                  <Sparkles className="h-3.5 w-3.5" />
                  Your Prayer Journey
                </div>
                <p className="text-3xl sm:text-4xl font-playfair font-semibold leading-tight">
                  {daysInPrayerThisMonth === 0
                    ? "A new day to begin"
                    : `${daysInPrayerThisMonth} ${daysInPrayerThisMonth === 1 ? "day" : "days"} in prayer this month`}
                </p>
                <p className="text-sm opacity-90 max-w-md leading-relaxed">
                  Every prayer matters. There is no streak to keep, only grace to receive.
                </p>
              </div>
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse-ring" />
                <div className="relative w-20 h-20 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/30">
                  <Heart className="h-9 w-9" />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Section 1 — Pray for Someone */}
        <Card className="border-0 animate-gentle-fade lift-on-hover">
          <CardContent className="pt-8 pb-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Heart className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="section-title text-xl">Someone needs prayer</CardTitle>
            <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
              Take a quiet moment to pray for someone who asked for support.
            </p>
            <Button asChild variant="peaceful" size="lg" className="px-10">
              <Link to="/pray">
                Start Praying
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Daily Prayer Focus */}
        <DailyPrayerFocus />

        {/* Section 2 — Prayer Reminders */}
        <Card className="border-0 animate-gentle-fade" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <CardTitle className="section-title flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              People you're praying for
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeReminders.length === 0 ? (
              <div className="text-center py-6 space-y-3">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  No prayer reminders set yet. You can add one when you pray for someone.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link to="/prayer-reminders">Manage Reminders</Link>
                </Button>
              </div>
            ) : (
              <>
                {activeReminders.map((reminder: any) => (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-secondary/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {reminder.prayer_title || "Prayer request"}
                      </p>
                      {reminder.reminder_time_local && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {reminder.reminder_time_local}
                        </p>
                      )}
                    </div>
                    {hasPrayedToday(reminder.id) ? (
                      <span className="text-xs text-primary flex items-center gap-1 font-medium">
                        <Check className="h-3.5 w-3.5" />
                        Prayed today
                      </span>
                    ) : (
                      <Button
                        variant="peaceful"
                        size="sm"
                        className="text-xs shrink-0"
                        onClick={() => handlePrayedToday(reminder.id)}
                      >
                        I prayed for them
                      </Button>
                    )}
                  </div>
                ))}
                <div className="pt-3 text-center">
                  <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                    <Link to="/prayer-reminders">Manage Reminders</Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Section 3 — Scripture Today */}
        <Card className="border-0 animate-gentle-fade" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <CardTitle className="section-title flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Scripture Today
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <blockquote className="border-l-4 border-primary/30 pl-4 italic text-foreground/90 text-sm leading-relaxed">
              "{dailyVerse.text}"
            </blockquote>
            <p className="text-sm font-medium text-primary">
              {dailyVerse.reference} ({dailyVerse.translation})
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button asChild variant="outline" size="sm">
                <Link to="/scripture">Read Passage</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/scripture">Open Scripture</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Your Prayer Journey */}
        <Card className="border-0 animate-gentle-fade" style={{ animationDelay: "300ms" }}>
          <CardHeader>
            <CardTitle className="section-title flex items-center gap-2">
              <Waves className="h-5 w-5 text-primary" />
              Your Prayer Journey
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              {prayersOffered > 0 || prayersReceived > 0
                ? "You have been praying for others, and others have been praying for you."
                : "Begin your prayer journey by praying for someone today."}
            </p>

            {(prayersOffered > 0 || prayersReceived > 0) && (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-secondary/50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-foreground">{prayersOffered}</p>
                  <p className="text-xs text-muted-foreground mt-1">Prayed for others</p>
                </div>
                <div className="bg-secondary/50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-foreground">{prayersReceived}</p>
                  <p className="text-xs text-muted-foreground mt-1">People praying for you</p>
                </div>
                <div className="bg-secondary/50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-foreground">{stats?.total_chains_started ?? 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Passed forward</p>
                </div>
              </div>
            )}

            <div className="text-center">
              <Button asChild variant="outline" size="sm">
                <Link to="/ripple">
                  See your prayer journey
                  <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomeDashboard;
