import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Share2, Sparkles, HandHeart, Globe2, CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import PrayersOfferedDetail from "@/components/PrayersOfferedDetail";
import PrayerRippleChain from "@/components/PrayerRippleChain";
import WorldRippleMap, { type CountryStat } from "@/components/WorldRippleMap";
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

  // Fetch real stats (your offered count)
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

  // Fetch the user's OWN prayer requests + ripple metrics on them
  const { data: myRipple } = useQuery({
    queryKey: ["my_prayer_ripple", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data: requests } = await supabase
        .from("global_prayer_requests")
        .select("id, prayer_count, status")
        .eq("created_by", user.id);
      const ids = (requests || []).map((r) => r.id);
      const peoplePraying = (requests || []).reduce((sum, r) => sum + (r.prayer_count || 0), 0);
      const active = (requests || []).filter((r) => r.status !== "answered" && r.status !== "archived").length;
      const answered = (requests || []).filter((r) => r.status === "answered").length;

      let shares = 0;
      const countries = new Set<string>();
      const countryMap = new Map<string, CountryStat>();
      if (ids.length > 0) {
        const { data: actions } = await supabase
          .from("prayer_actions")
          .select("action_type, prayer_country_code, prayer_country_name, user_id")
          .in("prayer_id", ids);
        for (const a of (actions || []) as any[]) {
          if (a.action_type === "shared" || a.action_type === "forwarded") shares++;
          if (a.prayer_country_code) countries.add(a.prayer_country_code);
          const code = a.prayer_country_code;
          if (code) {
            const existing = countryMap.get(code) || {
              country_code: code,
              country: a.prayer_country_name || code,
              prayers: 0,
              forwards: 0,
              participants: 0,
            };
            if (a.action_type === "prayed") existing.prayers = (existing.prayers || 0) + 1;
            if (a.action_type === "shared" || a.action_type === "forwarded")
              existing.forwards = (existing.forwards || 0) + 1;
            countryMap.set(code, existing);
          }
        }
      }
      return {
        peoplePraying,
        shares,
        countries: countries.size,
        active,
        answered,
        totalRequests: ids.length,
        countryStats: Array.from(countryMap.values()),
      };
    },
    enabled: !!user,
  });

  const ripple = myRipple || { peoplePraying: 0, shares: 0, countries: 0, active: 0, answered: 0, totalRequests: 0, countryStats: [] as CountryStat[] };

  // Build visualization layers from real numbers (cap so it stays calm)
  const layerCounts = [
    Math.min(8, Math.max(1, ripple.peoplePraying || 1)),
    Math.min(10, Math.max(0, ripple.shares * 2)),
    Math.min(12, Math.max(0, ripple.countries * 2)),
  ].filter((c, i) => i === 0 || c > 0);

  const handleShare = async () => {
    const message = ripple.peoplePraying > 0
      ? `${ripple.peoplePraying} people are praying with me. Will you join in?`
      : `Will you pray with me?`;
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
              You are not alone
            </div>
            <h1 className="font-playfair text-4xl md:text-6xl font-bold mb-4 tracking-tight leading-tight">
              People are <span className="text-gradient">praying with you</span>
              <span className="ml-2 relative inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-primary shadow-[0_0_24px_hsl(var(--success)/0.35)] animate-float-slow align-middle">
                <Sparkles className="h-5 w-5 text-white" strokeWidth={2.25} />
              </span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              See how your prayer requests are being carried in prayer by others.
            </p>
          </div>
        </div>

        {/* ============ SECTION A — Your Prayer Requests (ripple lives here) ============ */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-playfair text-2xl sm:text-3xl font-semibold text-foreground flex items-center justify-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Your Prayer Requests
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              How your requests are being carried in prayer.
            </p>
          </div>

          {/* Three core ripple metrics (max 3) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <Card className="card-glass border-0 hover-glow">
              <CardContent className="pt-6 pb-6 text-center space-y-2">
                <Heart className="h-5 w-5 text-primary mx-auto" />
                <p className="text-3xl font-bold text-foreground"><AnimatedNumber value={ripple.peoplePraying} /></p>
                <p className="text-sm text-muted-foreground">people are praying with you</p>
              </CardContent>
            </Card>
            <Card className="card-glass border-0 hover-glow">
              <CardContent className="pt-6 pb-6 text-center space-y-2">
                <Share2 className="h-5 w-5 text-accent mx-auto" />
                <p className="text-3xl font-bold text-foreground"><AnimatedNumber value={ripple.shares} /></p>
                <p className="text-sm text-muted-foreground">{ripple.shares === 1 ? "share" : "shares"}</p>
              </CardContent>
            </Card>
            <Card className="card-glass border-0 hover-glow">
              <CardContent className="pt-6 pb-6 text-center space-y-2">
                <Globe2 className="h-5 w-5 text-success mx-auto" />
                <p className="text-3xl font-bold text-foreground"><AnimatedNumber value={ripple.countries} /></p>
                <p className="text-sm text-muted-foreground">{ripple.countries === 1 ? "country reached" : "countries reached"}</p>
              </CardContent>
            </Card>
          </div>

          {/* Lifecycle counts */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="card-glass rounded-xl p-4 text-center">
              <p className="text-2xl font-semibold text-foreground"><AnimatedNumber value={ripple.active} /></p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1 font-medium">Active requests</p>
            </div>
            <div className="card-glass rounded-xl p-4 text-center">
              <p className="text-2xl font-semibold text-foreground flex items-center justify-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <AnimatedNumber value={ripple.answered} />
              </p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1 font-medium">Answered prayers</p>
            </div>
          </div>

          {/* Ripple visualization */}
          <Card className="card-glass border-0 overflow-hidden hover-glow">
            <CardContent className="pt-8 pb-6">
              <div className="text-center mb-4">
                <h3 className="font-playfair text-xl font-semibold text-foreground">Where prayers are coming from</h3>
                <p className="text-sm text-muted-foreground mt-1.5 max-w-md mx-auto">
                  Each highlighted country is a place someone prayed for you.
                </p>
              </div>
              <WorldRippleMap data={ripple.countryStats} metric="prayers" />
            </CardContent>
          </Card>

          {/* Ripple circle visualization (kept, smaller) */}
          <Card className="card-glass border-0 overflow-hidden hover-glow max-w-md mx-auto">
            <CardContent className="pt-6 pb-4">
              <div className="text-center mb-3">
                <h3 className="font-playfair text-xl font-semibold text-foreground">A picture of your ripple</h3>
                <p className="text-sm text-muted-foreground mt-1.5 max-w-md mx-auto">
                  Each light is a person carried in prayer.
                </p>
              </div>
              <div className="scale-75 origin-top mx-auto">
                <RippleVisualization centerLabel="YOU" layerCounts={layerCounts} />
              </div>
            </CardContent>
          </Card>

          {/* Per-prayer ripple cards (existing component) */}
          <PrayerRippleChain />
        </section>

        <Separator className="max-w-24 mx-auto bg-primary/20" />

        {/* ============ SECTION B — You Prayed for Others (NO ripple here) ============ */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-playfair text-2xl sm:text-3xl font-semibold text-foreground flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              You Prayed for Others
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              The quiet gift of carrying someone else in prayer.
            </p>
          </div>

          <Card className="card-glass border-0 max-w-md mx-auto hover-glow">
            <CardContent className="pt-7 pb-7 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-primary/10 ring-1 ring-primary/20 flex items-center justify-center">
                <HandHeart className="h-5 w-5 text-primary" />
              </div>
              <p className="text-4xl font-bold text-foreground"><AnimatedNumber value={userStats.prayersOffered} /></p>
              <p className="text-sm text-muted-foreground">
                You prayed for {userStats.prayersOffered} {userStats.prayersOffered === 1 ? "person" : "people"}.
              </p>
              <PrayersOfferedDetail />
            </CardContent>
          </Card>
        </section>

        {/* Share reflection */}
        <Card className="card-glass border-0 animate-gentle-fade">
          <CardContent className="pt-6 pb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-accent/15 ring-1 ring-accent/20 flex items-center justify-center">
              <Share2 className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Invite someone to pray with you</p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
                Share a request so the circle of prayer can grow.
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
