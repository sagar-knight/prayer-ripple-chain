import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PrayerRequestCard from "@/components/PrayerRequestCard";
import SharePrayerDialog from "@/components/SharePrayerDialog";
import { Heart, Share2, Sparkles, Loader2, Waves, ChevronRight } from "lucide-react";
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

      // Fetch user's global prayer requests
      const { data: requests } = await supabase
        .from("global_prayer_requests")
        .select("*")
        .eq("created_by", user.id)
        .in("status", ["open", "progress", "answered"])
        .order("created_at", { ascending: false })
        .limit(10);

      if (!requests?.length) return [];

      const prayerIds = requests.map((r) => r.id);

      // Fetch coverage data
      const { data: coverageData } = await supabase
        .from("prayer_coverage")
        .select("*")
        .in("prayer_id", prayerIds);

      const coverageMap = new Map(
        (coverageData || []).map((c) => [c.prayer_id, c])
      );

      // Fetch chain nodes for these prayers (used for ripple depth)
      const { data: chainNodes } = await supabase
        .from("prayer_chain_nodes")
        .select("prayer_id, depth_level")
        .in("prayer_id", prayerIds);

      // Fetch action counts for chain visualization
      const { data: actions } = await supabase
        .from("prayer_actions")
        .select("prayer_id, action_type, user_id, created_at")
        .in("prayer_id", prayerIds);

      // Build chains
      return requests.map((req): PrayerChainData => {
        const coverage = coverageMap.get(req.id);
        const reqActions = (actions || []).filter((a) => a.prayer_id === req.id);
        const prayedActions = reqActions.filter((a) => a.action_type === "prayed");
        const sharedActions = reqActions.filter((a) => a.action_type === "shared");

        // Build anonymized chain for display
        const chain: ChainNode[] = [
          { label: "You requested prayer", type: "requester" },
        ];

        // Add unique prayed participants (anonymized)
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

        // Add shares
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
      <PrayerRequestCard
        header="Your prayer requests"
        description="Submit a prayer request to see how it ripples through the community."
        className="text-center"
      />
    );
  }

  const recentlyPrayed = (date: Date | null) =>
    !!date && Date.now() - date.getTime() < 24 * 60 * 60 * 1000;

  return <RippleList chains={chains} recentlyPrayed={recentlyPrayed} />;
};

/** Builds the dotted ripple flow: ● → ○ → ○ … */
const RippleFlow = ({ depth, unique }: { depth: number; unique: number }) => {
  // Show "You" then up to 4 ripple layers based on depth
  const layers = Math.min(4, Math.max(1, depth || (unique > 0 ? 1 : 0)));
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 py-2 select-none">
      <span
        className="inline-flex h-3 w-3 rounded-full bg-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.15)]"
        aria-label="You"
      />
      {Array.from({ length: layers }).map((_, i) => (
        <span key={i} className="flex items-center gap-2 sm:gap-3">
          <span className="text-muted-foreground/60 text-xs">→</span>
          <span
            className="inline-flex h-3 w-3 rounded-full border border-primary/40"
            style={{ opacity: 1 - i * 0.18 }}
            aria-hidden
          />
        </span>
      ))}
    </div>
  );
};

const RippleList = ({
  chains,
  recentlyPrayed,
}: {
  chains: PrayerChainData[];
  recentlyPrayed: (d: Date | null) => boolean;
}) => {
  const [shareFor, setShareFor] = useState<{ id: string; title: string } | null>(null);
  const [expanded, setExpanded] = useState(false);

  const totalPeoplePraying = chains.reduce((sum, c) => sum + (c.uniquePeople || 0), 0);
  const growingCount = chains.filter((c) => c.status !== "answered").length;
  const anyRecent = chains.some((c) => recentlyPrayed(c.lastPrayedAt));
  const liveLine = totalPeoplePraying === 0
    ? "Your prayer has been shared. Hope is on the way."
    : anyRecent
      ? "Someone prayed for you recently"
      : "Your prayer ripple is growing";

  return (
    <div className="space-y-6">
      {/* Live Ripple Card */}
      <Card className="relative border-0 max-w-md mx-auto overflow-hidden bg-gradient-to-br from-card via-card to-primary/5 shadow-[0_8px_40px_-12px_hsl(var(--primary)/0.35)] ring-1 ring-primary/15">
        {/* Soft glow */}
        <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 w-56 h-56 rounded-full bg-accent/10 blur-3xl" />

        <CardContent className="relative pt-7 pb-6 px-6 text-center space-y-4">
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

          {/* Human-centered headline */}
          <h3 className="text-xl sm:text-2xl font-semibold text-foreground leading-snug px-2 tracking-tight">
            {totalPeoplePraying > 0 ? (
              <>
                <span className="text-foreground font-semibold">{totalPeoplePraying}</span>{" "}
                {totalPeoplePraying === 1 ? "person is" : "people are"} praying with you
              </>
            ) : (
              <>Hope is on the way</>
            )}
          </h3>

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
            className="text-primary gap-1.5 mt-1"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Hide Ripple Journey" : "View Ripple Journey"}
            <ChevronRight
              className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`}
            />
          </Button>
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

      {/* Collapsed list of individual prayer ripple cards */}
      {expanded && (
        <div className="space-y-6 animate-gentle-fade">
          <div className="text-center space-y-1.5">
            <h3 className="font-playfair text-xl flex items-center justify-center gap-2 text-foreground">
              <Waves className="h-5 w-5 text-primary" />
              Prayer Ripple
            </h3>
            <p className="text-sm text-muted-foreground">
              Your prayer is reaching others and growing
            </p>
          </div>

          {chains.map((chain) => {
        const isGrowing = chain.status !== "answered";
        return (
        <Card
          key={chain.prayerId}
          className="rounded-xl animate-gentle-fade"
        >
          {/* Calm card header */}
          <CardContent className="px-6 py-8 sm:px-8 sm:py-10 space-y-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground/70 font-medium text-center">
              Your prayer request
            </p>
            <p className="text-base sm:text-lg text-foreground leading-relaxed text-center font-serif">
              {chain.title}
            </p>

            {/* Status badge */}
            <div className="flex justify-center">
              <Badge
                variant="outline"
                className={
                  isGrowing
                    ? "border-primary/30 text-primary bg-primary/5"
                    : "border-accent/40 text-accent bg-accent/5"
                }
              >
                {isGrowing ? "Growing" : "Completed"}
              </Badge>
            </div>

            {/* Visual ripple flow */}
            <RippleFlow depth={chain.rippleDepth} unique={chain.uniquePeople} />

            {/* Single main line: people praying */}
            <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <Heart className="h-3.5 w-3.5 text-primary/60" />
              <span>
                {chain.uniquePeople > 0
                  ? `${chain.uniquePeople} ${
                      chain.uniquePeople === 1 ? "person is" : "people are"
                    } praying with you`
                  : "Your request has been shared. People will pray for you soon."}
              </span>
            </div>

            {/* Calm recent activity hint */}
            {recentlyPrayed(chain.lastPrayedAt) && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary/60" />
                <span>Someone prayed recently</span>
              </div>
            )}

            {/* Optional small ripple info (only if > 0) */}
            {chain.forwardCount > 0 && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Share2 className="h-3 w-3 text-primary/60" />
                <span>
                  Shared {chain.forwardCount}{" "}
                  {chain.forwardCount === 1 ? "time" : "times"}
                </span>
              </div>
            )}

            {/* Forward button */}
            <div className="flex justify-center pt-1">
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
          </CardContent>
        </Card>
        );
          })}
        </div>
      )}

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
