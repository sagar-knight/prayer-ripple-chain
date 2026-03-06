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
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Welcome */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-2 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            What would you like to do today?
          </p>
        </div>

        {/* Pray Now */}
        <Card className="border border-border">
          <CardContent className="pt-10 pb-10 text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto">
              <Heart className="h-7 w-7 text-foreground" />
            </div>
            <CardTitle className="text-xl">Pray Now</CardTitle>
            <p className="text-muted-foreground max-w-md mx-auto text-sm">
              Take a moment to pray for someone who needs encouragement.
            </p>
            <Button asChild size="lg" className="px-10 py-6 rounded-full">
              <Link to="/pray">
                Start Praying
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Today's Reminders */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              Your Prayer Reminders Today
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeReminders.length === 0 ? (
              <div className="text-center py-6 space-y-4">
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
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground text-sm truncate">
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
                      <span className="text-xs text-foreground flex items-center gap-1 font-medium">
                        <Check className="h-3.5 w-3.5" />
                        Prayed
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        className="shrink-0 rounded-full"
                        onClick={() => handlePrayedToday(reminder.id)}
                      >
                        I prayed today
                      </Button>
                    )}
                  </div>
                ))}
                <div className="pt-3 text-center">
                  <Button asChild variant="ghost" size="sm" className="text-muted-foreground text-xs">
                    <Link to="/prayer-reminders">Manage Reminders</Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Scripture */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              Scripture Today
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <blockquote className="border-l-2 border-border pl-4 italic text-foreground/80 leading-relaxed">
              "{dailyVerse.text}"
            </blockquote>
            <p className="font-medium text-sm text-muted-foreground">
              — {dailyVerse.reference} ({dailyVerse.translation})
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button asChild variant="outline" size="sm">
                <Link to="/scripture">Read Passage</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ripple Summary */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-3">
              <Waves className="h-5 w-5 text-muted-foreground" />
              Your Prayer Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6 text-center mb-6">
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats?.total_prayers_offered ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Prayed</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats?.total_prayers_received ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Received</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats?.total_chains_started ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Passed forward</p>
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