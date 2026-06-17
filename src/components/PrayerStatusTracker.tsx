import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  CheckCircle,
  MessageCircle,
  PartyPopper,
  Loader2,
  Sprout,
  Send,
  Globe2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import LivePrayerRipple from "@/components/LivePrayerRipple";
import { usePrayerPresence } from "@/hooks/usePrayerPresence";
import PrayerLocationsSheet from "@/components/PrayerLocationsSheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type PrayerStatus = "open" | "progress" | "answered" | "archived";

const PrayerStatusTracker = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [updateOpenFor, setUpdateOpenFor] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState("");

  // Fetch user's global prayer requests with coverage data
  const { data: myRequests, isLoading } = useQuery({
    queryKey: ["my_prayer_requests", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: requests, error } = await supabase
        .from("global_prayer_requests")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (error || !requests) return [];

      // Fetch coverage for each request
      const prayerIds = requests.map((r) => r.id);
      const { data: coverageData } = await supabase
        .from("prayer_coverage")
        .select("*")
        .in("prayer_id", prayerIds);

      const coverageMap = new Map(
        (coverageData || []).map((c) => [c.prayer_id, c])
      );

      // Fetch latest update per prayer
      const { data: updatesData } = await supabase
        .from("prayer_updates" as any)
        .select("prayer_request_id, message, created_at")
        .in("prayer_request_id", prayerIds)
        .order("created_at", { ascending: false });
      const latestUpdate = new Map<string, { message: string; created_at: string }>();
      ((updatesData || []) as any[]).forEach((u) => {
        if (!latestUpdate.has(u.prayer_request_id)) {
          latestUpdate.set(u.prayer_request_id, {
            message: u.message,
            created_at: u.created_at,
          });
        }
      });

      return requests.map((r) => {
        const coverage = coverageMap.get(r.id);
        const upd = latestUpdate.get(r.id);
        return {
          id: r.id,
          title: r.title,
          category: r.category,
          prayerCount: coverage?.current_prayers ?? r.prayer_count,
          uniquePeople: coverage?.unique_people_prayed ?? 0,
          passedForward: coverage?.passed_forward_count ?? 0,
          targetPrayers: coverage?.target_prayers ?? 3,
          status: r.status as PrayerStatus,
          createdAt: r.created_at,
          latestUpdate: upd?.message ?? null,
          latestUpdateAt: upd?.created_at ?? null,
        };
      });
    },
    enabled: !!user,
  });

  const setStatus = useMutation({
    mutationFn: async ({
      requestId,
      status,
    }: {
      requestId: string;
      status: PrayerStatus;
    }) => {
      const patch: Record<string, any> = { status };
      if (status === "answered") patch.answered_at = new Date().toISOString();
      const { error } = await supabase
        .from("global_prayer_requests")
        .update(patch)
        .eq("id", requestId);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["my_prayer_requests"] });
      const messages: Record<PrayerStatus, { title: string; description: string }> = {
        open: { title: "Marked as still needing prayer", description: "Your request is active again." },
        progress: { title: "Seeing progress", description: "Thank you for sharing the journey." },
        answered: { title: "Prayer answered", description: "Praise God! Your testimony encourages others." },
        archived: { title: "Archived", description: "Moved to your history." },
      };
      toast(messages[vars.status]);
    },
  });

  const postUpdate = useMutation({
    mutationFn: async ({ requestId, message }: { requestId: string; message: string }) => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("prayer_updates" as any).insert({
        prayer_request_id: requestId,
        author_user_id: user.id,
        source_type: "global",
        message,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my_prayer_requests"] });
      toast({ title: "Update shared", description: "Your update is visible to those who prayed." });
      setUpdateOpenFor(null);
      setUpdateMessage("");
    },
  });

  if (!user) {
    return (
      <div className="text-center py-8">
        <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">
          Sign in to see your prayer requests.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading your requests...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-playfair text-2xl font-bold text-foreground mb-2">
          Your Prayer Requests
        </h2>
        <p className="text-muted-foreground">
          See how your prayers are being carried by the community.
        </p>
      </div>

      {!myRequests?.length ? (
        <Card className="text-center py-8">
          <CardContent>
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              No prayer requests shared yet. You can share one above.
            </p>
          </CardContent>
        </Card>
      ) : (
        myRequests.map((request, index) => (
          <PrayerRequestRow
            key={request.id}
            request={request}
            index={index}
            setStatus={setStatus}
            postUpdate={postUpdate}
            updateOpenFor={updateOpenFor}
            setUpdateOpenFor={setUpdateOpenFor}
            updateMessage={updateMessage}
            setUpdateMessage={setUpdateMessage}
          />
        ))
      )}
    </div>
  );
};

type RequestItem = {
  id: string;
  title: string;
  category: string;
  prayerCount: number;
  uniquePeople: number;
  passedForward: number;
  targetPrayers: number;
  status: PrayerStatus;
  createdAt: string;
  latestUpdate: string | null;
  latestUpdateAt: string | null;
};

interface PrayerRequestRowProps {
  request: RequestItem;
  index: number;
  setStatus: any;
  postUpdate: any;
  updateOpenFor: string | null;
  setUpdateOpenFor: (v: string | null) => void;
  updateMessage: string;
  setUpdateMessage: (v: string) => void;
}

const PrayerRequestRow = ({
  request,
  index,
  setStatus,
  postUpdate,
  updateOpenFor,
  setUpdateOpenFor,
  updateMessage,
  setUpdateMessage,
}: PrayerRequestRowProps) => {
  // Live presence: counts others currently viewing this prayer (excludes self).
  const activeCount = usePrayerPresence(request.id);
  const queryClient = useQueryClient();
  const [showLocations, setShowLocations] = useState(false);

  // Live prayer count: when prayer_coverage updates for this prayer (someone
  // just prayed anywhere in the world), refresh the list so the count and
  // "last prayed" data update without a page refresh.
  useEffect(() => {
    if (!request.id) return;
    const channel = supabase
      .channel(`prayer-coverage:${request.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "prayer_coverage",
          filter: `prayer_id=eq.${request.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["my_prayer_requests"] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [request.id, queryClient]);

  return (
    <Card
      className={`animate-gentle-fade ${
        request.status === "answered" ? "bg-primary/5 border-primary/20" : ""
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="font-playfair text-lg">
                    {request.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{request.category}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(request.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                {request.status === "answered" && (
                  <Badge className="bg-primary text-primary-foreground gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Prayer answered
                  </Badge>
                )}
                {request.status === "progress" && (
                  <Badge variant="secondary" className="gap-1">
                    <Sprout className="h-3 w-3" />
                    Seeing progress
                  </Badge>
                )}
                {request.status === "archived" && (
                  <Badge variant="outline" className="text-xs">Archived</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Compact Live Prayer Ripple.
                  activeCount comes from Supabase Realtime presence — when 0
                  the component safely falls back to historical wording. */}
              <LivePrayerRipple
                activeCount={activeCount}
                totalCount={request.prayerCount}
                answered={request.status === "answered"}
              />

              {/* See who's praying — opens the same locations sheet used on the Ripple page. */}
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setShowLocations(true)}
                >
                  <Globe2 className="h-4 w-4" />
                  See who's praying
                </Button>
              </div>

              {/* Latest update preview */}
              {request.latestUpdate && (
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Latest update
                  </p>
                  <p className="text-sm text-foreground">{request.latestUpdate}</p>
                </div>
              )}

              {/* Status + update actions */}
              {request.status !== "archived" && (
                <div className="flex flex-wrap gap-2">
                  {request.status !== "open" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setStatus.mutate({ requestId: request.id, status: "open" })}
                      disabled={setStatus.isPending}
                    >
                      <Heart className="h-4 w-4" />
                      Still need prayer
                    </Button>
                  )}
                  {request.status !== "progress" && request.status !== "answered" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setStatus.mutate({ requestId: request.id, status: "progress" })}
                      disabled={setStatus.isPending}
                    >
                      <Sprout className="h-4 w-4" />
                      Seeing progress
                    </Button>
                  )}
                  {request.status !== "answered" && (
                    <Button
                      variant="peaceful"
                      size="sm"
                      className="gap-2"
                      onClick={() => setStatus.mutate({ requestId: request.id, status: "answered" })}
                      disabled={setStatus.isPending}
                    >
                      <PartyPopper className="h-4 w-4" />
                      Prayer answered
                    </Button>
                  )}

                  <Dialog
                    open={updateOpenFor === request.id}
                    onOpenChange={(o) => {
                      setUpdateOpenFor(o ? request.id : null);
                      if (!o) setUpdateMessage("");
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Share update
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="font-playfair">Share an update</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          A short note for those praying with you.
                        </p>
                        <Textarea
                          placeholder="Surgery went well. Thank you everyone..."
                          value={updateMessage}
                          onChange={(e) => setUpdateMessage(e.target.value)}
                          maxLength={500}
                          className="min-h-[100px]"
                        />
                        <Button
                          className="w-full gap-2"
                          disabled={!updateMessage.trim() || postUpdate.isPending}
                          onClick={() =>
                            postUpdate.mutate({
                              requestId: request.id,
                              message: updateMessage.trim(),
                            })
                          }
                        >
                          <Send className="h-4 w-4" />
                          Post update
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
      <PrayerLocationsSheet
        open={showLocations}
        onOpenChange={setShowLocations}
        prayerRequestId={request.id}
        sourceType="global"
        prayerCount={request.prayerCount}
        prayerTitle={request.title}
      />
    </Card>
  );
};

export default PrayerStatusTracker;
