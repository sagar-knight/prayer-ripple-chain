import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SharePrayerDialog from "@/components/SharePrayerDialog";
import { Heart, Share2, Loader2, Waves, ChevronRight } from "lucide-react";
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

const PrayerRippleChain = () => {
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

  const totalPeoplePraying = chains.reduce((sum, c) => sum + (c.uniquePeople || 0), 0);
  const anyRecent = chains.some((c) => {
    const d = c.lastPrayedAt;
    return !!d && Date.now() - d.getTime() < 24 * 60 * 60 * 1000;
  });
  const liveLine = totalPeoplePraying === 0
    ? "Your prayer has been shared. Hope is on the way."
    : anyRecent
      ? "Someone prayed for you recently"
      : "Your prayer ripple is growing";

  return <RippleList chains={chains} liveLine={liveLine} />;
};

const RippleList = ({
  chains,
  liveLine,
}: {
  chains: PrayerChainData[];
  liveLine: string;
}) => {
  const [shareFor, setShareFor] = useState<{ id: string; title: string } | null>(null);
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="space-y-4">
      {/* Unified Ripple Block — header + prayers in one card */}
      <Card className="relative border-0 overflow-hidden bg-gradient-to-br from-card via-card to-primary/5 shadow-[0_8px_40px_-12px_hsl(var(--primary)/0.35)] ring-1 ring-primary/15">
        {/* Soft glow */}
        <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 w-56 h-56 rounded-full bg-accent/10 blur-3xl" />

        <CardContent className="relative p-0">
          {/* Header */}
          <div className="pt-7 pb-5 px-6 text-center space-y-4">
            {/* Animated ripple emblem */}
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full border border-primary/30 ripple-ring" />
              <span className="absolute inset-0 rounded-full border border-primary/20 ripple-ring" style={{ animationDelay: "1s" }} />
              <span className="absolute inset-0 rounded-full border border-primary/15 ripple-ring" style={{ animationDelay: "2s" }} />
              <span className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 ring-1 ring-primary/30 flex items-center justify-center shadow-[0_0_24px_hsl(var(--primary)/0.4)]">
                <Waves className="h-5 w-5 text-primary" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-success animate-ping" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-success" />
              </span>
            </div>

            <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-primary/80">
              Your Prayer Ripple
            </p>

            {/* Live activity line */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 animate-ping" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
              </span>
              <span className="italic">{liveLine}</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-primary gap-1.5"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? "Hide Journey" : "View Journey"}
              <ChevronRight
                className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`}
              />
            </Button>
          </div>

          {/* Expanded prayers — nested inside the same card */}
          {expanded && (
            <div className="px-5 pb-6 space-y-3 animate-gentle-fade">
              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              {chains.map((chain) => {
                const isGrowing = chain.status !== "answered";
                return (
                  <div
                    key={chain.prayerId}
                    className="rounded-xl border border-border/40 bg-card/50 p-4 space-y-3"
                  >
                    {/* Title row */}
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-base text-foreground leading-relaxed font-medium flex-1 text-left">
                        {chain.title}
                      </p>
                      <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-foreground/30 text-foreground/70 font-medium shrink-0">
                        Yours
                      </span>
                    </div>

                    {!isGrowing && (
                      <Badge
                        variant="outline"
                        className="border-accent/40 text-accent bg-accent/5"
                      >
                        Completed
                      </Badge>
                    )}

                    {/* Compact stats row */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Heart className="h-3.5 w-3.5 text-primary/60" />
                        {chain.uniquePeople > 0
                          ? `${chain.uniquePeople} ${chain.uniquePeople === 1 ? "person" : "people"} praying`
                          : "Waiting for prayers"}
                      </span>
                      {chain.forwardCount > 0 && (
                        <span className="inline-flex items-center gap-1.5">
                          <Share2 className="h-3.5 w-3.5 text-primary/60" />
                          Shared {chain.forwardCount} {chain.forwardCount === 1 ? "time" : "times"}
                        </span>
                      )}
                    </div>

                    {/* Forward button */}
                    <div className="flex justify-start pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => setShareFor({ id: chain.prayerId, title: chain.title })}
                      >
                        <Share2 className="h-4 w-4" />
                        Forward Prayer
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>

        <style>{`
          @keyframes ripple-ring {
            0% { transform: scale(0.6); opacity: 0.7; }
            100% { transform: scale(1.6); opacity: 0; }
          }
          .ripple-ring {
            animation: ripple-ring 3s ease-out infinite;
          }
        `}</style>
      </Card>

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

export default PrayerRippleChain;
