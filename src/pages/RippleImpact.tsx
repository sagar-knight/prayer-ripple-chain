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
  countryStats = [],
}: {
  centerLabel: string;
  layerCounts: number[]; // people per layer, e.g. [4, 8, 12]
  countryStats?: CountryStat[];
}) => {
  const size = 360;
  const center = size / 2;
  const layers = layerCounts.length;
  const radii = Array.from({ length: layers }, (_, i) => 60 + i * 55);
  const [tapped, setTapped] = useState<{ x: number; y: number; label: string } | null>(null);

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

        {/* Concentric pulse rings — slow outward ripple waves */}
        {radii.map((r, i) => (
          <g key={`ring-${i}`}>
            <circle
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke="hsl(var(--primary) / 0.18)"
              strokeWidth={1}
            />
            <circle
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke="hsl(var(--primary) / 0.35)"
              strokeWidth={1}
              style={{
                transformOrigin: `${center}px ${center}px`,
                animation: `ripple-wave 4s ease-out ${i * 1.2}s infinite`,
              }}
            />
          </g>
        ))}

        {/* Connecting lines and nodes per layer */}
        {radii.map((r, layerIdx) => {
          const count = Math.max(3, Math.min(layerCounts[layerIdx] || 0, 12));
          return Array.from({ length: count }).map((_, i) => {
            const angle = (i / count) * Math.PI * 2 + layerIdx * 0.3;
            const x = center + Math.cos(angle) * r;
            const y = center + Math.sin(angle) * r;
            const country = countryStats[(layerIdx * 7 + i) % Math.max(1, countryStats.length)];
            const label = country?.country
              ? `Prayer from ${country.country}`
              : "Someone prayed recently";
            const delay = ((layerIdx * 13 + i * 7) % 100) / 50; // 0-2s
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
                <g
                  onClick={() => setTapped({ x, y, label })}
                  style={{
                    cursor: "pointer",
                    transformOrigin: `${x}px ${y}px`,
                    animation: `dot-pulse 3s ease-in-out ${delay}s infinite, dot-appear 0.6s ease-out both`,
                  }}
                >
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

      {/* Tap tooltip */}
      {tapped && (
        <div
          className="absolute bg-background/95 border border-border rounded-md px-2.5 py-1.5 text-xs shadow-md pointer-events-auto animate-fade-in"
          style={{
            left: `${(tapped.x / size) * 100}%`,
            top: `${(tapped.y / size) * 100}%`,
            transform: "translate(-50%, -130%)",
          }}
          onClick={() => setTapped(null)}
        >
          {tapped.label}
        </div>
      )}

      <style>{`
        @keyframes ripple-wave {
          0% { transform: scale(0.6); opacity: 0.6; }
          100% { transform: scale(1.25); opacity: 0; }
        }
        @keyframes dot-pulse {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes dot-appear {
          0% { opacity: 0; transform: scale(0); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
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

          {/* Lifecycle count: active requests */}
          <div className="max-w-xs mx-auto">
            <div className="card-glass rounded-xl p-4 text-center">
              <p className="text-2xl font-semibold text-foreground"><AnimatedNumber value={ripple.active} /></p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1 font-medium">Active requests</p>
            </div>
          </div>

          {/* Unified: impact metrics + world map + ripple circle */}
          <Card className="card-glass border-0 overflow-hidden hover-glow">
            <CardContent className="pt-8 pb-8 space-y-6">
              {/* Title */}
              <div className="text-center">
                <h3 className="font-playfair text-xl sm:text-2xl font-semibold text-foreground flex items-center justify-center gap-2">
                  <Globe2 className="h-5 w-5 text-success" />
                  Your prayer is spreading
                </h3>
                <p className="text-sm text-muted-foreground mt-1.5 max-w-md mx-auto">
                  From you, to many, across the world.
                </p>
              </div>

              {/* Top: three core metrics */}
              <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto">
                <div className="text-center">
                  <Heart className="h-4 w-4 text-primary mx-auto mb-1" />
                  <p className="text-2xl font-semibold text-foreground"><AnimatedNumber value={ripple.peoplePraying} /></p>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">praying with you</p>
                </div>
                <div className="text-center">
                  <Share2 className="h-4 w-4 text-accent mx-auto mb-1" />
                  <p className="text-2xl font-semibold text-foreground"><AnimatedNumber value={ripple.shares} /></p>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{ripple.shares === 1 ? "share" : "shares"}</p>
                </div>
                <div className="text-center">
                  <Globe2 className="h-4 w-4 text-success mx-auto mb-1" />
                  <p className="text-2xl font-semibold text-foreground"><AnimatedNumber value={ripple.countries} /></p>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{ripple.countries === 1 ? "country reached" : "countries reached"}</p>
                </div>
              </div>

              {/* Middle: world map */}
              <div>
                <WorldRippleMap data={ripple.countryStats} metric="prayers" />
                {ripple.countryStats.length > 0 && (
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {ripple.countryStats.map((c) => (
                      <span
                        key={c.country_code}
                        className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-foreground border border-primary/15"
                      >
                        {c.country}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom: ripple circle (smaller, personal connection) */}
              <div>
                <div className="scale-75 origin-top mx-auto">
                  <RippleVisualization
                    centerLabel="YOU"
                    layerCounts={layerCounts}
                    countryStats={ripple.countryStats}
                  />
                </div>
                <p className="text-center text-xs text-muted-foreground italic">
                  Each light represents someone praying with you
                </p>
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
