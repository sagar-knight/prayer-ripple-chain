import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Bell, BookOpen, Waves, ArrowRight, Clock, Check } from "lucide-react";
import { getDailyVerse } from "@/data/verses";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const HomeDashboard = () => {
  const dailyVerse = getDailyVerse();
  const { user } = useAuth();
  const [prayedToday, setPrayedToday] = useLocalStorage<Record<string, string>>("prayed_today_log", {});

  const today = new Date().toISOString().split("T")[0];

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
  };

  const hasPrayedToday = (reminderId: string) => prayedToday[reminderId] === today;

  return (
    <div className="min-h-screen bg-gradient-peaceful pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Welcome */}
        <div className="text-center animate-gentle-fade">
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            What would you like to do today?
          </p>
        </div>

        {/* Section 1 — Pray Now */}
        <Card className="border-0 shadow-[var(--shadow-peaceful)] animate-gentle-fade">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Heart className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="font-playfair text-xl">Pray Now</CardTitle>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Take a moment to pray for someone who needs encouragement.
            </p>
            <Button asChild variant="peaceful" size="lg" className="px-10">
              <Link to="/pray">
                Start Praying
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Section 2 — Today's Prayer Reminders */}
        <Card className="border-0 shadow-[var(--shadow-peaceful)] animate-gentle-fade" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <CardTitle className="font-playfair text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Your Prayer Reminders Today
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeReminders.length === 0 ? (
              <div className="text-center py-4 space-y-3">
                <p className="text-muted-foreground text-sm">
                  You have no reminders scheduled today.
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
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {reminder.prayer_title || "Prayer request"}
                      </p>
                      {reminder.reminder_time_local && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {reminder.reminder_time_local}
                        </p>
                      )}
                    </div>
                    {hasPrayedToday(reminder.id) ? (
                      <span className="text-xs text-primary flex items-center gap-1 font-medium">
                        <Check className="h-3.5 w-3.5" />
                        Prayed
                      </span>
                    ) : (
                      <Button
                        variant="peaceful"
                        size="sm"
                        className="text-xs shrink-0"
                        onClick={() => handlePrayedToday(reminder.id)}
                      >
                        I prayed today
                      </Button>
                    )}
                  </div>
                ))}
                <div className="pt-2 text-center">
                  <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                    <Link to="/prayer-reminders">Manage Reminders</Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Section 3 — Scripture Today */}
        <Card className="border-0 shadow-[var(--shadow-peaceful)] animate-gentle-fade" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <CardTitle className="font-playfair text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Scripture Today
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <blockquote className="border-l-4 border-primary/30 pl-4 italic text-foreground/90 text-sm leading-relaxed">
              "{dailyVerse.text}"
            </blockquote>
            <p className="text-sm font-medium text-primary">
              — {dailyVerse.reference} ({dailyVerse.translation})
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

        {/* Ripple Summary */}
        <Card className="border-0 shadow-[var(--shadow-peaceful)] animate-gentle-fade" style={{ animationDelay: "300ms" }}>
          <CardHeader>
            <CardTitle className="font-playfair text-lg flex items-center gap-2">
              <Waves className="h-5 w-5 text-primary" />
              Your Prayer Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.total_prayers_offered ?? 0}</p>
                <p className="text-xs text-muted-foreground">Prayed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.total_prayers_received ?? 0}</p>
                <p className="text-xs text-muted-foreground">Received</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.total_chains_started ?? 0}</p>
                <p className="text-xs text-muted-foreground">Passed forward</p>
              </div>
            </div>
            <div className="text-center">
              <Button asChild variant="outline" size="sm">
                <Link to="/ripple">
                  View Ripple Impact
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
