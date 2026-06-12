import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun } from "lucide-react";
import DailyPrayerFocus from "@/components/DailyPrayerFocus";
import FeaturedPrayerCard from "@/components/FeaturedPrayerCard";
import ActivityPulse from "@/components/ActivityPulse";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const HomeDashboard = () => {
  const { user } = useAuth();
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

  return (
    <div className="min-h-screen bg-mesh pb-24 relative overflow-hidden">
      {/* Decorative floating orbs */}
      <div className="pointer-events-none absolute -top-32 -left-24 w-80 h-80 rounded-full bg-primary/20 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute top-40 -right-24 w-96 h-96 rounded-full bg-success/20 blur-3xl animate-float-slow" style={{ animationDelay: "1.5s" }} />
      <div className="pointer-events-none absolute bottom-20 left-1/3 w-72 h-72 rounded-full bg-accent/15 blur-3xl animate-float-slow" style={{ animationDelay: "3s" }} />

      <div className="page-container py-12 section-gap relative">
        {/* Welcome */}
        <div className="page-header animate-rise-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/70 backdrop-blur-md border border-border/60 text-xs text-muted-foreground mb-4 shadow-sm">
            <Sun className="h-3.5 w-3.5 text-accent" />
            {todayLabel}
          </div>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold tracking-tight mb-3">
            Welcome <span className="text-gradient">back</span>
          </h1>
          <p className="page-subtitle text-base md:text-lg">
            Let's take a moment to pray.
          </p>
        </div>

        {/* Section 1 — Featured prayer (core loop: Pray → Impact → Share) */}
        <div className="animate-gentle-fade">
          <FeaturedPrayerCard />
          <div className="mt-5">
            <ActivityPulse />
          </div>
        </div>

        {/* Daily Prayer Focus */}
        <DailyPrayerFocus />

      </div>
    </div>
  );
};

export default HomeDashboard;
