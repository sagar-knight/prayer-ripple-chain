import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Waves, Heart, Users, Share2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import PrayersOfferedDetail from "@/components/PrayersOfferedDetail";
import PrayerChainsDetail from "@/components/PrayerChainsDetail";
import PrayersReceivedDetail from "@/components/PrayersReceivedDetail";
import PrayerRippleChain from "@/components/PrayerRippleChain";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const RippleImpact = () => {
  const { user } = useAuth();

  // Fetch real stats
  const { data: stats } = useQuery({
    queryKey: ["user_prayer_stats_ripple", user?.id],
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

  const userStats = {
    prayersOffered: stats?.total_prayers_offered ?? 0,
    prayersReceived: stats?.total_prayers_received ?? 0,
    chainStarted: stats?.total_chains_started ?? 0,
  };

  // Fetch global stats from real data
  const { data: globalData } = useQuery({
    queryKey: ["global_prayer_stats"],
    queryFn: async () => {
      const [prayersRes, churchesRes] = await Promise.all([
        supabase.from("global_prayer_requests").select("id, status", { count: "exact", head: false }),
        supabase.from("churches").select("id", { count: "exact", head: true }),
      ]);
      const total = prayersRes.data?.length ?? 0;
      const answered = prayersRes.data?.filter((r) => r.status === "answered").length ?? 0;
      const active = total - answered;
      return {
        totalPrayers: total,
        activeRequests: active,
        churchesConnected: churchesRes.count ?? 0,
        answeredPrayers: answered,
      };
    },
  });

  const globalStats = globalData || {
    totalPrayers: 0,
    activeRequests: 0,
    churchesConnected: 0,
    answeredPrayers: 0,
  };

  const getEncouragingMessage = (count: number) => {
    if (count === 0) return "Begin your journey by praying for someone today.";
    if (count < 5) return "You have been praying for others. Thank you.";
    if (count < 15) return "You've helped carry several requests in prayer.";
    return "You are part of a growing circle of prayer.";
  };

  const metricCards = [
    {
      label: "Prayed for Others",
      value: userStats.prayersOffered,
      description: getEncouragingMessage(userStats.prayersOffered),
      icon: Heart,
      detail: "offered" as const,
    },
    {
      label: "People Praying for You",
      value: userStats.prayersReceived,
      description: userStats.prayersReceived > 0
        ? "People have been praying for your requests."
        : "Share a request and others will pray with you.",
      icon: Users,
      detail: "received" as const,
    },
    {
      label: "Prayers Passed Forward",
      value: userStats.chainStarted,
      description: userStats.chainStarted > 0
        ? "Your prayers have been shared with others who joined in."
        : "When you pass a prayer forward, more people join in.",
      icon: Waves,
      detail: "chains" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 animate-gentle-fade">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-5">
            <Waves className="h-8 w-8 text-primary opacity-80" />
          </div>
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-3">
            Your Prayer Journey
          </h1>
          <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Every prayer matters. Even when unseen, God is at work.
          </p>
          <p className="text-sm text-muted-foreground/80 max-w-lg mx-auto mt-2 leading-relaxed">
            See how you are praying for others, how others are praying for you, and how prayer is being passed forward.
          </p>
          <Separator className="max-w-24 mx-auto mt-6 bg-primary/20" />
        </div>

        {/* Personal Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 animate-gentle-fade">
          {metricCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.label}
                className="border-primary/10 shadow-sm hover:shadow-md transition-shadow animate-gentle-fade"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <CardContent className="pt-6 text-center space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-1">
                    <Icon className="h-5 w-5 text-primary opacity-80" />
                  </div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    {card.label}
                  </p>
                  <p className="text-2xl font-semibold text-foreground">{card.value}</p>
                  <p className="text-sm text-muted-foreground leading-snug">{card.description}</p>
                  {card.detail === "offered" && <PrayersOfferedDetail />}
                  {card.detail === "received" && <PrayersReceivedDetail />}
                  {card.detail === "chains" && <PrayerChainsDetail />}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Prayer Ripple Chain Visualization */}
        <div className="mb-12">
          <h2 className="font-playfair text-2xl font-bold text-foreground mb-6">
            Your Prayer Requests
          </h2>
          <PrayerRippleChain />
        </div>

        {/* Global Prayer Network */}
        <Card className="bg-gradient-primary text-primary-foreground animate-gentle-fade mb-12">
          <CardHeader className="text-center">
            <CardTitle className="font-playfair text-2xl">Global Prayer Community</CardTitle>
            <p className="text-primary-foreground/90">
              You are part of a worldwide community of prayer.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold">{globalStats.totalPrayers.toLocaleString()}</div>
                <div className="text-sm opacity-90">Prayer Requests</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{globalStats.activeRequests}</div>
                <div className="text-sm opacity-90">Needing Prayer</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{globalStats.churchesConnected}</div>
                <div className="text-sm opacity-90">Churches Connected</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{globalStats.answeredPrayers.toLocaleString()}</div>
                <div className="text-sm opacity-90">Answered Prayers</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Encouragement Footer */}
        <div className="text-center animate-gentle-fade space-y-2">
          <Separator className="max-w-24 mx-auto mb-6 bg-primary/20" />
          <p className="text-sm italic text-muted-foreground max-w-md mx-auto leading-relaxed">
            "The prayer of a righteous person is powerful and effective." - James 5:16
          </p>
          <p className="text-xs text-muted-foreground/70">
            Your faithfulness in prayer makes a difference beyond what you can see.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RippleImpact;
