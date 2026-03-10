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

  const metricCards = [
    {
      label: "Prayers Offered",
      value: userStats.prayersOffered,
      description: `You have prayed for others ${userStats.prayersOffered} times.`,
      secondaryText: "View the requests you prayed for.",
      icon: Heart,
      detail: "offered" as const,
    },
    {
      label: "Prayers Received",
      value: userStats.prayersReceived,
      description: `Your prayer requests have been prayed for ${userStats.prayersReceived} times.`,
      secondaryText: "View the requests that received prayer.",
      icon: Users,
      detail: "received" as const,
    },
    {
      label: "Prayer Requests You Started",
      value: userStats.chainStarted,
      description: `You started ${userStats.chainStarted} prayer requests, and others joined you in prayer.`,
      secondaryText: "View and track each request.",
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
            Ripple Impact
          </h1>
          <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Every prayer matters. Even when unseen, God is at work.
          </p>
          <p className="text-sm text-muted-foreground/80 max-w-lg mx-auto mt-2 leading-relaxed">
            Here you can see how you are praying for others, how others are praying for you, and how your prayer requests are being passed forward.
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
                  {card.secondaryText && (
                    <p className="text-[10px] text-muted-foreground/60">{card.secondaryText}</p>
                  )}
                  {card.detail === "offered" && <PrayersOfferedDetail />}
                  {card.detail === "received" && <PrayersReceivedDetail />}
                  {card.detail === "chains" && <PrayerChainsDetail />}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Per Prayer Request Display */}
        <div className="mb-12">
          <h2 className="font-playfair text-2xl font-bold text-foreground mb-6">
            Your Prayer Requests
          </h2>

          <div className="space-y-6">
            {rippleChains.map((chain, index) => (
              <Card
                key={chain.id}
                className="hover:shadow-peaceful transition-all duration-300 animate-gentle-fade"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="font-playfair text-xl flex items-center gap-2">
                        <Waves className="h-5 w-5 text-primary" />
                        {chain.title}
                      </CardTitle>
                    </div>
                    <Badge variant="secondary">{chain.status}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Prayer Summary */}
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    Prayer Summary
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-primary/5 rounded-lg p-3 text-center">
                      <p className="text-lg font-semibold text-foreground">{chain.prayedCount}</p>
                      <p className="text-xs text-muted-foreground">Prayed {chain.prayedCount} times</p>
                    </div>
                    <div className="bg-primary/5 rounded-lg p-3 text-center">
                      <p className="text-lg font-semibold text-foreground">{chain.uniquePeople}</p>
                      <p className="text-xs text-muted-foreground">{chain.uniquePeople} people prayed</p>
                    </div>
                    <div className="bg-primary/5 rounded-lg p-3 text-center">
                      <p className="text-lg font-semibold text-foreground">{chain.forwardCount}</p>
                      <p className="text-xs text-muted-foreground">Passed forward {chain.forwardCount} times</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground/70 italic">
                    "Passed forward" means someone shared this prayer with another person.
                  </p>

                  {/* Latest Update */}
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
                      Latest Update
                    </p>
                    <p className="text-sm text-muted-foreground">{chain.lastUpdate}</p>
                  </div>

                  <Button variant="outline" className="w-full">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share This Prayer
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Global Prayer Network */}
        <Card className="bg-gradient-primary text-primary-foreground animate-gentle-fade mb-12">
          <CardHeader className="text-center">
            <CardTitle className="font-playfair text-2xl">Global Prayer Network</CardTitle>
            <p className="text-primary-foreground/90">
              See the worldwide reach of our prayer community
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold">{globalStats.totalPrayers.toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Prayers</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{globalStats.activeChains}</div>
                <div className="text-sm opacity-90">Active Requests</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{globalStats.churchesConnected}</div>
                <div className="text-sm opacity-90">Churches Connected</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{globalStats.countriesReached}</div>
                <div className="text-sm opacity-90">Countries Reached</div>
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
            "The prayer of a righteous person is powerful and effective." — James 5:16
          </p>
          <p className="text-xs text-muted-foreground/70">
            Your faithfulness creates impact beyond what you can see.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RippleImpact;
