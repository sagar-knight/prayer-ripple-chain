import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Waves, Heart, Users, Share2, Sparkles, HandHeart, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import PrayersOfferedDetail from "@/components/PrayersOfferedDetail";
import PrayerChainsDetail from "@/components/PrayerChainsDetail";
import PrayersReceivedDetail from "@/components/PrayersReceivedDetail";
import PrayerRippleChain from "@/components/PrayerRippleChain";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

/** Smoothly counts up from 0 to `value` over ~1.2s. */
const AnimatedNumber = ({ value }: { value: number }) => {
  const [display, setDisplay] = useState(0);
  const start = useRef<number | null>(null);

  useEffect(() => {
    let raf = 0;
    const duration = 1200;
    const from = 0;
    const to = Math.max(0, value || 0);
    start.current = null;
    const tick = (t: number) => {
      if (start.current === null) start.current = t;
      const elapsed = t - start.current;
      const p = Math.min(1, elapsed / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <span>{display.toLocaleString()}</span>;
};

/** Soft network ripple visualization with the user at the center. */
const RippleVisualization = ({
  centerLabel,
  layerCounts,
}: {
  centerLabel: string;
  layerCounts: number[]; // people per layer, e.g. [4, 8, 12]
}) => {
  const size = 360;
  const center = size / 2;
  const layers = layerCounts.length;
  const radii = Array.from({ length: layers }, (_, i) => 60 + i * 55);

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      {/* Soft halo */}
      <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-20 blur-3xl" />

      <svg viewBox={`0 0 ${size} ${size}`} className="relative w-full h-full">
        <defs>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity="0.9" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.7" />
          </radialGradient>
        </defs>

        {/* Concentric pulse rings */}
        {radii.map((r, i) => (
          <circle
            key={`ring-${i}`}
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke="hsl(var(--primary) / 0.18)"
            strokeWidth={1}
          />
        ))}

        {/* Connecting lines and nodes per layer */}
        {radii.map((r, layerIdx) => {
          const count = Math.max(3, Math.min(layerCounts[layerIdx] || 0, 12));
          return Array.from({ length: count }).map((_, i) => {
            const angle = (i / count) * Math.PI * 2 + layerIdx * 0.3;
            const x = center + Math.cos(angle) * r;
            const y = center + Math.sin(angle) * r;
            return (
              <g key={`node-${layerIdx}-${i}`}>
                <line
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke="hsl(var(--primary) / 0.12)"
                  strokeWidth={0.6}
                />
                <circle
                  cx={x}
                  cy={y}
                  r={layerIdx === 0 ? 6 : 4}
                  fill="hsl(var(--card))"
                  stroke="hsl(var(--primary))"
                  strokeWidth={1.5}
                />
                <circle
                  cx={x}
                  cy={y}
                  r={layerIdx === 0 ? 3 : 2}
                  fill="hsl(var(--success))"
                  opacity={0.85}
                />
              </g>
            );
          });
        })}

        {/* Center node */}
        <circle cx={center} cy={center} r={26} fill="url(#centerGlow)" />
        <circle
          cx={center}
          cy={center}
          r={26}
          fill="none"
          stroke="hsl(var(--success))"
          strokeWidth={2}
          opacity={0.6}
          className="animate-pulse-ring"
          style={{ transformOrigin: `${center}px ${center}px` }}
        />
      </svg>

      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-[10px] uppercase tracking-widest font-semibold text-white drop-shadow">
          {centerLabel}
        </span>
      </div>
    </div>
  );
};

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
      const [prayersRes, churchesRes, actionsRes] = await Promise.all([
        supabase.from("global_prayer_requests").select("id, status", { count: "exact", head: false }),
        supabase.from("churches_public").select("id", { count: "exact", head: true }),
        supabase.from("prayer_actions").select("id", { count: "exact", head: true }).eq("action_type", "prayed"),
      ]);
      const total = prayersRes.data?.length ?? 0;
      const answered = prayersRes.data?.filter((r) => r.status === "answered").length ?? 0;
      const active = total - answered;
      return {
        totalPrayers: total,
        activeRequests: active,
        churchesConnected: churchesRes.count ?? 0,
        answeredPrayers: answered,
        prayersOffered: actionsRes.count ?? 0,
        peopleCovered: total,
      };
    },
  });

  const globalStats = globalData || {
    totalPrayers: 0,
    activeRequests: 0,
    churchesConnected: 0,
    answeredPrayers: 0,
    prayersOffered: 0,
    peopleCovered: 0,
  };

  // Derived "lives reached" estimate: each prayer offered may ripple ~3 lives forward
  const livesReached = userStats.prayersOffered * 3 + userStats.chainStarted * 5;
  const rippleDepth = userStats.chainStarted > 0 ? Math.min(5, 2 + Math.floor(userStats.chainStarted / 3)) : userStats.prayersOffered > 0 ? 1 : 0;

  // Build visualization layers from real numbers (cap so it stays calm)
  const layerCounts = [
    Math.min(8, Math.max(1, userStats.prayersOffered)),
    Math.min(10, Math.max(0, Math.floor(userStats.prayersOffered * 1.5))),
    Math.min(12, Math.max(0, userStats.chainStarted * 3)),
  ].filter((c, i) => i === 0 || c > 0);

  const handleShare = async () => {
    const message = `Through prayer, ${livesReached} lives have been reached.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Prayer Journey", text: message });
      } else {
        await navigator.clipboard.writeText(message);
        toast.success("Message copied to clipboard");
      }
    } catch {
      // user cancelled or unsupported
    }
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
    <div className="min-h-screen bg-mesh py-12 pb-24 relative overflow-hidden">
      {/* Decorative floating orbs */}
      <div className="pointer-events-none absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-success/20 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-primary/20 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />
      <div className="pointer-events-none absolute bottom-20 -left-20 w-72 h-72 rounded-full bg-accent/15 blur-3xl animate-float-slow" style={{ animationDelay: "4s" }} />

      <div className="page-container section-gap relative">
        {/* Hero */}
        <div className="relative text-center max-w-3xl mx-auto animate-rise-in">
          <div className="absolute inset-x-20 -top-10 h-40 bg-gradient-primary opacity-30 blur-3xl rounded-full pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/70 backdrop-blur-md border border-primary/20 text-xs font-medium text-primary mb-5 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Your Ripple of Prayer
            </div>
            <h1 className="font-playfair text-4xl md:text-6xl font-bold mb-4 tracking-tight leading-tight">
              Your prayers are <span className="text-gradient">moving</span>
              <span className="ml-2 relative inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-primary shadow-[0_0_24px_hsl(var(--success)/0.35)] animate-float-slow align-middle">
                <Sparkles className="h-5 w-5 text-white" strokeWidth={2.25} />
              </span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Every prayer creates a ripple. See how yours have spread.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
              <div className="card-glass rounded-2xl p-5 text-center hover-glow animate-rise-in">
                <p className="text-4xl font-bold text-foreground"><AnimatedNumber value={userStats.prayersOffered} /></p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1.5 font-semibold">People prayed for</p>
              </div>
              <div className="card-glass rounded-2xl p-5 text-center hover-glow animate-rise-in" style={{ animationDelay: "120ms" }}>
                <p className="text-4xl font-bold text-success"><AnimatedNumber value={livesReached} /></p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1.5 font-semibold">Lives reached</p>
              </div>
              <div className="card-glass rounded-2xl p-5 text-center hover-glow animate-rise-in" style={{ animationDelay: "240ms" }}>
                <p className="text-4xl font-bold text-primary"><AnimatedNumber value={rippleDepth} /></p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1.5 font-semibold">Ripple layers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ripple Visualization */}
        <Card className="card-glass border-0 overflow-hidden animate-rise-in hover-glow">
          <CardContent className="pt-8 pb-6">
            <div className="text-center mb-4">
              <h2 className="font-playfair text-2xl font-semibold text-foreground">A picture of your prayer ripple</h2>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-md mx-auto">
                Each light is a person carried in prayer. The circle grows as prayer is passed forward.
              </p>
            </div>
            <RippleVisualization centerLabel="YOU" layerCounts={layerCounts} />
          </CardContent>
        </Card>

        {/* Live Impact Card */}
        {userStats.chainStarted > 0 && (
          <Card className="card-glass border-success/20 animate-rise-in animate-glow-pulse">
            <CardContent className="pt-6 pb-6 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-success/15 flex items-center justify-center ring-1 ring-success/20">
                <Sparkles className="h-5 w-5 text-success animate-peaceful-glow" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Prayer is being passed forward</p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                  Someone you prayed for has been lifted up by others, continuing the chain you helped begin.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personal Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-gentle-fade">
          {metricCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.label}
                className="card-glass border-0 lift-on-hover animate-gentle-fade"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <CardContent className="pt-7 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-primary/10 ring-1 ring-primary/20 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    {card.label}
                  </p>
                  <p className="text-2xl font-semibold text-foreground">{card.value}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
                  {card.detail === "offered" && <PrayersOfferedDetail />}
                  {card.detail === "received" && <PrayersReceivedDetail />}
                  {card.detail === "chains" && <PrayerChainsDetail />}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Prayer Ripple Visualization */}
        <div>
          <PrayerRippleChain />
        </div>

        {/* Global Prayer Network */}
        <Card className="bg-gradient-primary text-primary-foreground animate-rise-in border-0 shadow-glow relative overflow-hidden">
          <div className="absolute inset-0 bg-aurora opacity-30 mix-blend-overlay pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <CardHeader className="text-center">
            <CardTitle className="font-playfair text-2xl">Prayer in Action</CardTitle>
            <p className="text-primary-foreground/90">
              See how prayers are spreading across the world
            </p>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center max-w-3xl mx-auto">
              <div className="space-y-2 flex flex-col items-center">
                <HandHeart className="h-7 w-7 opacity-90" />
                <div className="text-4xl font-bold tracking-tight"><AnimatedNumber value={globalStats.prayersOffered} /></div>
                <div className="text-sm font-medium opacity-95">Prayers Offered</div>
                <div className="text-xs opacity-75">Lifted up by this community</div>
              </div>
              <div className="space-y-2 flex flex-col items-center">
                <User className="h-7 w-7 opacity-90" />
                <div className="text-4xl font-bold tracking-tight"><AnimatedNumber value={globalStats.peopleCovered} /></div>
                <div className="text-sm font-medium opacity-95">People Covered</div>
                <div className="text-xs opacity-75">Receiving prayer right now</div>
              </div>
              <div className="space-y-2 flex flex-col items-center">
                <Sparkles className="h-7 w-7 opacity-90" />
                <div className="text-4xl font-bold tracking-tight"><AnimatedNumber value={globalStats.answeredPrayers} /></div>
                <div className="text-sm font-medium opacity-95">Answered Prayers</div>
                <div className="text-xs opacity-75">Stories of God at work</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Share reflection */}
        <Card className="card-glass border-0 animate-gentle-fade">
          <CardContent className="pt-6 pb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-accent/15 ring-1 ring-accent/20 flex items-center justify-center">
              <Share2 className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Share a reflection</p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
                Invite a friend to join in prayer with you.
              </p>
            </div>
            <Button variant="outline" onClick={handleShare} className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </CardContent>
        </Card>

        {/* Encouragement Footer */}
        <div className="text-center animate-gentle-fade space-y-3">
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
