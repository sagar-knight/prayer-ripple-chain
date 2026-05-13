import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PrayerRequestCard from "@/components/PrayerRequestCard";
import SharePrayerDialog from "@/components/SharePrayerDialog";
import { Heart, Share2, Sparkles, Loader2, Waves, CheckCircle2, Archive } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
        .in("status", ["open", "progress", "answered", "archived"])
        .order("created_at", { ascending: false })
        .limit(50);

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

/** Tiny inline ripple indicator for compact rows. */
const MiniRipple = ({ depth }: { depth: number }) => {
  const layers = Math.min(3, Math.max(1, depth || 1));
  return (
    <div className="flex items-center gap-1">
      <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
      {Array.from({ length: layers }).map((_, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="text-muted-foreground/50 text-[10px]">·</span>
          <span
            className="inline-flex h-2 w-2 rounded-full border border-primary/40"
            style={{ opacity: 1 - i * 0.2 }}
          />
        </span>
      ))}
    </div>
  );
};

type StatusFilter = "active" | "answered" | "archived" | "all";

const statusLabel = (status: string) => {
  if (status === "answered") return { text: "Answered", cls: "border-primary/30 text-primary bg-primary/5" };
  if (status === "archived") return { text: "Archived", cls: "border-muted-foreground/30 text-muted-foreground bg-muted/30" };
  return { text: "Growing", cls: "border-accent/40 text-accent bg-accent/5" };
};

const PrayerRow = ({
  chain,
  onForward,
  onViewRipple,
}: {
  chain: PrayerChainData;
  onForward: () => void;
  onViewRipple: () => void;
}) => {
  const badge = statusLabel(chain.status);
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 hover:bg-card/70 transition-colors px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-foreground truncate">{chain.title}</p>
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${badge.cls}`}>
            {badge.text}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Heart className="h-3 w-3 text-primary/60" />
            {chain.uniquePeople} praying
          </span>
          <span className="inline-flex items-center gap-1">
            <Share2 className="h-3 w-3 text-accent/70" />
            {chain.forwardCount} shared
          </span>
          <MiniRipple depth={chain.rippleDepth} />
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={onForward}>
          <Share2 className="h-3.5 w-3.5" />
          Forward
        </Button>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5" onClick={onViewRipple}>
          <Waves className="h-3.5 w-3.5" />
          View Ripple
        </Button>
      </div>
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
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const [rippleFor, setRippleFor] = useState<PrayerChainData | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("active");

  const isActive = (s: string) => s !== "answered" && s !== "archived";
  const activeChains = chains.filter((c) => isActive(c.status));
  const visible = activeChains.slice(0, 3);

  const filteredAll =
    filter === "all"
      ? chains
      : filter === "active"
        ? chains.filter((c) => isActive(c.status))
        : chains.filter((c) => c.status === filter);

  return (
    <div className="space-y-3 max-w-3xl mx-auto">
      {visible.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-4">
          No active prayer requests right now.
        </p>
      ) : (
        visible.map((chain) => (
          <PrayerRow
            key={chain.prayerId}
            chain={chain}
            onForward={() => setShareFor({ id: chain.prayerId, title: chain.title })}
            onViewRipple={() => setRippleFor(chain)}
          />
        ))
      )}

      {chains.length > visible.length && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" size="sm" onClick={() => setViewAllOpen(true)}>
            View All Prayer Requests ({chains.length})
          </Button>
        </div>
      )}

      {/* View All dialog with tabs */}
      <Dialog open={viewAllOpen} onOpenChange={setViewAllOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              All Prayer Requests
            </DialogTitle>
          </DialogHeader>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as StatusFilter)}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="answered">Answered</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            <TabsContent value={filter} className="mt-4 space-y-2">
              {filteredAll.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-6">
                  No prayers in this view.
                </p>
              ) : (
                filteredAll.map((chain) => (
                  <PrayerRow
                    key={chain.prayerId}
                    chain={chain}
                    onForward={() => setShareFor({ id: chain.prayerId, title: chain.title })}
                    onViewRipple={() => setRippleFor(chain)}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Single-prayer ripple detail dialog */}
      <Dialog open={!!rippleFor} onOpenChange={(o) => !o && setRippleFor(null)}>
        <DialogContent className="max-w-lg">
          {rippleFor && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base">{rippleFor.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="flex justify-center">
                  <Badge variant="outline" className={statusLabel(rippleFor.status).cls}>
                    {statusLabel(rippleFor.status).text}
                  </Badge>
                </div>
                <RippleFlow depth={rippleFor.rippleDepth} unique={rippleFor.uniquePeople} />
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xl font-semibold">{rippleFor.uniquePeople}</p>
                    <p className="text-[11px] text-muted-foreground">praying</p>
                  </div>
                  <div>
                    <p className="text-xl font-semibold">{rippleFor.forwardCount}</p>
                    <p className="text-[11px] text-muted-foreground">shared</p>
                  </div>
                  <div>
                    <p className="text-xl font-semibold">{rippleFor.prayedCount}</p>
                    <p className="text-[11px] text-muted-foreground">prayers</p>
                  </div>
                </div>
                {recentlyPrayed(rippleFor.lastPrayedAt) && (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-primary/60" />
                    <span>Someone prayed recently</span>
                  </div>
                )}
                <div className="flex justify-center pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      setShareFor({ id: rippleFor.prayerId, title: rippleFor.title });
                      setRippleFor(null);
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                    Forward Prayer
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

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
