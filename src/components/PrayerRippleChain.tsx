import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SharePrayerDialog from "@/components/SharePrayerDialog";
import { Heart, Share2, Loader2, Waves, Globe2, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface ChainNode {
  label: string;
  type: "requester" | "prayed" | "shared";
}

interface PrayerChainData {
  prayerId: string;
  title: string;
  category: string;
  prayedCount: number;
  uniquePeople: number;
  forwardCount: number;
  lastPrayedAt: Date | null;
  rippleDepth: number;
  status: string;
  chain: ChainNode[];
}

interface Props {
  selectedPrayerId?: string | null;
  onSelectPrayer?: (id: string) => void;
}

const PrayerRippleChain = ({ selectedPrayerId = null, onSelectPrayer }: Props) => {
  const { user } = useAuth();

  const { data: chains, isLoading } = useQuery({
    queryKey: ["prayer_ripple_chains", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: requests } = await supabase
        .from("global_prayer_requests")
        .select("*")
        .eq("created_by", user.id)
        .in("status", ["open", "progress", "answered"])
        .order("created_at", { ascending: false })
        .limit(10);

      if (!requests?.length) return [];

      const prayerIds = requests.map((r) => r.id);

      const { data: coverageData } = await supabase
        .from("prayer_coverage")
        .select("*")
        .in("prayer_id", prayerIds);

      const coverageMap = new Map(
        (coverageData || []).map((c) => [c.prayer_id, c])
      );

      const { data: chainNodes } = await supabase
        .from("prayer_chain_nodes")
        .select("prayer_id, depth_level")
        .in("prayer_id", prayerIds);

      const { data: actions } = await supabase
        .from("prayer_actions")
        .select("prayer_id, action_type, user_id, created_at")
        .in("prayer_id", prayerIds);

      return requests.map((req): PrayerChainData => {
        const coverage = coverageMap.get(req.id);
        const reqActions = (actions || []).filter((a) => a.prayer_id === req.id);
        const prayedActions = reqActions.filter((a) => a.action_type === "prayed");
        const sharedActions = reqActions.filter((a) => a.action_type === "shared");

        const chain: ChainNode[] = [
          { label: "You requested prayer", type: "requester" },
        ];

        const uniquePrayers = new Set(prayedActions.map((a) => a.user_id));
        const prayerNames = [
          "A prayer partner", "Someone", "A believer",
          "A community member", "A faithful friend",
          "A prayer warrior", "A caring soul",
          "A fellow believer",
        ];

        let nameIdx = 0;
        uniquePrayers.forEach(() => {
          chain.push({
            label: `${prayerNames[nameIdx % prayerNames.length]} prayed`,
            type: "prayed",
          });
          nameIdx++;
        });

        sharedActions.forEach(() => {
          chain.push({
            label: "Passed forward",
            type: "shared",
          });
        });

        const lastAction = reqActions
          .map((a) => new Date(a.created_at as any))
          .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;

        const reqNodes = (chainNodes || []).filter((n) => n.prayer_id === req.id);
        const maxDepth = reqNodes.reduce((m, n) => Math.max(m, n.depth_level ?? 0), 0);
        const forwardCount = coverage?.passed_forward_count ?? 0;
        const rippleDepth = Math.max(maxDepth, forwardCount > 0 ? 2 : (coverage?.unique_people_prayed ?? 0) > 0 ? 1 : 0);

        return {
          prayerId: req.id,
          title: req.title,
          category: req.category,
          prayedCount: coverage?.current_prayers ?? req.prayer_count,
          uniquePeople: coverage?.unique_people_prayed ?? 0,
          forwardCount,
          lastPrayedAt: lastAction,
          rippleDepth,
          status: req.status,
          chain,
        };
      });
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading prayer chains...</span>
      </div>
    );
  }

  if (!chains?.length) {
    return (
      <Card className="card-glass border-0">
        <CardContent className="p-6 text-center space-y-2">
          <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Waves className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">Your prayer requests</p>
          <p className="text-xs text-muted-foreground">
            Submit a prayer request to see how it ripples through the community.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <RippleList
      chains={chains}
      selectedPrayerId={selectedPrayerId}
      onSelectPrayer={onSelectPrayer}
    />
  );
};

const RippleList = ({
  chains,
  selectedPrayerId,
  onSelectPrayer,
}: {
  chains: PrayerChainData[];
  selectedPrayerId: string | null;
  onSelectPrayer?: (id: string) => void;
}) => {
  const [shareFor, setShareFor] = useState<{ id: string; title: string } | null>(null);

  return (
    <div className="space-y-3">
      {/* Header row: count + tap hint. Stays compact no matter how many prayers exist. */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary/70" />
          {chains.length > 1 ? (
            <span>Tap a prayer to focus the map. Scroll for more.</span>
          ) : (
            <span>Your ripple</span>
          )}
        </div>
        <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-border text-muted-foreground shrink-0">
          {chains.length} {chains.length === 1 ? "prayer" : "prayers"}
        </span>
      </div>

      {/* Horizontal snap row — scales to any number of prayers without growing the page. */}
      <div className="-mx-1 px-1 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-thin">
        <div className="flex gap-3 pb-2">
        {chains.map((chain) => {
          const isAnswered = chain.status === "answered";
          const isSelected = selectedPrayerId === chain.prayerId;
          const people = chain.uniquePeople || 0;
          const shares = chain.forwardCount || 0;

          return (
            <button
              key={chain.prayerId}
              type="button"
              onClick={() => onSelectPrayer?.(chain.prayerId)}
              className={`group relative text-left rounded-2xl overflow-hidden transition-all duration-300 snap-start shrink-0 w-[270px] sm:w-[290px] ${
                isSelected
                  ? "ring-2 ring-primary shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.5)] scale-[1.01]"
                  : "ring-1 ring-border hover:ring-primary/40 hover:shadow-[0_6px_24px_-10px_hsl(var(--primary)/0.35)]"
              }`}
            >
              <Card className="border-0 bg-gradient-to-br from-card via-card to-primary/[0.04]">
                <CardContent className="p-4 space-y-3">
                  {/* Header row: title + status pill */}
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug flex-1">
                      {chain.title}
                    </p>
                    {isAnswered ? (
                      <Badge variant="outline" className="border-accent/40 text-accent bg-accent/5 shrink-0">
                        Answered
                      </Badge>
                    ) : (
                      <span
                        className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border shrink-0 transition-colors ${
                          isSelected
                            ? "border-primary/60 text-primary bg-primary/10"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {isSelected ? "Focused" : "Yours"}
                      </span>
                    )}
                  </div>

                  {/* Mini ripple visualization + 3 stats */}
                  <div className="flex items-center gap-4">
                    <MiniRipple people={people} shares={shares} active={isSelected} />
                    <div className="grid grid-cols-3 gap-2 flex-1 text-center">
                      <Stat icon={<Heart className="h-3 w-3" />} value={people} label="praying" />
                      <Stat icon={<Share2 className="h-3 w-3" />} value={shares} label={shares === 1 ? "share" : "shares"} />
                      <Stat
                        icon={<Globe2 className="h-3 w-3" />}
                        value={chain.rippleDepth || (people > 0 ? 1 : 0)}
                        label="depth"
                      />
                    </div>
                  </div>

                  {/* Forward button — stops the card-click filter */}
                  <div onClick={(e) => e.stopPropagation()} className="flex justify-end pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2.5 gap-1.5 text-xs text-primary hover:bg-primary/10"
                      onClick={() => setShareFor({ id: chain.prayerId, title: chain.title })}
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      Forward
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </button>
          );
        })}
        </div>
      </div>

      {shareFor && (
        <SharePrayerDialog
          open={!!shareFor}
          onOpenChange={(o) => !o && setShareFor(null)}
          prayerId={shareFor.id}
          prayerTitle={shareFor.title}
        />
      )}
    </div>
  );
};

/** Small numeric stat with an icon. */
const Stat = ({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) => (
  <div className="flex flex-col items-center gap-0.5">
    <div className="flex items-center gap-1 text-foreground/80">
      {icon}
      <span className="text-sm font-semibold tabular-nums">{value}</span>
    </div>
    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
  </div>
);

/** Tiny concentric ring diagram with a soft pulse. */
const MiniRipple = ({ people, shares, active }: { people: number; shares: number; active: boolean }) => {
  const size = 64;
  const c = size / 2;
  // Number of dots on inner / outer ring scales with people / shares, capped for calm visuals.
  const innerDots = Math.min(8, Math.max(people > 0 ? 1 : 0, Math.min(people, 8)));
  const outerDots = Math.min(10, Math.max(0, shares * 2));

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
        {/* Rings */}
        <circle cx={c} cy={c} r={14} fill="none" stroke="hsl(var(--primary) / 0.25)" strokeWidth={1} />
        <circle cx={c} cy={c} r={26} fill="none" stroke="hsl(var(--primary) / 0.15)" strokeWidth={1} />
        {active && (
          <>
            <circle
              cx={c}
              cy={c}
              r={14}
              fill="none"
              stroke="hsl(var(--primary) / 0.6)"
              strokeWidth={1}
              style={{ transformOrigin: `${c}px ${c}px`, animation: "mini-ripple 2.4s ease-out infinite" }}
            />
            <circle
              cx={c}
              cy={c}
              r={26}
              fill="none"
              stroke="hsl(var(--primary) / 0.4)"
              strokeWidth={1}
              style={{ transformOrigin: `${c}px ${c}px`, animation: "mini-ripple 2.4s ease-out 0.8s infinite" }}
            />
          </>
        )}

        {/* Inner dots — people praying */}
        {Array.from({ length: innerDots }).map((_, i) => {
          const a = (i / Math.max(innerDots, 1)) * Math.PI * 2;
          const x = c + Math.cos(a) * 14;
          const y = c + Math.sin(a) * 14;
          return (
            <circle key={`i-${i}`} cx={x} cy={y} r={2} fill="hsl(var(--success))" opacity={0.85} />
          );
        })}

        {/* Outer dots — shares */}
        {Array.from({ length: outerDots }).map((_, i) => {
          const a = (i / Math.max(outerDots, 1)) * Math.PI * 2 + 0.3;
          const x = c + Math.cos(a) * 26;
          const y = c + Math.sin(a) * 26;
          return (
            <circle key={`o-${i}`} cx={x} cy={y} r={1.6} fill="hsl(var(--accent))" opacity={0.75} />
          );
        })}

        {/* Center heart node */}
        <circle
          cx={c}
          cy={c}
          r={6}
          fill={active ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.85)"}
        />
      </svg>
      <style>{`
        @keyframes mini-ripple {
          0% { transform: scale(0.6); opacity: 0.6; }
          100% { transform: scale(1.35); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default PrayerRippleChain;
