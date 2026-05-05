import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PrayerRequestCard from "@/components/PrayerRequestCard";
import SharePrayerDialog from "@/components/SharePrayerDialog";
import { Heart, Share2, Sparkles, Loader2, Waves } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <h3 className="font-playfair text-2xl flex items-center justify-center gap-2 text-foreground">
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

            {/* Tiny stats row */}
            <div className="grid grid-cols-3 gap-2 text-center max-w-sm mx-auto">
              <div>
                <div className="text-lg font-semibold text-foreground">{chain.uniquePeople}</div>
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">People prayed</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-foreground">{chain.forwardCount}</div>
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Forwarded</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-foreground">{chain.rippleDepth}</div>
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Ripple depth</div>
              </div>
            </div>

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

            {/* Optional share metric (only if > 0) */}
            {chain.forwardCount > 0 && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Share2 className="h-3 w-3 text-primary/60" />
                <span>
                  Shared {chain.forwardCount}{" "}
                  {chain.forwardCount === 1 ? "time" : "times"}
                </span>
              </div>
            )}

            {/* Calm recent activity hint */}
            {recentlyPrayed(chain.lastPrayedAt) && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary/60" />
                <span>Someone prayed recently</span>
              </div>
            )}

            {/* Milestone message */}
            {chain.prayedCount >= 5 && (
              <div className="bg-primary/5 rounded-lg p-3 text-center">
                <p className="text-sm text-primary font-medium italic">
                  {chain.prayedCount >= 25
                    ? "Your request has been carried in prayer by many across the community."
                    : chain.prayedCount >= 10
                    ? "Several people have joined in prayer for this request."
                    : "This prayer is being lifted up by the community."}
                </p>
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
